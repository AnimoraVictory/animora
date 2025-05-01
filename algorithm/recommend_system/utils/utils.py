# ---------------------------------------------------------------------------------  #
#                              訓練を補助するutils                                     #
# ---------------------------------------------------------------------------------  #

# ライブラリのインポート
import os
import torch


# モデルの保存
def save_checkpoint(model, config, model_dir):
    """
    モデルの重みを保存する関数
    """
    dir = os.path.dirname(model_dir)
    if not os.path.exists(dir):
        os.makedirs(dir)
    checkpoint = {"model_state_dict": model.state_dict(), "config": config}
    torch.save(checkpoint, model_dir)


# モデルの読み込み
def resume_checkpoint(model, model_dir, device_id):
    """
    モデルの重みを読み込む関数

    Args:
        model(torch.nn.Module): モデル
        model_dir(str): モデルの保存先
        device_id(int): GPUのID(複数ある場合に有用)
    """
    state_dict = torch.load(
        model_dir, map_location=lambda storage, loc: storage.cuda(device=device_id)
    )
    # map_location: 保存されたデータを特定のGPUにロード
    model.load_state_dict(state_dict)


# CUDA(GPU)の設定
def use_cuda(enabled, device_id=0):
    """
    CUDA(GPU)を使用するかどうかを設定する関数
    """
    if enabled:
        assert torch.cuda.is_available(), "CUDA is not available"
        torch.cuda.set_device(device_id)


# 最適化アルゴリズムの選択
def use_optimizer(network, params):
    if params["optimizer"] == "sgd":
        optimizer = torch.optim.SGD(
            network.parameters(),
            lr=params["sgd_lr"],
            momentum=params["sgd_momentum"],
            weight_decay=params["l2_regularization"],
        )
    elif params["optimizer"] == "adam":
        optimizer = torch.optim.Adam(
            network.parameters(),
            lr=params["adam_lr"],
            weight_decay=params["l2_regularization"],
        )
    elif params["optimizer"] == "rmsprop":
        optimizer = torch.optim.RMSprop(
            network.parameters(),
            lr=params["rmsprop_lr"],
            alpha=params["rmsprop_alpha"],
            momentum=params["rmsprop_momentum"],
        )
    return optimizer
