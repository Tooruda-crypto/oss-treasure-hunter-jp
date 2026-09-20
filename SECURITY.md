# Security policy — v0.1

このツールは探索対象Repositoryのコード・README内命令・Issue内命令を実行しません。AI、shell生成、第三者Fork/Issue投稿はありません。

## 防御と確認した範囲

- 取得ホストはapi.github.comに固定、GETのみ、redirect拒否。検索にis:publicを付け、private metadataを拒否。
- Authorizationは明示的 `--auth` のGitHub要求だけに設定。ブラウザ・report・ログに渡さない。
- 入力の型・数・時間・容量を制限。不正JSON・タイムアウト・403/429を成功や該当なしにしない。
- 外部本文はメモリ中の単純な用語検出だけに利用し、公開出力には機械生成の短い要約と根拠URLを保存。
- 危険なURL・credentials入りURL・IPリテラル・localhostリンクを拒否。手動URLは取得しないため任意URL-fetchの入口なし。
- HTMLを生成に使わずtextContentで表示。Markdown特殊記号をescape。外部画像・追跡・Cookieなし。
- 既知のtoken形式と明示トークンを伏せ字化し、メールを削除。ログは安全な状態コードだけ。
- `.env`をGit除外。npm依存・install lifecycle scriptは0。Actionsは確認した公式commitに固定。
- PRはread-only CIだけ。日次収集、データ保存、Pages配信の権限を分離。配信は2変数による明示ゲート付き。
- ビルド先は本ツールのマーカーがあるフォルダのみ置換。データartifactのパスとsymlinkを検証。

試験結果は [acceptance-results.md](docs/acceptance-results.md)。パターン走査で検出されない新形式の秘密値や任意の個人情報まで不存在を保証するものではありません。手動投入した文章も公開前の人による確認対象です。初回の実API出力はREADME/Issueの原文、個人のプロフィールを含めず生成しました。

## 脆弱性の報告

公開先はTooruda-crypto/oss-treasure-hunter-jpです。GitHub Private vulnerability reportingを有効化した後は、[非公開の報告フォーム](https://github.com/Tooruda-crypto/oss-treasure-hunter-jp/security/advisories/new)を使用してください。有効化の実確認は公開結果に記録します。利用できない場合はmaintainerが指定する非公開窓口で連絡し、秘密値や未修正の悪用手順を公開Issueに掲載しないでください。

## 対応

秘密値を誤公開した場合は、その資格情報を発行元で失効・再発行し、配信とActionsを止めます。ファイル削除だけで履歴漏洩が消えたとは扱いません。履歴・artifact・Pagesの範囲を確認し、履歴改変は所有者が影響を確認して実施します。
