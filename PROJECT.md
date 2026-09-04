# 《靖河市》ARG 專案文件（PROJECT.md）

給 AI coding agent／未來維護者讀。這份文件只記錄**架構與機制**（兩章各自怎麼運作、怎麼串接、檔案放在哪裡），不收錄劇本文字本身——劇本內容請直接讀對應頁面的原始碼，或翻 git 歷史（`PROJECT.md` 舊版曾經收錄過完整逐場劇本）。內容創作的硬性規則與已知技術踩坑另外寫在 [CLAUDE.md](CLAUDE.md)，兩份文件互補，改東西前建議都看一眼。

---

## 1. 這是什麼

一個部署在 GitHub Pages 的純靜態 ARG（另類實境遊戲）網站，網域 `https://rex59168.github.io/jinghegirl-2-html-arg/`。現況是**兩章合併在同一個 repo**：

| | 第一章 | 第二章 |
|---|---|---|
| 作品名 | 《靖河市協尋案》 | 《靖河市第四案》 |
| 位置 | `prequel/` 資料夾 | repo 根目錄 |
| 失蹤者 | 林晞 | 陳語安 |
| 由來 | 原本是獨立 repo（`jinghegirl-HTML-ARG`），這次由雲端 Claude session 重製後直接併入本 repo | 本 repo 原有內容 |
| 目前狀態 | 完整重製為「手機殼層模擬」介面 | 這次 merge 一併改成同樣視覺語言的手機殼層 |

兩章共用同一個部署網域、視覺語言（假手機瀏覽器殼層），但**程式碼各自獨立維護**，沒有 import 關係，只共用兩把橋接旗標的命名（見下節）。

---

## 2. 兩章銜接機制

- 玩家一律先進入第一章：根目錄 `index.html` 的 `<head>` 內有同步腳本，`localStorage` 沒有 `jh2bridge:prequel_done` 就 `location.replace('./prequel/index.html')`，搶在下面的 iframe 標籤被解析、開始預先載入內容之前先跳走。
- 唯一設定這把旗標的地方：`prequel/ending/index.html` 玩家點擊終幕「尋人資料庫・新增案件通知」信件連結時（`localStorage.setItem("jh2bridge:prequel_done", "1")`），同時觸發轉場動畫（「一年後」字卡）銜接進第二章的故事設定。
- 跨章節共用（不帶各自章節前綴）的旗標／鍵：
  - `jh2bridge:prequel_done` — 第一章完成度，供第二章 `index.html` 判斷要不要導去 `prequel/`
  - `jh2bridge:fullscreen_opt_in` — 全螢幕請求是否已取得玩家同意，兩章共用
  - `jh2bridge:ch1_boot_seen` — 第一章開機動畫（鎖定畫面）是否已看過
  - `sessionStorage` 的 `jh_nav_stack` / `jh_nav_controlled` — 站內導覽紀錄（取代原生瀏覽器歷史），兩章共用同一份
  - `jhAdminUnlocked` — `admin.html` 密碼門解鎖狀態，不受任一章「清空進度」按鈕影響
- **已知缺口**：根目錄 `home.html`、`intro.html` 等 iframe 內容頁本身不檢查 `jh2bridge:prequel_done`，只有殼層 `index.html` 檢查。理論上直接對 `home.html` 打網址可以繞過殼層與第一章直達第二章內容（沒有殼層包裝），但一般玩家不會知道要這樣做，目前未特別處理。

---

## 3. 第一章：《靖河市協尋案》(`prequel/`)

### 3.1 遊戲流程與旗標對照

依實際遊玩順序列出每一步對應的頁面與完成後設定的旗標（`jh1f_` 前綴，下同）：

