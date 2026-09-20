# 公開検証結果

状態: **PUBLIC_RELEASED**。確認日: 2026-09-21 JST。

- Repository: https://github.com/Tooruda-crypto/oss-treasure-hunter-jp
- Pages: https://tooruda-crypto.github.io/oss-treasure-hunter-jp/
- 公開・実行したコードcommit: `b68d3d7535701bad8610031609a70a8fa8e0a4c9`
- 保存データcommit: `8fe0157730c5ad4636818b7d5ff4c6c1da53360f`
- この記録の追加commitでは実装・workflowを変更していません。

|項目|結果|
|---|---|
|SSH push|PASS。対象1repoの新規Ed25519 deploy keyを使用|
|CI|PASS。[実行記録](https://github.com/Tooruda-crypto/oss-treasure-hunter-jp/actions/runs/35518772085)。49テスト、check、build|
|日次workflow初回|PASS。[取得・保存・配信](https://github.com/Tooruda-crypto/oss-treasure-hunter-jp/actions/runs/35518885226)|
|実API|PASS。100件取得、95件評価、3件深掘り、11要求、SUCCESS。注目候補0件|
|保存・次回復元|PASS。[2回目](https://github.com/Tooruda-crypto/oss-treasure-hunter-jp/actions/runs/35518993145)。oth-data復元、ALREADY_COMPLETE、追加取得0件、再配信成功|
|Pages|PASS。HTTPS 200、JSON/Markdown/CSS/JS取得、保存JSONとの内容一致|
|公開ブラウザ|PASS。95件一覧、絞り込み、詳細、詳細再読込、画面表示|
|Secret scan|PASS。公開前58ファイル・60履歴blob、日次データ取得後63履歴blob、既知パターン検出0。記録追加後もcheck実施|
|定時cronの初回発火|NOT_TESTED。07:23 JST設定済み。手動起動で同一workflowを2回検証|
|スマホ実機・他ブラウザ・Windows|NOT_TESTED|

## 権限と費用

秘密鍵はローカルのRepository外に所有者限定で保存し、GitHubに登録したのは公開鍵だけです。Git通信ではその鍵だけを選び、公式GitHubホスト鍵を固定検証しました。PATは使用せず、不要な公開作業用PATはGitHub上から削除済みです。

CI・収集はcontents:read、データ保存jobだけcontents:write、Pagesだけpages:write/id-token:writeを使用します。日次収集のトークンはGitHub Actions組み込みの短期トークンです。deploy keyによる他repoへの認証・書込・管理操作はしていません。製品機能である公開OSSの検索・閲覧は実施しています。

GitHub Free、保存量0 GB / 0.5 GB、既存Actions予算$0・Stop usage Yesを画面で確認しました。標準ubuntu-24.04のみ、cacheなし、artifact保持1日です。初回artifactは61,729 bytesと47,250 bytes。**有料操作0件、課金設定変更0件、プラン変更0件**。無料枠と既存停止設定を変更していません。

[Actionsの料金条件](https://docs.github.com/en/billing/concepts/product-billing/github-actions)と[Pagesの利用条件](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)を確認しています。

## 残る確認と調査の限界

定刻の初回起動は未観測です。GitHub scheduleの遅延・省略、無活動による停止は運用上の制約です。国内競合、個別OSSの依存・商標、需要や支払意思は未検証のままで、商品化成功を保証しません。全95件を深掘り済みとは扱いません。
