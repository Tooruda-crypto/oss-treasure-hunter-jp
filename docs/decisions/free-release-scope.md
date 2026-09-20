# OTH-JP v0.1 無料公開版の実行範囲

基準は **OTH-JP-SPEC-001 v0.1**、今回の実行範囲・安全条件は **OTH-JP-START-001 Free GitHub Release v0.1** を優先します。ユーザーの直接指示を最優先します。初回準備では外部公開を禁止し、最終公開ゲートの承認後に指定のPublic Repositoryへの公開へ進みます。両文書を全文確認しました（SPECは45ページ）。内容を黙って変更せず、次の差分を採用しました。

|項目|今回の決定と理由|
|---|---|
|公開範囲|CLIソース、JSON/Markdown、静的閲覧画面。SaaS/MCP/Plugin/決済/通知/AI APIは実装しない|
|技術スタック|SPECの推奨TypeScript/pnpm/Zod/Vitest/React/Viteに代えてNode.js ES Modules、npm、明示スキーマ、node:test、ブラウザ標準DOM。ランタイム・開発npm依存0件とオフラインbuildを優先。CLI名と機能を維持|
|config|YAMLの代わりにJSON。標準パーサーだけで型・上限・未知キーを検証|
|LLM/Search|none + 手動市場調査のみ。OpenAI互換/Ollama/有料検索は実装対象外|
|日本向け調査|日本語README手掛かり＋手動の市場/競合入力。Qiita/Zennの自動取得・一般Web検索は未導入。利用条件未確認のスクレイピングを行わない|
|取得情報|metadataのlanguage/topics/時刻とREADME/LICENSE/限定Issue。Discussion、Release、言語別バイト数は今回自動取得しない。不存在とは扱わない|
|探索Track|複数検索条件をconfigに置く。上限で未実行の検索を明示。Star増加の時系列推定は未評価|
|一次評価100件|100件Fixtureで再現。別途匿名実APIでも100件一次評価・3件深掘りを実証。100件すべての深掘りではない|
|採点配分|20/20/20/15/15/10を維持。根拠不足はnull。具体的な加点規則はscoring.md。根拠の弱い項目の満点付与を避ける|
|Top 10|十分な評価範囲を持つREADY/VALIDATE候補のみ最大10。LOW_SIGNAL/BLOCKEDは分離|
|履歴|UTCの日次キー、30日/10 MBのいずれか先に到達する上限。無期限の新発見履歴ではなく直前成功との比較|
|キャッシュ|実行内の同一REST要求をメモリキャッシュ。生README/Issueをディスクキャッシュしない|
|本体ライセンス|最終公開ゲートでApache-2.0を正式採用。原文LICENSEとpackage/lockの宣言を統一|
|公開ゲート|ユーザーがoss-treasure-hunter-jp / Publicを承認。接続アカウントはTooruda-crypto。外部操作の実施状況はRELEASE_STATUS.jsonに記録|

原本照合用SHA-256:

- `OSS_Treasure_Hunter_JP_SPEC_v0.1.pdf`: `a3b7a21a75b818bef8649bea1ef973e955f803b115af26a3085f64a7ca7a39d4`
- `OTH_JP_START_001_Free_GitHub_Release_v0.1.txt`: `4b4719dcb7195c6b21d6956cbd2977816b9d92a964776d105990b0c4603c4300`

原本はユーザー提供資料として保全し、公開候補には文書ID・ハッシュ・本差分を収録します。元PDFや開発指示全文を公開ファイルへ無断で複製しません。

初期監査: 作業フォルダに空の `work/` と `outputs/` のみ。Gitリポジトリ・remote・既存コード・テスト・依存定義なし。新規の子フォルダにローカルGitを初期化し、他プロジェクトは変更していません。
