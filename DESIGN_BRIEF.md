# 視覺設計簡報 — 靖河市第四案

**收件者：負責 CSS 的 AI（Gemini）**
你只寫 `/styles/`。不要修改 HTML 結構、不要更動 class 名稱、不要新增 DOM。

---

## 這個網站是什麼

一個台灣的失蹤兒少協尋基金會的公開資料庫。它是一個真的在辦事的機構做的網站，2016 年前後外包給廠商，之後只有內容更新、沒有改版。

**它是一部恐怖作品，但它不能長得像恐怖作品。**

---

## 唯一的設計論點

> 整個網站存在的目的，是為了讓結局那一面紅色成立。

全站幾乎沒有顏色。所以最後那滿版的紅，是玩家在這個作品裡看到的第一個真正的顏色。

這一條決定所有其他決定。任何會讓網站「好看」「有氣氛」「有設計感」的東西，都在削弱結局。**乏味是本案的美術指導方向，不是偷懶。**

---

## 明確禁止

以下每一項都會毀掉這個作品，不要出現：

- 深色模式、暗底配霓虹色
- 米白／奶油色底 + 高對比襯線大標 + 陶土橘點綴
- 報紙感排版、細線分隔、大留白的雜誌風 hero
- 漸層、陰影、毛玻璃、圓角卡片、hover 放大
- 進場動畫、視差、打字機效果、滾動觸發動畫
- 任何「懸疑感」的裝飾：血跡、雜訊、故障效果、閃爍、監視器邊框
- 自訂 icon set、插畫、裝飾線條
- 任何超過 1.6 的行高，或任何看起來像 2024 年設計的東西

---

## 要的東西

### 色票（只有這些）

```
--paper      #ffffff   底
--ink        #1a1a1a   內文
--ink-weak   #666666   次要資訊、日期
--rule       #d4d4d4   表格線、分隔線
--link       #0645ad   連結（未訪問）
--link-seen  #551a8b   連結（已訪問）★ 一定要做
--chrome     #2b4c7e   頁首橫幅的機構藍
--end-red    #c8102e   只在結局出現，全站其他地方一次都不准用
```

狀態標籤是全站唯一有色塊的元素：

```
協尋中  底 #fff3cd  字 #664d03
已尋獲  底 #d1e7dd  字 #0f5132
已結案  底 #e2e3e5  字 #41464b
```

**◆ 這是本站的 signature：「已尋獲」是綠色的，不分死活。這個綠色必須看起來像任何一個政府網站上的「已完成」標籤。它的殺傷力全部來自於它有多正常。**

### 字體

```
--font-ui:   system-ui, "Noto Sans TC", "微軟正黑體", sans-serif
--font-mono: ui-monospace, "Courier New", monospace
```

沒有第三種字體。沒有 display face。不要載入 Google Fonts。

`--font-mono` 只用在 `.txt` 頁面與收藏頁 —— 那是他的東西，不是基金會的東西。**這是全站唯一的字體對比，也是唯一暗示「有另一個人在這裡」的視覺手段。**

### 版面

- 最大寬度 `72ch`，置中，兩側 `padding: 1rem`。
- 頁首：機構藍橫幅，左邊機構全名（純文字，不做 logo），右邊一顆捐款按鈕。橫幅高度不超過 64px。
- 麵包屑：`首頁 › 尋人資料庫 › JH-2026-004`，`--ink-weak`，12px。
- 案件頁用 `<table>`，`border-collapse: collapse`，1px `--rule` 橫線，只有橫線。
- 捐款按鈕：藍底白字，直角，`padding: 8px 16px`。每一頁都在同一個位置。
- 頁尾：三行小字（統編、地址欄位寫「本頁資料為虛構」、更新日期），`--ink-weak` 11px。

### 手機

單欄。表格改為 `label / value` 上下堆疊。頁首橫幅不收合、不做漢堡選單 —— 這種網站不會做。

---

## 結局頁（唯一可以放手的地方）

`.endgame-red`：`position: fixed`，滿版 `--end-red`，`z-index: 9999`。

