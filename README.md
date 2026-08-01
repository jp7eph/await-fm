# await.fm

await.fm のポッドキャストページ (GitHub Pages ホスト)。

## 構成

- Vite + React + TypeScript
- Tailwind CSS v4
- エピソードは `episodes.json` で管理

## 開発

```sh
pnpm install
pnpm dev
```

## エピソード追加

`episodes.json` の `episodes` 配列にエントリを追加して push するだけ。

```json
{
  "title": "エピソードタイトル",
  "description": "説明文",
  "src": "https://open.spotify.com/embed/episode/<ID>?utm_source=generator"
}
```

## ビルド / 確認

```sh
pnpm build     # dist/ に生成
pnpm preview   # ローカルで表示確認
```

## フォーマット

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) (Oxc 製フォーマッタ) を使用。

```sh
pnpm fmt        # 整形
pnpm fmt:check  # チェックのみ
```

## デプロイ

main への push で GitHub Actions がビルドし、GitHub Pages (await.fm) に自動デプロイされる。

※ 初回のみ: GitHub のリポジトリ設定 (Settings → Pages) で Source を「GitHub Actions」に変更する必要がある。
