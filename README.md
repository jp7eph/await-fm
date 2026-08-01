# await.fm

await.fm のポッドキャストページ (GitHub Pages ホスト)。

## 構成

- Vite + React + TypeScript
- Tailwind CSS v4
- エピソードは `src/episodes.json` で管理 (自動生成)

## 開発

[mise](https://mise.jdx.dev) でツールバージョン (node / pnpm / python) を固定している。pnpm コマンドは素の `pnpm` ではなく mise 経由で実行すること (バージョン不一致で失敗するため)。

```sh
mise install      # ツールをインストール (初回のみ)
mise run dev      # 開発サーバー起動
mise x -- pnpm <cmd>  # その他の pnpm コマンドは mise 経由で
```

## エピソード

エピソードは**配信するだけで自動的に反映**される (RSS を取得して `src/episodes.json` を生成)。

- `Update episodes` ワークフローが毎日 06:00 UTC に RSS を取得し、変更があれば commit + デプロイ
- 手動実行: Actions タブの `Update episodes` → Run workflow
- ローカルでも実行可能:

```sh
mise run episodes
```

### Spotify 連携

各エピソードには Spotify のエピソードページへのリンクと **embed プレイヤー**が自動で付く。ID は Web API ではなく、**RSS の `<link>` (podcasters.spotify.com の公開ページ)** に埋め込まれている全エピソードの `spotifyUrl` をスクリプトが抽出する (認証・Premium 不要)。

- 抽出に失敗した場合: リンクは RSS の URL のまま、再生はネイティブのカスタムプレイヤーにフォールバック
- カバーアート (`public/cover.jpg`) は固定アセットとしてリポジトリで管理 (変更時は差し替えてコミット)

### データソースの優先順位

1. RSS (anchor.fm) — プライマリ
2. Apple Podcasts lookup API — RSS 取得失敗時のフォールバック
3. podcasters.spotify.com のエピソードページ — Spotify ID の抽出 (RSS の `<link>` 経由)

## ビルド / 確認

```sh
pnpm build     # dist/ に生成
pnpm preview   # ローカルで表示確認
```

## フォーマット

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) (Oxc 製フォーマッタ) と [oxlint](https://oxc.rs/docs/guide/usage/linter.html) (Oxc 製 linter) を使用。

```sh
mise run fmt        # 整形
mise run fmt-check  # 整形チェックのみ
mise run lint       # oxlint (correctness は error で失敗、その他は警告)
```

## デプロイ

- `Deploy to GitHub Pages`: main への push でビルドし、GitHub Pages (await.fm) に自動デプロイ
- `Update episodes`: エピソード更新時にこのワークフローを dispatch する

※ 初回のみ: GitHub のリポジトリ設定 (Settings → Pages) で Source を「GitHub Actions」に変更する必要がある。
