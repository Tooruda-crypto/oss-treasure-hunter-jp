# 手動市場情報

`config/manual.json` は公開可能な短い調査要約だけを入れる入力です。URLを自動取得する機能はありません。顧客名、メール、社内URL、秘密値、記事全文を記録しないでください。第三者記事の無断転載を避け、自分の短い要約と出典を記録してください。

```json
{
  "version": 1,
  "entries": [
    {
      "repository": "fixture-org/sample-000",
      "observedAt": "2026-09-20T00:00:00Z",
      "url": "https://example.org/research",
      "summary": "架空の入力例。実際の調査結果に置き換え、確認した範囲を明記する。",
      "commercial": "UNVERIFIED",
      "japanRelevant": true,
      "localizationGap": true,
      "competition": "UNVERIFIED"
    }
  ]
}
```

これは形式説明用の架空例です。製品には空のentriesを同梱しています。

commercial: `PRESENT` / `ABSENT_IN_REVIEWED_SCOPE` / `UNVERIFIED`。
competition: `FOUND` / `NONE_IN_REVIEWED_SCOPE` / `UNVERIFIED`。
任意risk: `MALWARE_SUSPECTED` / `REDISTRIBUTION_RESTRICTED` / `SOURCE_AVAILABLE`。

`ABSENT_IN_REVIEWED_SCOPE` / `NONE_IN_REVIEWED_SCOPE` を入力する際は対象サイト・確認日・調査範囲をsummaryに明示します。全市場で不存在という意味ではありません。90日超や未来の観測は根拠一覧には残りますが、採点へは使いません。不正な入力ファイルはProvider失敗として記録し、他の取得結果をPARTIALとして残します。
