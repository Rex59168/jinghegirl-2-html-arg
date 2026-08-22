# 音檔狀態

目前這個資料夾是空的——音效先不做。程式已經處理過這個情況：[scripts/endgame.js](../scripts/endgame.js) 裡的 `door_key.wav` / `door_hinge.wav` 找不到檔案時不會噴錯，時序（3 秒／1 秒／1 秒靜音）照樣跑，只是聽不到聲音，不影響測試跟正式使用。

之後要放音檔的時候：
1. 把檔案放進這個資料夾，檔名沿用 `door_key` / `door_hinge`（`.mp3` `.wav` 都可以）。
2. 到 [scripts/endgame.js](../scripts/endgame.js) 把 `new Audio('audio/door_key.wav')` 和 `new Audio('audio/door_hinge.wav')` 的副檔名改成新檔案的即可。
