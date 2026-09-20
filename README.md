# OSS Treasure Hunter JP v0.1

GitHubの公開OSSを限定調査し、日本向けの商品化仮説・根拠・ライセンス上の確認事項をまとめる、ローカル実行型のOSSです。

本体は **[Apache-2.0](LICENSE)** です。公開先は [Tooruda-crypto/oss-treasure-hunter-jp](https://github.com/Tooruda-crypto/oss-treasure-hunter-jp)、Pagesの配信先は `https://tooruda-crypto.github.io/oss-treasure-hunter-jp/` です。実際の公開・検証状態は [RELEASE_STATUS.json](RELEASE_STATUS.json) を参照してください。`private: true` はnpmへの誤公開を防ぐために維持しています。

English: A local-first, evidence-first OSS opportunity report generator for Japan. It uses bounded GitHub public REST requests, deterministic rules, and a static viewer. No paid API, hosted backend, AI API, tracking, or payment system is included. Ideas are hypotheses; missing evidence stays missing.

## できること

- configに指定した複数のGitHub検索条件から候補を収集し、metadataを一次評価。
- 上限内のREADME・LICENSE・Issue取得、重複・archived・fork・権利不明などの除外記録。
- 需要20・商用化20・日本市場20・ライセンス15・実現性15・収益化10の評価内訳と根拠。
- 手動の市場・競合調査を読み込み。未調査は `UNVERIFIED` のまま保持。
- AIなしのMVP仮説、日次JSON/Markdown、前日との変化、最大10件の注目候補。
- スマホ向け静的画面、8種の条件による絞り込み、詳細直リンク、ファイル保存。
- 失敗・中断時の前回成功データ保持、日次実行・保存・Pages配信のworkflow。

全GitHub・全Issue・日本の競合全体を網羅しません。Starsは得点に使用しません。信頼度は根拠充足の内部指標で、成功確率ではありません。未評価を除いた100点換算はしません。調査対象OSSを実行・Fork・変更しません。

## ローカル起動

必要なのは Node.js **24.19.0** と同梱npm、Gitです。アプリ・テスト・buildのnpm依存は0件です。Node配布物は利用者のOSに対応した公式版を使用してください。

ZIPから展開してGit管理されていない場合は、その展開フォルダで `git init -b main` を一度実行してください。`check` はGit履歴も走査します。新規ZIPには過去のGit履歴は同梱されていません。

```sh
cd oss-treasure-hunter-jp
npm ci --ignore-scripts --offline --no-audit --no-fund
npm test
npm run check
npm run build
npm run serve
```

表示は `http://127.0.0.1:4173`。サーバーはループバックだけにbindします。画面は配信済みの結果を読むためのもので、ブラウザから新しい探索は実行しません。

匿名の実API調査:

```sh
npm run hunt
npm run build
```

同日成功済みならAPIを呼ばず `ALREADY_COMPLETE` で終了します。明示的な再取得は `npm run hunt -- --force`。他のAPIキーが環境変数にあっても使いません。GitHubトークンは利用者が安全に環境変数 `GITHUB_TOKEN` へ設定し、`npm run hunt -- --auth` と指定した時だけ使用します。`.env`の自動読込は行いません。トークンをコマンド引数・設定JSON・ブラウザへ入れないでください。

設定は [config/default.json](config/default.json)。既定値は候補100件、一次評価100件、深掘り3件、Issue最大10件/Repo、要求最大30回、実行240秒、逐次実行、待機最大15秒、再試行1回です。これらは実行側の上限であり、GitHubからの割当を保証しません。実際のレスポンス制限が優先です。検索1ページの件数を検索条件数で配分します。複数ページ指定時などに全体上限へ到達すると後続条件は未実行になります。`scope.searched` と `scope.configuredQueries` を区別します。

## Fixtureデモと個別コマンド

```sh
npm run demo
node scripts/serve.js work/demo/site 4174
node src/cli.js analyze --input work/demo/bundle.json --fixture --root work/demo
npm run report -- --input data/latest.json --output work/latest.md
```

デモは架空100件・API要求0件です。`work/demo`だけに保存し、公開buildへの混入は既定で拒否します。`--fixture` はローカルデモbuildだけで使ってください。小さい実例は [examples/fixture-report.md](examples/fixture-report.md)、実APIの初回結果は [reports/daily/2026-09-20.md](reports/daily/2026-09-20.md) です。

`analyze` は `mode`・`observedAt`・`repositories` を持つ取得bundleを分析する低レベルCLIです。入力形式は `tests/fixtures/repos.js` を参照。生の取得bundleを公開リポジトリに保存しないでください。

## 出力と障害時の扱い

|場所|内容|
|---|---|
|`data/latest.json`|検証済みの最後の成功結果|
|`data/archive/YYYY-MM-DD.json`|日付単位の成功結果|
|`data/last-attempt.json`|最新試行の状態とエラーコード|
|`data/partial.json`|最新の部分取得結果（存在する場合）|
|`reports/daily/`|成功または部分取得Markdown|
|`dist/`|静的配信用build。Git管理対象外|

保存前にスキーマを検証し、latestは一時ファイルからrenameします。失敗・部分失敗はlatestを置き換えません。日付はUTC、workflowは07:23 JST予定です。最終成功から48時間超は画面に「未更新」を表示します。過去ファイルは30日以内かつ10 MB以内に制限し、容量が先に達した場合は古い履歴から削除します。Git履歴そのものの容量制限とは別です。

## 市場情報の手動入力

[docs/manual-research.md](docs/manual-research.md) の形式で `config/manual.json` に記録します。自動のQiita/Zenn/Web検索Providerは搭載していません。README内の日本語手掛かりのみ自動で調べます。公式Cloudの用語が見つからないことを「存在しない」と解釈しません。

## 公開・復旧・確認資料

- [基準文書と差分](docs/decisions/free-release-scope.md)
- [採点ルール・調査限界](docs/scoring.md)
- [試験結果と未実施項目](docs/acceptance-results.md)
- [公開チェックリスト](docs/release-checklist.md)
- [停止・復旧・再生成](docs/runbook.md)
- [無料運用の確認範囲](docs/cost-safety.md)
- [セキュリティ](SECURITY.md)、[第三者・ライセンス](THIRD_PARTY_NOTICES.md)

GitHub上のCI・Actions・Pagesの実動作は公開ゲート後の検証項目です。workflowは公開Repositoryと2つの明示的な有効化変数を要求し、初期状態では日次処理・配信が起動しません。
