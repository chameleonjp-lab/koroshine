# コロシャイン 実装計画書

## 実装前レビュー

今回の修正前に `index.html`、`README.md`、`docs/specification.md`、`docs/implementation_plan.md`、`docs/review_checklist.md` を確認した。

### 修正対象

- Supabaseランキング設定を本番値へ更新する。
- `submit_score` / `get_best_score_ranking` を使うランキング送信・取得処理にする。
- 送信失敗時にローカルランキングへ逃がさず、本番ランキング失敗として表示する。
- その他のゲームURLを `https://chameleonjp.codeberg.page/chameleonjp_lab/` にする。
- 30階到達仕様を文書に明記する。
- 3階以上一気落下ボーナスを850ms以内の3連続穴通過に合わせる。
- 🌰取得時の `+50` と `☀️` 表示を見やすくする。
- リタイア、危険床接触、クリアの終了理由を結果画面へ表示する。
- スマホ操作・状態管理・ランキング1回送信を再確認する。
- README、仕様書、実装計画、レビュー確認リストを更新する。

### 修正しない対象

- ゲーム名「コロシャイン」。
- 公開予定URL。
- 左右ドラッグのみの基本操作。
- 30階クリアの基本ルール。
- スコア項目（🌰 +50、1階突破 +100、コンボ、3階以上一気落下 +300、30階 +3000）。
- `index.html` 1ファイルで動く構成。
- npmやビルド環境を前提にしない構成。

## 修正計画

1. 現状レビュー
   - 既存のランキング設定が未設定で、RPC名も旧想定であることを確認する。
   - スコア・状態管理・スマホCSS・ドキュメントの差分を確認する。
2. 影響範囲確認
   - 変更対象は `index.html` とドキュメント4ファイルに限定する。
   - ゲームの見た目や基本ルールは必要最小限の表示追加に留める。
3. 実装
   - `RANKING_CONFIG` に Supabase URL / Publishable key / `submit_score` / `get_best_score_ranking` を設定する。
   - REST RPC 呼び出しを実装し、送信値を `p_display_name` / `p_game_slug` / `p_score` / `p_client_version` に統一する。
   - 結果画面で先に結果を表示し、送信中、成功・失敗、ランキング取得を順に表示する。
   - 一気落下ボーナスを850ms以内の3連続穴通過ごとに発生させる。
   - 🌰取得演出を取得位置の `☀️` と `+50` 表示にする。
   - 終了理由を結果画面に追加する。
4. 自己レビュー
   - `node --check` 相当でHTML内スクリプトの構文確認を行う。
   - `rg` で禁止・更新対象文字列を確認する。
   - `python3 -m http.server` で静的配信可能性を確認する。
5. ドキュメント更新
   - README、仕様書、実装計画、レビュー確認リストを本番ランキング仕様へ更新する。
6. 最終報告
   - 変更ファイル、不具合、送信仕様、取得仕様、スコア整合性、スマホ影響、性能影響、要実機確認を報告する。

## 影響範囲

- 変更: `index.html`
- 変更: `README.md`
- 変更: `docs/specification.md`
- 変更: `docs/implementation_plan.md`
- 変更: `docs/review_checklist.md`

## ランキング実装方針

- Supabase URL: `https://mlpnjgezrnhdxsxolyzj.supabase.co`
- Publishable key: `sb_publishable_drzcy0v97knU6FgjqSgBHw_0A9XPdFM`
- 送信RPC: `submit_score`
- 取得RPC: `get_best_score_ranking`
- `game_slug`: `koroshine`
- 送信値: `p_display_name`、`p_game_slug`、`p_score`、`p_client_version`
- secret key / service_role key は使用しない。
- `public.scores` は使用しない。
- 送信・取得は結果画面で1回のみ。
- ゲームループ中には通信しない。

## リスクと残作業

- iOS Safari実機でのピンチズーム、ダブルタップ拡大、下部ボタン操作は要実機確認。
- Supabase側の `public.games` 登録とカメレオンJP実験場側への追加は公開前に別途必要。
- `display_order` は既存ゲーム一覧に合わせて後で決める。

## ユーザープレイ体験改善 追加実装計画

今回の修正では、現行 `index.html` を先に確認し、ゲーム名、公開予定URL、左右ドラッグ操作、30階到達クリア、既存スコア、Supabase RPC、ランキング送信・取得1回制御、単一HTML構成を変えずに、プレイ中の見え方と結果画面の納得感だけを改善する。

### 触る関数・要素

- `reset()`
  - `pendingFinish`、失敗位置、フィードバック文言などの追加状態を初期化する。
- `update(dt)`
  - 危険床接触時に即結果へ進まず、0.35秒の保留状態を経由する。
  - 850ms以上空いた一気落下予告を消す。
  - スコア加算条件と穴通過判定は変更しない。
- `draw()` / `drawFloor()` / `drawEffects()`
  - 現在階の穴だけ、ボール真下に近いときの光る補助をCanvasで描く。
  - コンボ表示、一気落下予告、失敗箇所の短い表示をCanvasに描く。
- `finish(won, reason)`
  - 終了理由、到達階、勝敗に応じた `resultComment` を設定する。
  - ランキング送信開始タイミングは結果画面遷移後のままにする。
- `submitAndFetchRankingOnce()`
  - 画面には短いユーザー向け失敗文言だけを表示し、詳細エラーは `console.warn` に留める。
- 結果画面DOM
  - プレイ評価コメント表示用の `resultComment` を追加する。

### 触らない処理

- Supabase URL、Publishable key、`submit_score`、`get_best_score_ranking`、送信パラメータ名。
- `gameSlug: koroshine`、`clientVersion`。
- ランキング送信1回・取得1回制御。
- 名前入力必須、名前の `localStorage` 保存、結果シェア、その他のゲームURL。
- 1階突破 +100、🌰 +50、コンボ加点、850ms以内の3連続穴通過 +300、30階到達 +3000。
- iPhone SE向けCSS、Canvas中心描画、npm不要の単一HTML構成。

### 影響範囲

- Canvas描画に現在階の穴補助、コンボ・一気落下予告、失敗位置表示を追加するため、DOM更新は増やさない。
- 危険床失敗時のみ0.35秒の待機を挟むが、待機中は当たり判定、スコア加算、ランキング通信を行わない。
- ランキング失敗時の画面文言は短くなるが、結果画面、シェア、ランキング取得フローは維持する。

### 実装順序

1. 現行コード確認と変更箇所洗い出し。
2. 本計画を `docs/implementation_plan.md` に追記。
3. 現在階の穴の視覚補助を実装。
4. 危険床失敗時の0.35秒遅延表示を実装。
5. コンボ表示と一気落下予告を実装。
6. 結果コメントを実装。
7. ランキング失敗文言を短くし、詳細は `console.warn` に移す。
8. README、仕様書、レビュー確認リストを更新。
