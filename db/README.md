# ローカル開発用DB

## seedの実行方法

animoraレポジトリのルートに移動し、下記のコマンドを実行する。

```sh
make seed
```

## seedの追加方法

`fixtures/`ディレクトリの下にある`*.yml`ファイルがデータベースのテーブル1つに対応する。
そこに対応するテーブル名のymlファイルを作成し、レコードを追記することでseedを追加できる。

## `db/`ディレクトリの保守について

基本的にテーブルを作ったら、`fixtures/`ディレクトリにファイルを作成することを推奨。（内容は空でも良い。）
空ファイルを置いた場合、seedの際にそのテーブルのレコードは全て削除される。
対応するファイルを置かなかった場合、seed後にそのテーブルのレコードが残ってしまう。
