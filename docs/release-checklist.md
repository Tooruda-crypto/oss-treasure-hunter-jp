# 最終公開ゲート

ユーザーが最終公開ゲートを承認しました。Repository名はoss-treasure-hunter-jp、Public、Apache-2.0を正式採用します。接続先アカウントはTooruda-cryptoです。下記は実行用チェックリストで、完了を意味しません。実測結果はRELEASE_STATUS.jsonとpublication-audit.mdに記録します。

## 公開候補の内容

- `src/`, `web/`, `scripts/`, `tests/`, `config/`, `templates/`
- `package.json`, `package-lock.json`, `.nvmrc`, `.gitignore`, `.env.example`
- README、LICENSE、THIRD_PARTY_NOTICES、SECURITY、CONTRIBUTING、`docs/`
- 実API結果の `data/` と `reports/daily/`
- 明示されたFixtureの `examples/` と `tests/fixtures/`
- `.github/workflows/ci.yml`, `daily-hunt.yml`, `pages.yml`

非公開のまま除外するもの: `.git/`の外部配布、作業root、原本PDF/実行指示全文、`work/`、`dist/`、`.env`、資格情報、個人パス、ブラウザプロファイル、raw取得本文。初回pushにはGit履歴が含まれるため、履歴も別途scanします。

## 公開前の確認事項

1. **owner/repository** とPublic公開範囲。GitHub上の既存Repositoryの場合は既存状態・ブランチ・保護設定・権利を読み取り確認する。
2. **Apache-2.0の正式採用（ユーザー承認済み）**。`LICENSE` とpackage/lockのlicenseをApache-2.0へ揃える。npmへの公開は行わない。
3. 公開する実API結果とFixtureの分離、Secrets・個人情報・第三者本文の最終確認。
4. アカウントの無料保存枠と既存費用設定を読み取り確認。確認できなければ日次workflowは停止したままにする。
5. 最新のテスト・check・build結果を確認。未実施をPASSへ書き換えない。

## 承認後の操作

- 指定されたPublic Repositoryを作成または対象を確認し、そのURLをremoteへ設定する。
- 確定LICENSEを含む公開候補のcommitを作成・確認し、承認されたbranchへpushする。
- 公開Repositoryの標準runnerでCIを実行し、リモート試験として記録する。
- GitHub PagesのSourceをGitHub Actionsに設定。`github-pages` environmentをdefault branchに制限する。カスタムドメインは不要。
- 無料条件の確認後だけ `OTH_FREE_STORAGE_CONFIRMED=true`、公開内容承認後だけ `OTH_PUBLICATION_ENABLED=true` を設定する。
- Daily public surveyを手動実行し、認証付き実API取得、`oth-data`保存、次回復元、Pagesまで同一runの経路を確認する。同日seedでskipされる場合は翌日実行または手動実行時のforce入力を使う（要求上限は維持）。
- Pages URLで一覧、詳細直リンク、再読込、JSON/Markdown保存、最終成功日時、スマホ実機を確認する。
- Private vulnerability reportingを有効化し、報告窓口を確認する。
- 公開URL・実commit・実行日時・未検証事項を記録して初めてPUBLIC_RELEASEDへ進める。

外部公開はユーザーの直接承認に基づいて実行します。重大なコード不具合、公開Secret、取り込んだ第三者コードの権利不明、実行しようとする操作の費用不明があればHOLDにします。
