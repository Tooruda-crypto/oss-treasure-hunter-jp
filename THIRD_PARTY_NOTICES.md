# Third-party notices and license review

確認日: 2026-09-20。対象は今回の公開候補ソース・lockfile・公式Actions定義・生成report。第三者OSSのソースコードや全文README/Issueは取り込んでいません。アプリ・テスト・buildのnpm依存は0件、同梱ライブラリも0件です。

## 本体のライセンス

本体はユーザーの最終公開ゲート承認によりApache-2.0を正式採用しました。[LICENSE](LICENSE) はApache Software Foundationの[Apache License 2.0原文](https://www.apache.org/licenses/LICENSE-2.0.txt)を変更せず収録しています。package.json/lockfileもApache-2.0です。`private: true` はnpmの誤publish防止です。権利者名を推測して著作権表示へ入れていません。

新規に書いたソースに第三者コードの取り込みを認めていないため、Apache-2.0と衝突するnpm依存ライセンスはありません。参照データ中の第三者の権利を本体ライセンスで上書きしません。

## 実行環境・開発時の外部ツール

Node.jsは別途インストールするランタイムで、本プロジェクトへバイナリを同梱しません。[Node.js LICENSE](https://github.com/nodejs/node/blob/main/LICENSE)は本体MITおよび構成要素の通知を含みます。Git/npmも既存環境のツールで、ここに再配布しません。

ブラウザ検証には既存のPlaywrightとChromiumを使いました。いずれも公開パッケージへ同梱しません。Playwrightは[Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE)、Chromiumの権利はその配布物に付随する通知に従います。`scripts/browser-test.js`のみ本プロジェクトの検証コードです。

## GitHub Actions

以下はいずれも公式actions組織がMITとして提供する外部Actionsです。workflowはソース複製ではなくcommit参照です。バージョン・commit・参照URLは [action-pins.json](docs/action-pins.json) に記録しています。

- checkout v7.0.1
- setup-node v7.0.0
- upload-artifact v7.0.1
- download-artifact v8.0.1
- upload-pages-artifact v5.0.0
- deploy-pages v5.0.1

各RepositoryのLICENSE API、現行release、固定commitのaction.ymlを確認しました。Node24実行、入出力と必要権限、setup-nodeのcache無効化を確認。upload-pages-artifactは内部で固定commit `bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` のupload-artifact v7.0.0を呼びます。Actionsに同梱された全推移依存のコード監査を行ったという意味ではありません。npm auditの0件は本プロジェクトの空のnpm依存グラフを対象とし、Actions・OS・Nodeの脆弱性不存在を保証しません。

## 調査対象のOSS・サービス・商標

調査対象のライセンス名、Repository識別子、件数、観測状態、出典URLは調査データとして扱います。元コード・画像・ロゴ・README全文・Issue全文は配布しません。短い要約は原文の抜粋ではなく定型の検出結果です。

Repository本体のライセンス、依存ライセンス、サービス規約、商標を分離表示します。権利不明の対象はBLOCKED。MIT/Apache/MPL/GPL/AGPLを商用禁止／無条件安全と一括判定しません。分類は作業義務の摩擦の目安です。確認先は [SPDX](https://spdx.org/licenses/)、[Apache公式](https://www.apache.org/licenses/LICENSE-2.0)、[GNU公式](https://www.gnu.org/licenses/)、[Mozilla公式](https://www.mozilla.org/MPL/2.0/)。

GitHubは第三者の商標です。本プロジェクトはGitHub公式製品・提携製品ではありません。元OSSの商品名・ロゴの再利用許可を判定しません。API利用は[GitHub API Terms](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms)に従い、制限回避・大量取得・作者への自動連絡を行いません。GitHub PagesはOSS紹介と無料の静的調査レポートだけに用います。