- 上面沒有任何裝飾、沒有漸層、沒有 vignette。
- 四秒後右下角出現的那行字：`--font-mono`，11px，`rgba(0,0,0,.55)`，`margin: 0 16px 16px 0`。
- 不要讓它閃、不要讓它發光、不要加陰影。

`.endgame-black`：滿版 `#000`，同樣什麼都沒有。

---

## 品質底線

- 鍵盤 focus 一定要看得見（用 `outline: 2px solid var(--chrome)`，不要 `outline: none`）。
- `prefers-reduced-motion: reduce` 時關閉所有 transition。
- 對比度符合 AA。
- 不要用 `!important`。
- CSS 分檔：`tokens.css` / `base.css` / `layout.css` / `components.css` / `endgame.css`。

---

## 附錄：class 名稱（由實作端定義，只能沿用）

```
.site-header .site-header__name .site-header__donate
.site-nav              ← 橫幅下方的導覽列（首頁/關於我們/常見問題/聯絡我們），純文字連結，不要做 dropdown、不要 hover 底線以外的效果
.breadcrumb
.case-table .case-table__label .case-table__value
.status .status--searching .status--found .status--closed
.announcement .announcement__date .announcement__title .announcement__body
.file-view            ← .txt 頁面，等寬字
.file-view__up        ← 解鎖收藏後出現的 ".." 連結
.collection           ← 收藏頁，等寬字
.walk .walk__line .walk__question .walk__mute
.choice .choice__btn
.endgame-black .endgame-red .endgame-red__stamp
.site-footer
.gone
.case-list .case-list__item .case-list__id .case-list__name .case-list__filter   ← 首頁案件清單與狀態篩選下拉選單
.intro-form .intro-form__field .intro-form__label .intro-form__input .intro-form__textarea .intro-form__submit .intro-form__note   ← 序章表單
.data-table .data-table__row .data-table__cell   ← 徵信錄／二手賣場等橫向表格（沿用 case-table 的乾淨線條風格，不做斑馬紋）
.chatlog .chatlog__message .chatlog__time .chatlog__who .chatlog__text .chatlog__attachment   ← 015.txt 內的對話紀錄附件
.note-block            ← 市集頁窗景備註等單行小提示，比照 --ink-weak 處理（徵信錄那句「同一天同一金額連續三年」的提示已拿掉，改成直接放年度欄位讓玩家自己算）
.content-warning .content-warning__box .content-warning__title .content-warning__body .content-warning__continue   ← 進站告示全螢幕遮罩
.lang-switcher .lang-switcher__label .lang-switcher__option .lang-switcher__option--active   ← 頁尾旁的語言切換，三個純文字按鈕即可，不要做成下拉選單或國旗圖示
.admin-panel .admin-panel__state .admin-panel__button   ← 管理員測試用重置頁（#/admin，不對外連結），不算在「乏味即美術指導」的規範內，可以正常做成好用的除錯介面，不用刻意醜化
.trust-puzzle__input .trust-puzzle__feedback   ← 徵信錄頁的日期配對謎題，輸入框跟對錯符號
.notebook__button .notebook__badge .notebook__backdrop .notebook__panel .notebook__header .notebook__title .notebook__close .notebook__list .notebook__empty   ← 常駐筆記本抽屜（左下角按鈕＋滑出面板），這是易用性功能不是敘事的一部分，維持全站一致的乏味風格即可，不要做成花俏的側邊欄
```

補充說明給 Gemini：`.data-table` 與 `.chatlog` 是這次新增的資料型態（徵信錄橫表、對話紀錄），沿用 `.case-table` 的視覺語言（1px `--rule` 橫線、無底色）即可，不要另外設計一套表格風格。`.lang-switcher` 是機構網站少見的元素，但**不要**因此把它做得顯眼——一行小字、`--ink-weak`、目前使用中的語言用底線或加粗區分即可，不要用色塊。

---

## 交件時附一句話

說明你在哪一個地方**刻意做得比較醜或比較舊**，以及為什麼。如果你答不出來，代表這份簡報沒被執行。
