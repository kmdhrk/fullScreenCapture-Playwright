# playwrite capture

## 環境構築
1. リポジトリをクローン


2. パッケージをインストール
`npm install` or `yarn install`

## 使い方
1. src/setting.tsにて設定

| 項目 | 使い方 | 型 |
| --- | --- | --- |
| domain | キャプチャ先のドメインを設定 | string |
| subDir | 複数ページのキャプチャの場合サブディレクトリを設定 | string[] |
| viewportWidth | キャプチャしたい画面幅を設定 | number[] |
| authInfo | Basic認証がある場合のログイン情報 | {user: string, pass:string} |

2. コマンドでキャプチャを実行
`npm run capture` or `yarn capture`

3. imgディレクトリに画像が保存されます

## 開発
captureコマンドを実行するとTypescriptもコンパイルされます。