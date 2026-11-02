# 固定SNSサムネイルと共有表示受入（2026-11-02）

## 内容と保持
- コロシャインの実 `makeStage(1)`、PAL、sectorPath/drawPlatform を生成ツールで抽出して1200×630紹介画像へ再構成。8分割/穴/4階の赤い危険帯/3階の栗と、実太陽の色・顔比率を使用。個人名・実成績は含めず、実プレイのスクリーンショットとは区別。
- 栗はインストール済 Noto Color Emoji の描画を埋込み（フォント配布なし、SIL Open Font License 1.1）。tools/social-glyph.json に出典。太陽/塔は実コード由来の図形。PNGのみ配信、SVG/ツール/資料は非配信。
- home/result の翻訳本文に正式タグ `#コロシャイン #ゲーム制作` を追加。現在結果の点数/階数、既存URL、名前非掲載、既存X失敗時コピーdialogを維持。独立copyボタンは新設しない。
- 採点/40階/物理/識別値/記録/効果音/開始集計/DBは変更しない。

## 検証の境界
- メタデータと15言語2タグ/現在結果/重複なし/280加重文字以内を RED→GREEN unit。全既存unit/locale/構文検査を併用。
- 新 tools/share-visual.cjs はHTMLをメモリへ読み、既存テスト同様に結果復元関数へのテスト専用参照だけをメモリに挿入。製品HTMLへテストAPIは追加しない。
- 匿名保存結果17階/12345点/リタイアを復元するfixture。実塔クリアや本番送信の確認ではない。
- 全HTTPはローカルHTML直接fulfill、ランキング空応答、X intent GET捕捉のみ。その他abort、Service WorkerとWebSocketを遮断。score/start呼出し0を検査。実外部投稿は行わない。
- Chromium/WebKit 各15言語×縦横×home/result=60で黒白X、44px、全rect viewport/overflow祖先内、中心hit、今回intent件数+1/本文、blocked fallback/結果不変を検査しPNG保存。非表示/親opacity0/部分clip/画面外のnegativeも維持。rootのみviewport座標を使用、3geometry回帰で通常clipの見逃し防止。
- CI動的検査とPNG実見は最終headで実施後PRに記録。全ページ画像であり常に初期viewportに全要素が同時表示されるという意味ではない。iPhone実機と同一ではない。

## 配信と再開
- 正式共有URL https://chameleonjp.codeberg.page/koroshine/ は維持。GitHub画像URLは既存移行先の配信準備で、登録切替/Codeberg更新/公開Xカード反映は今回未実施。
- 作業branch push検証を限定追加、Pages upload/deployはmain pushのみ。runner/権限/公開設定を変更しない。本人マージ後の配信commit/PNG/OGを別確認。
- 戻す場合は差分revert PR。既存名前/スコア/設定を消去する必要なし。

## 画像受入で発見した別UI問題
初回head0da9f48 CI41415101265は成功したが、WebKit PNGに匿名/pending0でも再送ボタンが見えた。既存buttonのdisplay:inline-flexがhidden属性の既定表示を上書きしていたため、ホーム未送信/結果再送の2 IDのhidden時だけdisplay:noneにする。通常の有効再送ボタン・イベント・送信条件は非変更。非表示CSS RED→GREEN、browserでhidden真=不可視/解除=可視/真へ復帰を直接確認する。これはX非表示原因修正ではない。