| 步驟 | 頁面 | 完成時設定的旗標 | 備註 |
|---|---|---|---|
| 進站同意書 | `entry.html` | `warning_seen`, `entry_done`, `nickname`, `how_known` | 全站入口，第一次點擊即開始請求全螢幕 |
| 首頁 | `home.html` | — | `chapter-guard` 無限制，`ch0_done` 後更正「最後聯繫時間」顯示 |
| 序章：追蹤帳號 | `social/lin-xi.html` | `linxi_followed`, `album_unlocked`（相簿密碼門） | 密碼 `linxi0417`，由周妤在序章過關後私訊給玩家 |
| 序章：加好友 | `xunren/correction.html` | `zy_friend_added` | 周妤此後才出現在訊息聯絡人清單 |
| 序章過關 | （訊息串內確認線索） | `ch0_done` | `CLUE_REQUESTS.ch0_ask` |
| 第一章：相簿版本樹 | `social/img0431.html`（`data-requires="album_unlocked"`） | `ch1_done` | 找到光碟編號殘片 `#18_` |
| 第二章：書籤/舊帳號/舊聞 | `market/bookmarks.html`、`social/lin-zhao-2019.html`、`news/2022-report.html`（皆 `data-requires="ch1_done"`） | — | 揭露關鍵編號 `#188` |
| 第二章：黑膠列表 | `market/listing.html`（`data-requires="ch1_done"`） | `ch2_seen` → `ch2_done` | `#188` 那筆首次展開觸發，`QUICK_REPLIES.ch2_quickreply` |
| 第三章：對話記錄還原 | `chat/thread.html`（`data-requires="ch2_done"`） | `ch3_done` | 訊息重排謎題，資料來自 `assets/data/chat-thread.json` |
| 第四章：重建 8/14（5 個並行子任務） | `xunren/rebuild-0814.html` 及其連出的 `transit/query.html`、`transit/card-record.html`、`social/rec1029.html`、`xunren/zhouyu-chat.html`、`transit/location-share.html`（皆 `data-requires="ch3_done"`） | `ch4_t1`~`ch4_t5` → 全部完成後 `ch4_done` | 唯一由周妤主動傳訊息觸發的子任務是 `rec1029.html`（她能看到玩家在自己協尋站上的行為） |
| 第五章：誘導語句標註 | `chat/thread-review.html`（`data-requires="ch4_done"`） | `ch5_tags`, `ch5_done` | 12 則訊息分類進 6 大誘導手法 |
| 第六章：收藏清單 | `files/collection.html`（`data-requires="ch5_done"`） | `ch6_done` | `012.txt`（林晞）開啟時觸發 |
| 新聞：遺骸新聞 | `news/report.html` → `news/identified.html`（皆 `data-requires="ch6_done"`） | `news_done` | 確認遺骸為林昭（非林晞） |
| 終幕 | `ending/index.html`（`data-requires="news_done"`） | `jh2bridge:prequel_done` | 轉場「一年後」，銜接第二章案件通知信 |
| 隱私報告 | `ending/checkself.html`（`data-requires="news_done"`） | — | 顯示裝置資訊、累計停留時間，呼應「這些資料任何網站都拿得到」主題 |
| 求助資源 | `resources/help.html` | — | 不受章節限制，不掛假瀏覽器外框 |

### 3.2 localStorage 狀態鍵（`jh1f_` 前綴，`state.js` 統一存取）

| Key | 意義 |
|---|---|
| `nickname` / `how_known` | 進站表單填寫內容 |
| `warning_seen` / `entry_done` | 進站流程旗標 |
| `linxi_followed` | 是否追蹤林晞帳號（決定動態牆是否顯示她） |
| `album_unlocked` | 私人相簿密碼門是否解開 |
| `ch0_done` ~ `ch6_done` | 各章節完成旗標 |
| `ch4_t1` ~ `ch4_t5` | 第四章五個子任務個別完成旗標 |
| `ch2_seen` | 二手平台 `#188` 列是否已首次展開 |
| `ch5_tags` | 玩家對 12 則訊息的分類標註（物件，msgId→categoryId） |
| `zy_friend_added` | 是否已加周妤好友 |
| `phone_log` | 訊息 App 全部訊息紀錄 |
| `phone_read_ids` | 已讀訊息 id 清單 |
| `notebook` | 備忘錄（已蒐集線索）清單 |
| `news_done` | 確認林昭身分後設定 |
| `ending_seen` | 終幕是否已觸發轉場 |
| `file013_date` | 終幕 `013.txt` 的「已存在」日期（回溯效果用） |
| `survey_seen` | 假問卷是否已填 |
| `app_social_unlocked` / `app_market_unlocked` | 是否逛過社交媒體／二手平台（決定多工畫面卡片是否出現） |
| `app_social_last_url` / `app_market_last_url` | 該分頁上次停留頁面（多工切回時用） |
| `active_ms` | 累計實際在畫面前的時間 |
| `lang` | 目前語言（`zh-Hant`/`zh-Hans`/`en`） |
| `stats_entered_sent` / `stats_ending_sent` | GoatCounter 事件是否已送出過 |

