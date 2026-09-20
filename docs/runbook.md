# 起動・停止・復旧

## 通常のローカル実行

```sh
npm run hunt
npm run build
npm run serve
```

`data/last-attempt.json` と `data/latest.json.lastSuccessAt` を確認します。同日成功済みなら取得をskip。再取得は `npm run hunt -- --force`。Fixtureと実データは同一rootへ混在させません。

## API障害・制限

403/429はヘッダーを尊重します。必要待機が設定を超えれば再試行せず停止。別経路で制限を回避しません。NETWORK_ERROR、INVALID_RESPONSE、HTTP_ERRORは「対象なし」と区別します。既存latestは保持し、可能ならpartialを別保存します。時刻・残量を確認し、適切な間隔を空けて手動再実行してください。

手動Providerの不正JSONはGitHub結果を消さずPARTIALへ。`config/manual.json`を形式に合わせ修正して再実行します。直前成功だけを配信し続ける場合も、last-attemptと未更新表示を残します。

## 中断・lock

実行中はroot直下の `.hunt-lock/owner.json` にPIDと開始時刻を保存します。同時起動は拒否します。正常終了・例外時はlockを解放します。強制killや端末断ではlockが残ることがあります。

該当PIDが実際に動いていないことをOSのプロセス一覧で確認し、そのrootの `.hunt-lock` だけを削除して再実行します。別rootや動いている実行のlockを削除しないでください。保存前に中断した一時 `.tmp` はGit除外対象です。latestを先に手作業で消さないでください。

## 再生成・データ破損

JSONまたは署名された出典の原文を推測で修復しないでください。既知の正常な日次JSONに対して `npm run report -- --input data/archive/YYYY-MM-DD.json --output work/recovered.md` で再生成できます。`node scripts/state.js validate work/state` は復元用stateを検証し、配信Markdownは検証済みJSONから再生成します。

latestが破損していた場合はファイルを隔離し、正常archiveのスキーマ・日付・modeを確認してlatestへ復元、または別の空rootに `npm run hunt -- --root work/recovery` で再収集します。古い生成物を消す前に復元buildを検証してください。

## GitHub日次運用（公開ゲート後のみ）

日次予定は22:23 UTC = 07:23 JST。定刻成功は保証しません。処理順序は:

1. default branchの検証済みコードをcheckout。
2. `oth-data` branchからdata/reportsを `work/state` に復元（初回は同梱実APIデータ）。
3. read-only tokenで取得、JSON検証、Markdown生成、build。
4. 同じrunの短期artifactを別jobが検証し、contents:writeで `oth-data` に保存。
5. 同じrunから `pages.yml` を呼び、pages:write/id-token:writeで配信。

GITHUB_TOKENのpushで別workflowが起動することを前提にしません。各jobに10/5/10分の上限とconcurrencyを設定しています。Pages失敗後もデータbranchが保存済みなら、次の手動実行で復元・再配信できます。

scheduleが動かない場合: default branch、2つの有効化変数、workflowの有効状態、Actions障害・遅延、権限、保存枠を確認します。公開Repositoryの60日無活動によるschedule無効化も確認します。必要なら所有者がworkflowを再有効化し、Actions → Daily public survey → Run workflowを実行します。最新runが緑でも、dataの最終成功日時と画面の最新試行状態を必ず確認します。PARTIALを完全成功とは扱いません。

停止は `OTH_PUBLICATION_ENABLED=false` またはworkflowを無効化します。これは公開後に所有者が行う運用手順です。本作業では設定を変更していません。

## 保持容量

通常30日・10 MBを上限とし、古い日次ファイルから削除。直前latestは消しません。単一結果自体が大きすぎる場合はSTORAGE_LIMITとして保存を止め、maxCandidates/deepLimitを縮小します。履歴branchのGitオブジェクトは自動では削除されないため、定期的にRepository容量を確認し、必要なら所有者の別承認で履歴整理を計画します。自動force-pushは実装していません。
