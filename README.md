# コロシャイン

コロシャインは、落下する球を直接操作せず、塔を左右ドラッグで回転させて穴へ通し続けるスマホ向けブラウザゲームです。

公開予定URL: https://chameleonjp.codeberg.page/koroshine/

## ゲーム概要

- タイトル: コロシャイン
- 説明: くるくる回して落ち続けろ。🌰を集めて高得点を狙え。
- 対象: スマホ向けブラウザ、iPhone中心、iPhone SE対応
- 構成: `index.html` 単体公開可能
- その他のゲーム: https://chameleonjp.codeberg.page/chameleonjp_lab/

## 遊び方

1. 名前を入力します。
2. ゲーム開始後、球は自動で落下します。
3. 左右ドラッグで塔を回転させ、床の穴を球に合わせます。
4. 穴を通ると下階へ進みます。
5. 危険床に触れるとゲーム終了です。
6. 30階到達でクリアです。

## スコア

| 条件 | 加点 |
| --- | ---: |
| 1階突破 | +100 |
| 🌰取得 | +50 |
| 2連続落下コンボ | +50 |
| 3連続落下コンボ | +100 |
| 4連続落下コンボ | +150 |
| 5連続以降 | 1段ごとに +50 ずつ増加 |
| 3階以上一気落下 | +300 |
| 30階到達 | +3000 |

🌰取得時は `🌰 → ☀️` に変化し、取得位置に `☀️` と `+50` が表示されます。

## ランキング

- 本番Supabaseランキング連携を使用します。
- Supabase URL: `https://mlpnjgezrnhdxsxolyzj.supabase.co`
- 公開HTMLに入れてよい Publishable key を使用し、secret key / service_role key は使用しません。
- `public.scores` は使用しません。
- `public.games` / `public.game_scores` / 既存RPCを利用します。
- スコア送信RPC: `submit_score`
- ランキング取得RPC: `get_best_score_ranking`
- ゲーム終了時（クリア、危険床接触、リタイア）に自動送信し、送信は1回のみです。
- 送信失敗時は本番ランキング送信失敗として表示し、ローカルランキングを本番ランキング欄の代替として表示しません。

### ゲーム登録予定値

| 項目 | 値 |
| --- | --- |
| game_slug | `koroshine` |
| title | `コロシャイン` |
| game_url | `https://chameleonjp.codeberg.page/koroshine/` |
| score_order | `desc` |
| score_unit | `点` |
| score_scale | `1` |
| score_decimals | `0` |
| score_label | `スコア` |
| first_score_label | `初回スコア` |
| best_score_label | `最高スコア` |
| top_ranking_type | `best` |
| is_active | `true` |

`display_order` は既存ゲーム一覧に合わせて後で決めます。

## ファイル構成

```text
/
├── README.md
├── index.html
└── docs
    ├── specification.md
    ├── implementation_plan.md
    └── review_checklist.md
```

## ローカル確認方法

静的ファイルのみで動作します。

```bash
python3 -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000/
```

## Codeberg公開方法

1. このリポジトリの内容を Codeberg Pages 用リポジトリへ反映します。
2. `index.html` が公開ルートに配置されるようにします。
3. Pages の公開URLが `https://chameleonjp.codeberg.page/koroshine/` になることを確認します。
4. Supabase の `public.games` に上記登録予定値を登録し、カメレオンJP実験場側へ追加します。