### 3.3 章節鎖定機制（`chapter-guard.js`）

讀 `<body data-requires="xxx">`，若對應旗標未設定就導回 `home.html`。只擋「超前」存取——已解鎖的頁面永遠可以回頭複習。

### 3.4 手機殼層模擬機制（`prequel/assets/js/shell.js`，非 ES module 的 IIFE）

只在 `prequel/index.html` 執行一次，負責：
- 手機狀態列（時間、訊號/WiFi/電量裝飾圖示）
- Android 三鍵導覽列（返回／主畫面／多工）
- 多工切換畫面（固定卡片：訊息、備忘錄、網站；動態卡片：社交媒體、購物網，依是否逛過決定是否出現）
- 鎖定畫面／主畫面開機動畫（含 App 圖示：社交媒體、訊息、備忘錄、瀏覽器；裝飾用「相簿」圖示 `data-inert="1"` 無實際功能）
- 訊息 App（單一「周妤」聯絡人 + 4 個填充聯絡人；核心是 `CLUE_REQUESTS` 與 `QUICK_REPLIES` 兩套資料驅動的劇情推進表）
- 備忘錄 App（掛在殼層層級，`window.JHNotebook = { all: () => notebookList() }` 供線索模組讀取）
- 通知橫幅系統（`createNotifBanner()`，訊息／線索／加好友三種外觀相同、行為不同的橫幅）
- 全螢幕請求橋接（`window.requestFullscreenNow` 供 iframe 內頁面跨框呼叫）

假瀏覽器網址列邏輯獨立在 `assets/js/browser-chrome.js`。

### 3.5 線索／謎題機制（`clue-system.js` + `hint.js`）

- `clue-system.js`（`JHClueSystem.mount(opts)`）：把玩家已蒐集線索渲染成可選的「線索晶片」清單，玩家選一個提交，答對呼叫 `onCorrect`，答錯進入 10 秒冷卻。只掛載在殼層訊息串裡。
- `hint.js`（`JHPhone` 物件）：iframe 頁面呼叫的橋接層，三個 API（`push`／`pushClue`／`pushQuickReply`）都透過 `window.top[name](...)` 跨框呼叫殼層對應函式；`addZYFriend()` 用於加好友流程。

### 3.6 備忘錄與統計

- `notebook.js`（iframe 內純資料層）：`JHNotebook.add(id, text, href)` 寫入 localStorage，並跨框通知殼層更新角標/通知橫幅。與殼層自己補的 `window.JHNotebook`（`shell.js` 內）是兩份獨立實作、共用同一份資料、對外介面相容。
- `stats.js`：GoatCounter 匿名統計，`trackEntered()`/`trackEnding()` 各自只送一次。

### 3.7 三語系統

`prequel/assets/js/i18n.js`、`i18n-en.js`、`t2s-map.js`，與第二章 `scripts/i18n.js` 完全獨立（機制差異見 CLAUDE.md）。走「遍歷 DOM 文字節點＋屬性、`MutationObserver` 監看動態內容」的運行時全頁翻譯模式，不需要每頁手動呼叫翻譯函式。

### 3.8 Debug

`prequel/debug/index.html` 已淘汰，現在只是轉址頁（內容為「已搬移，請至 `/admin.html`」）。

---

## 4. 第二章：《靖河市第四案》（repo 根目錄）

### 4.1 這次 merge 改了什麼

原本是「`guard.enter()` + 直接 DOM render」架構，現在改成跟第一章同視覺語言、但獨立程式碼的手機殼層：

| | 原架構 | 現架構 |
|---|---|---|
| 首頁 | `index.html` 直接渲染內容 | `index.html` 變成純殼層（`<iframe src="home.html">`），實際內容搬到新建的 `home.html` |
| 殼層本體 | 無 | `scripts/shell.js`（ES module，`import { t } from './i18n.js'`） |
| 殼層 CSS | 無 | `styles/phone-shell.css`（整合狀態列/導覽列/主畫面/訊息面板/通知橫幅/假網址列樣式） |
| 假網址列 | 無 | `scripts/chrome.js` 新增 `mountBrowserChrome()`（併入既有檔案，非獨立新檔） |
| localStorage 前綴 | `jh4:` | 不變，沿用 `jh4:` |
| 開機/鎖定畫面 | 無 | 只有主畫面（`jh-boot__home`），沒有鎖定畫面，按 Home 鍵隨時可叫出 |
| 訊息 App | `scripts/mail.js` 完整 UI 元件 | UI 搬到殼層，`mail.js` 降級為純資料寫入層：`deliverLetter(id, letter, loc)` 寫入後 `window.top.jhReceiveLetter(...)` 跨框通知殼層 |
| 備忘錄 | 掛在 iframe 內容頁 | 不變，仍掛在 iframe 內（`scripts/notebook.js`），新增 `window.jhOpenNotebook = open` 供殼層跨框呼叫 |
| 線索/謎題模組 | 無 | 無——沿用舊有玩法（如 `trust.html`→`worksheet.html` 拼字謎題），未被此次改造觸及 |

