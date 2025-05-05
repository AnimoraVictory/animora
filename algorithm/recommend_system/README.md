### ディレクトリ構成
```
recommend_system/
├── app/                            # FastAPIアプリ（API本体）
│   ├── main.py                     # エントリーポイント
│   ├── api/                        # エンドポイント定義
│   │   ├── timeline.py             # /timeline 取得系API
│   │   └── retrain.py              # /retrain バッチ起動 or 手動学習用
│   ├── services/                   # 業務ロジック（中間層）
│   │   ├── recommend.py            # 推薦取得ロジック
│   │   └── new_post.py             # 新着投稿混ぜ込みロジック
│   ├── schemas/                    # Pydanticモデル（リクエスト・レスポンス）
│   │   ├── timeline.py
│   │   └── common.py
│   └── config.py                   # API設定（CORS, envなど）
│
├── batch/                          # バッチ用の推論・学習コード
│   ├── __init__.py
│   ├── extract_features.py         # ベクトル埋め込み生成（元: multimodal_feature_extractor）
│   ├── train.py                    # モデルの再学習（元: train_prod.py）
│   └── generate_recommendations.py# 全ユーザー推論とスコア保存
│
├── models/                         # 学習済みモデルの保存（.modelファイルなど）
│   ├── latest.model
│   └── checkpoints/               # バージョン付き保存
│
├── docker/                         # Docker関連
│   ├── Dockerfile
│   └── requirements.txt
│
├── scripts/                        # CLIで呼べるスクリプト群（upload/download用など）
│   ├── upload_model.py
│   └── download_model.py
│
├── utils/                          # 補助ライブラリ（DB接続や共通関数）
│   ├── database.py
│   ├── logger.py
│   └── config.py
│
├── notebooks/                      # Jupyterなどの分析用コード
│   └── check.ipynb
├── .env
└── README.md

```