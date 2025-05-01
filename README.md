# animalia

## backend

1. Notionから環境変数を取得し、プロジェクトのルートに `.env` ファイルを作成する。
2. go, dockerなど必要なツールを適宜インストールする。
3. 下記手順によってバックエンドを起動する。

### ローカルDBの使用手順

下記のコマンドによりdbを起動する

```sh
docker compose up db
```

vectorのテーブルが作成できないといったエラーが発生する場合、下記コマンドにより解決が可能する。

```sh
docker compose down -v db
docker compose up db
```

次に、ルートディレクトリにある.envファイルを編集し、環境変数`DATABASE_URL`を下記のように変更する。

```sh
DATABASE_URL="postgresql://myuser:mypass@db:5432/mydatabase?sslmode=disable"
```

最後に、下記コマンドによりバックエンドを起動すると、自動でマイグレーションが走り起動できる。

```sh
make run # detachして起動
make run-attach # attachして起動
```

### データベースにテーブルを作成する手順

下記のコマンドにより、ent schemaの雛形を作成する。

```sh
make create-model NAME=[モデル名]
```

例えば下のようなコマンドでは`User`というモデルが作成され、`users`というテーブルがPostgresに作成される。

```sh
make create-model NAME=User
```

`backend-go/ent/schema/[modelName].go`ファイルを編集し、テーブルのカラムを定義する。
具体的な記法は[公式ドキュメント](https://entgo.io/ja/docs/schema-fields/)を参照。

次に、下記のコマンドにより、ent schemaを生成する。

```sh
make codegen
```

これにより、`backend-go/ent/...`ディレクトリに諸々のファイルが作成される。

最後に、下記のコマンドによりapiを起動することで、自動でmigrationが走りテーブルが作成される。

```sh
make run
```

## algorithm

下記の手順により、アルゴリズムをデプロイ可能である。

1. AWS CLIを`animora`というプロファイルでセットアップする。

    ```sh
    aws configure --profile animora
    ```

2. 下記のコマンドによりcdkをインストールする。

    ```sh
    cd cdk
    npm i
    ```

3. 下記のコマンドを実行する。

    ```sh
    cd cdk
    cdk bootstrap --profile animora
    ```

4. 下記のコマンドを実行する。

    ```sh
    ./deploy.sh
    ```