`scripts/guard.js` 兩處 `location.href = 'index.html'` 已改成 `'home.html'`（因為 `index.html` 現在不含內容渲染邏輯）；`scripts/render.js` 的 `renderAdmin()`（約 100 行）整個移除，搬進 `admin.html` 內嵌腳本；`styles/components.css` 移除了未再使用的 `.admin-panel*`、`.mail__*`、`.case-list__*`、`.file-view__up` 等舊樣式段落。

### 4.2 現有頁面/腳本結構

```
/index.html               純殼層（iframe → home.html）
/home.html                原首頁內容（尋人資料庫案件列表等）
/intro.html               志工登錄表單（完成後導向 home.html）
/about.html /faq.html /contact.html /donate.html /privacy.html /accessibility.html
/trust.html /worksheet.html /archive2019.html /market.html /legacy.html
/collection.html /walk.html /gone.html /admin.html
/case/JH-2018-001.html … JH-2026-004.html（共 20 筆案件頁）
/file/001.html … /file/015.html
/styles/
  tokens.css base.css layout.css components.css endgame.css phone-shell.css
/scripts/
  store.js      進度儲存（localStorage / memory 兩種實作）
  i18n.js       t(value, locale) 三語解析
  flags.js      旗標與解鎖判定
  labels.js     全站共用、非劇透的 UI 字串
  chrome.js     畫 header/nav/breadcrumb/footer/lang-switcher + 假瀏覽器網址列（mountBrowserChrome）
  guard.js      每頁自己在 inline script 開頭呼叫（告示已讀＋暱稱檢查、finished 鎖死轉 gone.html）
  hash.js       sha256Hex(text)，供 worksheet.html 雜湊比對謎題答案
  render.js     各頁面的 DOM 渲染函式
  endgame.js    第六幕狀態機
  notebook.js   iframe 內容頁的常駐筆記本抽屜
  mail.js       純資料寫入層（deliverLetter），UI 已搬到殼層
  shell.js      根目錄殼層本體（ES module）
```

`main.js`、`router.js`、`data/content.json` 已刪除，不再存在（舊架構殘留）。

### 4.3 進度旗標與解鎖規則（`flags.js`，`jh4:` 前綴）

`store` 內存一個扁平物件：

```js
{
  nickname: "", howYouKnew: "", introCompletedAt: 0,
  seen: {},              // { "JH-2022-002": true, "file-007": true, "page-trust": true, ... }
  midUpdateFired: false, secondUpdateFired: false, collectionUnlocked: false,
  refusedCount: 0, finished: false,
  notebook: [], letters: [], trustPuzzleSolved: false
}
```

| 事件 | 條件 |
|---|---|
| 中段更新（林晞尋獲公告） | `seen` 內含 `JH-2026-004` 且任兩個舊案，且距 `introCompletedAt` 已過至少 2 小時真實時間（`flags.js` 的 `MID_UPDATE_MIN_DELAY_MS`） |
| 二次更新（JH-2026-004 摘要修正） | 中段更新已觸發，且 `legacy.html`、`015.txt` 都看過 |
| 收藏頁解鎖 | 三個 `.txt` 頁面（007/012/015）都看過 |
| 第六幕解鎖 | 收藏頁看完 + 徵信錄／存檔頁／二手快照三頁都看過 + 徵信錄謎題解出（`trustPuzzleSolved === true`） |
| 白屏封站 | `finished === true` 之後，任何頁面都導向 `gone.html` |

徵信錄謎題流程：`trust.html`（純展示）看完後透過 `mail.js` 送出一封不具名訊息 → 附「開啟比對表」連結（`target="_blank"`）另開新分頁進入 `worksheet.html`（實際核對，下拉選單比對，SHA-256 雜湊驗證答案）→ 設定 `trustPuzzleSolved`。

