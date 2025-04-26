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
