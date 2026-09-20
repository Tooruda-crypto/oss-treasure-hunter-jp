# Contributing

Node.js 24.19.0で `npm ci --ignore-scripts --offline --no-audit --no-fund`、`npm test`、`npm run check`、`npm run build` を実行してください。

外部ネットワークなしのFixture回帰試験を基本とし、実API試験の件数・日時・認証モードを別に記録します。テストのために実在する作者へIssueや通知を送らないでください。Fixtureには架空であることを明示し、公開dataへ混ぜないでください。

基準文書IDと `docs/decisions/free-release-scope.md` に従い、採点変更時はバージョン・規則・根拠・比較結果を更新します。取得不明を「なし」に変更しないでください。有料Provider・会員・課金・常時サーバーはv0.1の対象外です。

依存を追加する場合は固定version、lockfile、ライセンス、脆弱性、install script、費用、必要性を先に確認します。第三者コードの取り込みは出典・著作権・LICENSEを保持し、THIRD_PARTY_NOTICESを更新します。

本体ライセンスはApache-2.0です。コントリビューションは[LICENSE](LICENSE)に従います。秘密値・私的な連絡先・第三者の全文資料をcommitへ含めないでください。