### 4.4 `admin.html` 測試面板

獨立深色終端機風格單頁，不依賴 `guard.js`/`chrome.js`/`render.js`，內嵌 `<style>`。

- 密碼門（`ADMIN_PW = "0803"`，非安全機制，只防誤觸），解鎖狀態存 `jhAdminUnlocked`（無章節前綴，兩章「清空進度」都不會洗掉）
- 第一章區塊：即時 dump 所有 `jh1f_` 開頭的 localStorage；「全部章節標記為已完成」一鍵設定 `ch0_done`~`ch6_done`+`news_done`；「清空第一章進度」；22 條快速跳轉連結（序章到終幕每一步）
- 第二章區塊：全部重置、略過序章、強制觸發中/二次更新、強制解鎖收藏頁/第六幕、直接跳到第六幕、清除已結束狀態

---

## 5. 視覺設計規範

### 第二章機構官網視覺（套用於 `home.html`、案件頁、機構制式頁面等 iframe 內容）

一個台灣失蹤兒少協尋基金會的公開資料庫視覺基調：正常維護、正常改版，看起來像 2020 年代還在營運的正牌 NGO 網站。一句話說清楚是虛構作品就夠了，其餘照真實機構網站標準做。不做任何「懸疑感」裝飾（血跡、雜訊、故障效果、閃爍、監視器邊框）；不做深色模式；全站不放真人照片。

色票：

```
--paper #ffffff  --surface #f4f6f9  --card-bg #ffffff
--ink #1a1a1a    --ink-weak #666666  --rule #e1e5ea
--link #1c5fd6   --link-seen #6a3ea1
--chrome #1c4e9e --chrome-dark #143a78（品牌藍，頁首/hero/按鈕）
--accent #e2711d --accent-dark #c25c11（強調橘，捐款等 CTA）
--end-red #c8102e（只在第六幕結局出現，全站其他地方一次都不准用）
```

狀態標籤（藥丸形狀）：協尋中（黃）／已尋獲（綠，不分死活——signature 效果）／已結案（灰）。

字體：`--font-ui: system-ui, "Noto Sans TC", "微軟正黑體", sans-serif`；`--font-mono` 只用在 `.txt` 頁面與收藏頁，維持「這是他的東西」的字體對比。CSS 分檔：`tokens.css`/`base.css`/`layout.css`/`components.css`/`endgame.css`。

第六幕結局頁（`.endgame-red`/`.endgame-black`）是唯一可以徹底放手的地方：不做音效，改用純 CSS 光線動畫（明滅→裂開→靜止）撐節奏，細節見各頁原始碼與 `endgame.css`。

### 手機殼層視覺（兩章共用語言，各自獨立 CSS 檔）

假手機狀態列、Android 三鍵、鎖定/主畫面、訊息氣泡、通知橫幅、假瀏覽器網址列。第一章樣式分散在 `prequel/assets/css/`（`shell.css`/`phone-boot.css`/`browser-chrome.css`/`clue-system.css` 等多檔）；第二章整合成單一 `styles/phone-shell.css`。

### 品質底線（兩章通用）

鍵盤 focus 一定要看得見（不要 `outline: none`）。`prefers-reduced-motion: reduce` 時關閉所有 transition。對比度符合 AA。不要用 `!important`。

---

## 6. 目前完成度與待決事項

**已完成**：第一章（`prequel/`）完整重製為手機殼層模擬介面並併入本 repo；第二章改用同一視覺語言的手機殼層包裝（`index.html`/`home.html` 拆分、`scripts/shell.js`、`styles/phone-shell.css`）；`admin.html` 重寫整併兩章測試功能；兩章橋接旗標 `jh2bridge:prequel_done` 生效。

**已知待確認事項**：
- 根目錄 `home.html`／`intro.html` 等 iframe 內容頁不檢查 `jh2bridge:prequel_done`，只有殼層 `index.html` 檢查（見「2. 兩章銜接機制」的已知缺口）——是否需要補強，尚未拍板。
- 圖片素材清單（`imageshoppinglist.md`）列出的社群貼文縮圖尚待實際尋找/上傳至 `prequel/assets/images/`，目前貼文照片仍是 emoji/CSS 色塊佔位符。
