# ---------------------------------------------------------------------------------  # 
#                                     NeuMFモデル                                     #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import torch
import torch.nn as nn
import torch.nn.functional as F
from recommend_system.utils.engine import Engine
from recommend_system.utils.utils import use_cuda, resume_checkpoint

class MultiModalNeuMF(nn.Module):
    def __init__(self, config, image_feature_dim, text_feature_dim):
        """
        Args:
            config (dict): モデルのハイパーパラメータ設定
            image_feature_dim (int): 画像特徴の次元数(例: 2048)
            text_feature_dim (int): テキスト特徴の次元数(例: 768)
        """
        super(MultiModalNeuMF, self).__init__()
        self.config = config
        self.num_users = config["num_users"] # ユーザー数
        self.num_items = config["num_items"] # アイテム数
        self.latent_dim_mf = config["latent_dim_mf"] # GMFの埋め込みベクトルの次元数
        self.latent_dim_mlp = config["latent_dim_mlp"] # MLPの埋め込みベクトルの次元数

        # ----------------------------------
        # Embedding Layers
        # ----------------------------------
        self.embedding_user_mlp = torch.nn.Embedding(num_embeddings=self.num_users, embedding_dim=self.latent_dim_mlp)
        self.embedding_item_mlp = torch.nn.Embedding(num_embeddings=self.num_items, embedding_dim=self.latent_dim_mlp)
        self.embedding_user_mf = torch.nn.Embedding(num_embeddings=self.num_users, embedding_dim=self.latent_dim_mf)
        self.embedding_item_mf = torch.nn.Embedding(num_embeddings=self.num_items, embedding_dim=self.latent_dim_mf)

        # ----------------------------------
        # マルチモーダル情報の前処理
        # ----------------------------------
        # 画像・テキスト特徴を低次元に変換する全結合層
        self.fc_image = nn.Linear(image_feature_dim, config.get("image_emb_dim", 16))
        self.fc_text = nn.Linear(text_feature_dim, config.get("text_emb_dim", 16))
        image_emb_dim = config.get("image_emb_dim", 16)
        text_emb_dim = config.get("text_emb_dim", 16)

        # ----------------------------------
        # MLP Layers: 投稿ID埋め込みと画像・テキスト情報を融合 -> ユーザーID埋め込みと結合
        # ----------------------------------
        # 投稿ID埋め込みと画像・テキスト情報を融合
        self.fusion_layer_mlp = nn.Linear(self.latent_dim_mlp + image_emb_dim + text_emb_dim, self.latent_dim_mlp)

        # ユーザーID埋め込み(latent_dim_mlp)と融合後の投稿埋め込み(latent_dim_mlp)を連結
        mlp_input_dim = self.latent_dim_mlp * 2
        mlp_layers = config.get("mlp_layers", [64, 32, 16, 8])
        self.mlp_layers = nn.ModuleList()
        input_dim = mlp_input_dim
        for layer_dim in mlp_layers:
            self.mlp_layers.append(nn.Linear(input_dim, layer_dim))
            input_dim = layer_dim

        # ----------------------------------
        # GMF Layers: 投稿ID埋め込みと画像・テキスト情報を融合して新たなアイテム表現を構築
        # ----------------------------------
        # 入力次元: 投稿ID埋め込み(latent_dim_mf) + 画像特徴(image_emb_dim) + テキスト特徴(text_emb_dim)
        self.fusion_layer_mf = nn.Linear(self.latent_dim_mf + image_emb_dim + text_emb_dim, self.latent_dim_mf)

        # ----------------------------------
        # 最終出力層: MLPとGMFの出力を連結し、スカラー値(予測スコア)を出力
        # ----------------------------------
        final_dim = input_dim + self.latent_dim_mf # MLPとGMFの出力を連結
        self.affine_output = nn.Linear(final_dim, 1)
        self.logistic = nn.Sigmoid()

        # 重みの初期化
        if config['weight_init_gaussian']:
            for sm in self.modules():
                if isinstance(sm, (nn.Embedding, nn.Linear)):
                    torch.nn.init.normal_(sm.weight.data, 0.0, 0.01)

    def forward(self, user_indices, item_indices, image_features, text_features):
        """
        Args:
            user_indices(torch.Tensor): ユーザーIDのテンソル(バッチサイズ, )
            item_indices(torch.Tensor): 投稿IDのテンソル(バッチサイズ, )
            image_features(torch.Tensor): 画像特徴のテンソル(バッチサイズ, image_feature_dim)
            text_features(torch.Tensor): テキスト特徴のテンソル(バッチサイズ, text_feature_dim)
        
        Returns:
            torch.Tensor: 予測スコア(バッチサイズ, 1)
        """
        # ----------------------------------
        # マルチモーダル情報の処理
        # ----------------------------------
        # 画像とテキストの特徴を低次元に変換し、非線形変換を適用
        image_emb = F.relu(self.fc_image(image_features)) # shape: (batch_size, image_emb_dim)
        text_emb = F.relu(self.fc_text(text_features)) # shape: (batch_size, text_emb_dim)

        # ----------------------------------
        # MLP Layers
        # ----------------------------------
        user_emb_mlp = self.embedding_user_mlp(user_indices) # shape: (batch_size, latent_dim_mlp)
        item_emb_mlp = self.embedding_item_mlp(item_indices) # shape: (batch_size, latent_dim_mlp)

        # 融合: 投稿ID埋め込み、画像特徴、テキスト特徴を連結し、全結合層で変換
        fused_item_mlp = torch.cat([item_emb_mlp, image_emb, text_emb], dim=-1)
        fused_item_mlp = F.relu(self.fusion_layer_mlp(fused_item_mlp)) # shape: (batch_size, latent_dim_mlp)

        # ユーザーID埋め込みと融合後の投稿埋め込みを連結
        mlp_vector = torch.cat([user_emb_mlp, fused_item_mlp], dim=-1)
        for layer in self.mlp_layers:
            mlp_vector = F.relu(layer(mlp_vector))

        # ----------------------------------
        # GMF Layers
        # ----------------------------------
        user_emb_mf = self.embedding_user_mf(user_indices) # shape: (batch_size, latent_dim_mf)
        item_emb_mf = self.embedding_item_mf(item_indices) # shape: (batch_size, latent_dim_mf)

        # 融合: 投稿ID埋め込み、画像特徴、テキスト特徴を連結し、新たな投稿表現を構築
        fused_item_mf = torch.cat([item_emb_mf, image_emb, text_emb], dim=-1)
        fused_item_mf = F.relu(self.fusion_layer_mf(fused_item_mf)) # shape: (batch_size, latent_dim_mf)

        # ユーザー埋め込みと融合後の投稿埋め込みを要素積で結合
        mf_vector = torch.mul(user_emb_mf, fused_item_mf)

        # ----------------------------------
        # 最終出力層
        # ----------------------------------
        final_vector = torch.cat([mlp_vector, mf_vector], dim=-1)
        logits = self.affine_output(final_vector)
        rating = self.logistic(logits)
        return rating

class MultiModalNeuMFEngine(Engine):
    def __init__(self, config):
        self.config = config
        self.model = MultiModalNeuMF(config, config["image_feature_dim"], config["text_feature_dim"])
        if config["use_cuda"] is True:
            use_cuda(True, config["device_id"])
            self.model.cuda()
        super(MultiModalNeuMFEngine, self).__init__(config)
        print(self.model)

        if config["pretrain"]:
            self.model.load_state_dict(torch.load(
                config["pretrain_model_dir"],
                map_location = torch.device("cuda" if config["use_cuda"] else "cpu")
            ))


