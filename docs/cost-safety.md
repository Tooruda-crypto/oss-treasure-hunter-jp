# 追加サービス費用0円の範囲

初回ローカル準備の確認日: 2026-09-20。この時点で実施したのはローカル計算、既存ツールによるテスト、GitHub公開APIの匿名GET、公式資料の閲覧です。有料API、支払い、プラン変更、課金設定変更、クラウド作成、Codespaces、GPU、有料runner、独自ドメイン、外部公開操作は0件です。既存のChatGPT等契約、端末、通信、電気代まで0円になるという主張ではありません。

## 設計上の制限

- LLM・有料検索・決済コードなし。APIキーが環境に存在するだけでは使用しない。
- GitHub匿名実行が既定。`--auth` は利用者のGitHub資格情報またはActions組み込みtokenだけ。
- Node/npm依存0件、install lifecycle scriptなし、build時ネットワークなし。
- `ubuntu-24.04` 標準GitHub-hosted runnerを使用。private Repositoryではjobをskip。
- CIはartifact/cacheを保存しない。setup-nodeの自動cacheも無効。
- 日次workflowは公開Repositoryかつ `OTH_PUBLICATION_ENABLED=true`、`OTH_FREE_STORAGE_CONFIRMED=true` が必要。
- state上限20 MB、静的site上限10 MB、artifact保持1日。通常state上限はconfigの10 MBでさらに抑制。1日1回が基本で、不要な手動連打をしない。
- 収集の要求・待機・時間・件数上限を越えたらPARTIAL/FAILED。別の有料Providerへ移行しない。
- 過去ファイルは日数と容量の両方で削減。Gitブランチの過去commitの増加は別途監視。

## 公開ゲートで残る確認

公開先はTooruda-crypto/oss-treasure-hunter-jpです。最終公開監査でGitHub Free、保存枠に余裕があること、既存のActions予算が追加支出を停止する設定であることを読み取り確認しました。課金設定は変更していません。この確認に基づき `OTH_FREE_STORAGE_CONFIRMED` をtrueにできます。無料条件が維持されなくなった場合は停止します。 これは今回のローカル実行に未確定費用が発生したという意味ではありません。

無料保存枠が使えない、他Repositoryが枠を消費する、保存量を確認できない場合は日次workflowを起動せず、ローカル収集・閲覧へ戻します。課金設定・有料プラン変更で解決しません。公開後も利用量の変化を確認し、条件を満たさなくなった場合は有効化変数をfalseにして停止します。

## 公式資料

- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions): 公開Repositoryの標準runner実行は無料。関連保存量の無制限無料とは扱わない。
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits): GitHub Freeの公開Repositoryで利用できる。無料の商用SaaS基盤として使わず、OSS紹介と静的レポートに限定。
- [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api): 一次・検索・二次制限、Retry-Afterとremaining/resetを尊重。

これらは公開直前にも再確認します。本ツールに支払手段を登録・変更する機能はありません。
