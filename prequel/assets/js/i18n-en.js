// i18n-en.js — 繁體中文 → English 對照字典
// key 是「原文文字節點,摺疊空白後」的樣子(見 i18n.js 的 normalizeWs),
// 少數用 JS 字串常量賦值、容器有 white-space:pre 的內容則直接用完整原文(含換行)當 key。
// JH_I18N_EN_PATTERNS 處理「固定文字 + 動態內容拼在同一個文字節點裡」的情況
// (例如日期/數字/玩家自訂輸入),用 regex 分離動態片段、遞迴翻譯固定片段。
const JH_I18N_EN = {
  // ── 進站一次性警語彈窗 ──────────────────────────────────────────
  "內容提醒": "Content Notice",
  "本站故事情節含失蹤、跟蹤等令人不安的描寫,為虛構創作,建議 15 歲以上瀏覽。如你正處於類似的真實處境,請撥打 110 / 113 尋求協助。":
    "This story involves disappearance and stalking that some may find disturbing. It is a work of fiction, recommended for ages 15+. If you are in a similar real situation, please call 110 / 113 for help.",
  "我了解,繼續": "I understand, continue",

  // ── 共用元件:假瀏覽器外框 / 筆記本 / 周妤的手機 ──────────────────
  "上一頁": "Back",
  "下一頁": "Forward",
  "重新整理": "Reload",
  "切換語言": "Language",
  "file:///C:/Users/rec_1029/收藏/": "file:///C:/Users/rec_1029/Collection/",
  "打開筆記本": "Open notebook",
  "筆記本": "Notebook",
  "【已知】": "【Known】",
  "關閉筆記本": "Close notebook",
  "還沒有已知事項。繼續往下看。": "Nothing confirmed yet. Keep reading.",
  "周妤傳訊息給你": "Zhou Yu sent you a message",
  "關閉": "Close",
  "問問她": "Ask her",
  "（沒有更多了）": "(No more for now)",
  "……怎麼了?卡住了嗎?": "…what's wrong? Stuck on something?",
  "周妤": "Zhou Yu",
  "周妤:": "Zhou Yu:",
  "← 回去看其他線索": "← Back to the other leads",
  "← 回協尋站首頁": "← Back to the search site home",
  "求助資訊": "Get help",
  "本站含失蹤、跟蹤等令人不適之情節,建議 15 歲以上瀏覽。如遇類似狀況請撥打 110 / 113。":
    "This site contains themes of disappearance and stalking that some may find disturbing. Recommended for ages 15+. If you are in a similar situation, please call 110 / 113.",
  "本站含失蹤、跟蹤等令人不適之情節,為虛構創作。":
    "This site contains fictional themes of disappearance and stalking that some may find disturbing.",
  "協尋林晞": "Find Lin Xi",
  "→ 最新進度": "→ Latest update",
  "→ 看一則新聞": "→ Read a news article",

  // 這些訊息由 JHNotebook.add() / JHPhone.push() 在各頁面寫入,跨頁共用同一份字典
  "她的瀏覽器書籤資料夾叫「找碟」,37 個書籤,兩年份的搜尋痕跡":
    "Her bookmark folder is called “Disc Hunt” — 37 bookmarks, two years' worth of search history",
  "河堤尋獲的遺骸經齒模比對,確認就是林昭——2022年失蹤,失蹤地點與尋獲地點有一定距離,疑似遭人移動棄置":
    "The riverbank remains were confirmed by dental comparison to be Lin Zhao — missing since 2022, the discovery site is some distance from where she was last seen, suggesting the body was moved",
  "沒事了,你回來吧。": "It's over. Come back.",
  "光碟編號確認是 #188": "Confirmed the disc's serial number: #188",
  "#188 於 2023/11/06 上架,兩年沒動過,留言 47 則賣家一則都沒回":
    "#188 was listed on 2023/11/06, untouched for two years, 47 comments and the seller never replied to one",
  "兩年,沒有降價,沒有下架,沒有回覆任何人。": "Two years. No price drop, no delisting, no reply to anyone.",
  "直到 2025 年 7 月,他回了第一則訊息。": "Then in July 2025, he replied for the first time.",
  "查看完整對話記錄 →": "View the full chat log →",
  "確認是 #188 了,我把完整對話記錄傳給你。": "Confirmed it's #188 — I'm sending you the full chat log.",
  "2022 年舊聞:林昭失蹤逾月,警方擴大協尋,調閱監視器與社群帳號紀錄追查":
    "2022 archived article: Lin Zhao missing over a month, police expanded the search, pulling surveillance footage and social media records",
  "河西段河堤尋獲一具身分不明的遺骸,警方朝他殺方向偵辦":
    "Unidentified remains found along the Hexi riverbank, police investigating as a homicide",
  "五件事都查完了,我們再讀一次那份對話。": "All five things are checked. Let's read that conversation again.",
  "她有跟周妤說要出門,但說得很含糊:「跟同學去買東西」":
    "She told Zhou Yu she was going out, but was vague about it: “going shopping with a classmate”",
  "最後訊號其實是 19:41(原公告寫 17:32)": "The actual last signal was 19:41 (originally reported as 17:32)",
  "密碼傳給你了,先去看看她的相簿。": "Sent you the password — go take a look at her album.",
  "約定成立:8/14 16:00,河西・文昌站 2 號出口,連鎖咖啡廳":
    "Meetup confirmed: 8/14 16:00, Hexi · Wenchang Station Exit 2, a chain coffee shop",
  "8/13 他說會塞車,把時間改成 17:30": "On 8/13 he said there'd be traffic and changed the time to 17:30",
  "約定確認了,我們來重建 8/14 那天。": "The meetup's confirmed — let's reconstruct 8/14.",
  "那兩個共同好友帳號,標點習慣跟錯字模式都跟 @rec_1029 一致——是同一個人":
    "Those two mutual-friend accounts match @rec_1029's punctuation habits and typo patterns — it's the same person",
  "他每次回覆間隔 8–12 分鐘,不是在忙,是刻意延遲,製造他不是隨時在等妳的錯覺":
    "He always replies within an 8–12 minute window — not because he's busy, but a deliberate delay to fake the impression he isn't always waiting for you",
  "這次妳應該看懂了。我這邊還有一個東西給你看。": "You should've caught it this time. I have one more thing to show you.",
  "林昭的檔案(007.txt)最後更新:2024/03/11——她 2022 年就失蹤了":
    "Lin Zhao's file (007.txt) last updated: 2024/03/11 — but she's been missing since 2022",
  "林晞的檔案(012.txt)建檔日期:2023/11/06": "Lin Xi's file (012.txt) created: 2023/11/06",
  "我……傳一則新聞給你,你自己看。": "I… I'm sending you a news article. See for yourself.",
  "她刪掉一則草稿:找到了,先不要跟媽說(但沒寫是什麼)":
    "She deleted a draft: “found it, don't tell Mom yet” (never said what “it” was)",
  "她在找一張光碟,編號只讀到 #18_(末位被裁掉)":
    "She was looking for a disc, serial only readable as #18_ (last digit cropped off)",
  "編號只到 #18_,去二手平台查查看。": "Serial only goes to #18_ — go check the resale marketplace.",
  "她開了定位分享,但只設定 17:00–19:00,19:00 一到就自動關閉":
    "She turned on location sharing, but only set it 17:00–19:00 — it auto-disabled the moment 19:00 hit",
  "她查過他的帳號:三年歷史、生活照、共同好友——看起來沒問題":
    "She checked his account: three years of history, everyday photos, mutual friends — looked fine",
  "他改時間的藉口(塞車)是提前一天傳的,路況其實正常":
    "His excuse for changing the time (traffic) was sent a full day ahead — the roads were actually clear",
  "她的限時動態第 4 則,時間戳是 19:41": "Her 4th story post, timestamped 19:41",
  "林昭 2019 年開箱貼文:她抽中的是靖河站限定 #188,JUN 簽名":
    "Lin Zhao's 2019 unboxing post: she won the Jinghe-stop exclusive #188, signed by JUN",
  "她 17:22 進站,19:38 出站的是興安站——不是約好的文昌站":
    "She entered at 17:22, but exited at Xing'an at 19:38 — not the agreed Wenchang Station",

  // ── index.html 首頁 ───────────────────────────────────────────
  "靖河市失蹤協尋網・由同班同學周妤架設": "Jinghe City Missing Persons Network · built by her classmate Zhou Yu",
  "這個網站不是官方的。我是她同班同學,警察那邊我也有報案,但他們動作很慢。 如果你看過她、知道任何事,拜託聯絡我。—— 周妤":
    "This site isn't official. I'm her classmate — I've already filed a police report, but they're moving so slowly. If you've seen her, or know anything, please contact me. — Zhou Yu",
  "協尋啟事": "Missing Person Notice",
  "姓名": "Name",
  "林晞(林同學)": "Lin Xi (classmate Lin)",
  "年齡": "Age",
  "17 歲,靖河高中 二年級": "17, 2nd year at Jinghe High School",
  "特徵": "Description",
  "黑長直髮,身高約 160cm": "Long straight black hair, approx. 160cm tall",
  "最後聯繫時間": "Last contact",
  "2025/8/14 17:32(社群最後發文)": "2025/8/14 17:32 (last social post)",
  "2025/8/14 19:41(已更正,原公告 17:32)": "2025/8/14 19:41 (corrected; originally reported as 17:32)",
  "最後所在地": "Last known location",
  "河西・文昌站附近": "Hexi · near Wenchang Station",
  "失蹤日期": "Date missing",
  "相關連結": "Related Links",
  "→ 她的社群帳號(留言區已關閉,動態還在)": "→ Her social account (comments disabled, posts still visible)",
  "→ 已釐清事項(隨時更新)": "→ Confirmed facts (updated regularly)",
  "→ 你發現資訊有誤?幫我們更正": "→ Found something wrong? Help us correct it",
  "已釐清事項(最新)": "Confirmed Facts (Latest)",
  "8/15 建站": "Site launched 8/15",
  "官方公告最後聯繫時間為 17:32。目前仍在確認中。": "Officials reported the last contact time as 17:32. Still being confirmed.",
  "看全部公告 →": "See all updates →",
  "本站為民間自發協尋頁面,非官方單位。": "This is a grassroots search page, not an official organization.",
  "若你或你認識的人正處於類似風險,請點此查看真實求助資訊": "If you or someone you know may be at risk, click here for real support resources",
  "河堤那具遺骸,確認是林昭。": "The remains found by the riverbank have been confirmed as Lin Zhao.",
  "看到他的收藏資料夾了。我不知道該說什麼。": "I saw his collection folder. I don't know what to say.",
  "重讀了一次對話,這次看懂了。那兩個共同好友帳號其實是同一個人假扮的。":
    "Re-read the conversation, and this time I understood it. Those two “mutual friend” accounts were actually the same person pretending to be two.",
  "重建了 8/14 那一天。她做對了五件事,還是出事了。": "Reconstructed that day, 8/14. She did five things right — and it still happened.",
  "拿到完整對話記錄。他們約在 8/14 文昌站見面,原本 16:00,後來改成 17:30。":
    "Got the full chat log. They arranged to meet at Wenchang Station on 8/14 — originally 16:00, later changed to 17:30.",
  "確認編號是 #188。這份光碟從 2023/11/06 掛在二手平台上,兩年沒人動過。":
    "Confirmed the serial number: #188. This disc has been listed on the resale site since 2023/11/06 — untouched for two years.",
  "晞晞在找一張光碟,只知道編號開頭是 #18_。": "Xi Xi was looking for a disc — all we knew was the serial started with #18_.",
  "已確認最後聯繫時間其實是 19:41,非先前公告之 17:32。":
    "Confirmed: the actual last contact time was 19:41, not the previously reported 17:32.",

  // ── debug/index.html ──────────────────────────────────────────
  "不顯示任何謎題答案,只用來跳關方便測試。": "No puzzle answers shown here — just quick links for testing.",
  "全部章節標記為已完成": "Mark all chapters complete",
  "清空所有進度(localStorage)": "Clear all progress (localStorage)",
  "快速跳轉": "Quick jump",
  "/index.html 首頁": "/index.html Home",
  "/social/lin-xi.html 序章謎題": "/social/lin-xi.html Prologue puzzle",
  "/xunren/correction.html 序章過關": "/xunren/correction.html Prologue cleared",
  "/editor/album.html 第一章密碼門": "/editor/album.html Ch.1 password gate",
  "/editor/img0431.html 第一章謎題": "/editor/img0431.html Ch.1 puzzle",
  "/market/listing.html 第二章二手平台": "/market/listing.html Ch.2 resale site",
  "/market/bookmarks.html 找碟書籤": "/market/bookmarks.html Disc-hunting bookmarks",
  "/news/2022-report.html 2022年舊聞": "/news/2022-report.html 2022 archived article",
  "/social/lin-zhao-2019.html 林昭舊帳號": "/social/lin-zhao-2019.html Lin Zhao's old account",
  "/chat/thread.html 第三章對話記錄": "/chat/thread.html Ch.3 chat log",
  "/xunren/rebuild-0814.html 第四章總覽": "/xunren/rebuild-0814.html Ch.4 overview",
  "/transit/query.html 第四章-1": "/transit/query.html Ch.4-1",
  "/transit/card-record.html 第四章-2": "/transit/card-record.html Ch.4-2",
  "/social/rec1029.html 第四章-3": "/social/rec1029.html Ch.4-3",
  "/xunren/zhouyu-chat.html 第四章-4": "/xunren/zhouyu-chat.html Ch.4-4",
  "/transit/location-share.html 第四章-5": "/transit/location-share.html Ch.4-5",
  "/chat/thread-review.html 第五章標註": "/chat/thread-review.html Ch.5 tagging",
  "/files/collection.html 第六章清單": "/files/collection.html Ch.6 file list",
  "/news/report.html 新聞:遺骸尋獲": "/news/report.html News: remains found",
  "/news/identified.html 新聞:確認身分": "/news/identified.html News: identity confirmed",
  "/ending/index.html 終幕": "/ending/index.html Ending",
  "/ending/checkself.html 你留下了什麼": "/ending/checkself.html What you left behind",
  "/xunren/updates.html 進度公告": "/xunren/updates.html Progress updates",

  // ── social/lin-xi.html ────────────────────────────────────────
  "17歲・靖河高中二年級": "17 · 2nd year, Jinghe High School",
  "照片": "Photo",
  "公告置頂": "Pinned",
  "帳號目前由親友暫時保管,留言功能已關閉。": "This account is currently being held by family/friends. Comments are disabled.",
  "雋今天生日快樂🖤 姐要是還在一定會轉發一百次": "Happy birthday Jun 🖤 if sis were still around she'd have reposted this a hundred times",
  "8/10・63 個讚": "8/10 · 63 likes",
  "模擬考結束了,終於可以睡覺": "Mock exam's over, finally I can sleep",
  "8/6・21 個讚": "8/6 · 21 likes",
  "← 回協尋站": "← Back to the search site",
  "發現時間對不上?幫忙更正 →": "Notice a time that doesn't match? Help us correct it →",
  "〔教室窗外〕": "〔Outside the classroom window〕",
  "終於放學。": "Finally out of school.",
  "〔手搖飲料〕": "〔Bubble tea〕",
  "今天犒賞自己一杯。": "Treating myself to one today.",
  "〔捷運出口・略模糊〕": "〔MRT exit · a bit blurry〕",
  "河西這邊路好多,第一次自己來。": "So many roads around Hexi, first time coming here alone.",
  "〔畫面昏暗〕": "〔Dim, hard to see〕",
  "到了。": "Here.",
  "〔畫面全黑〕": "〔Screen all black〕",

  // ── social/lin-zhao-2019.html ─────────────────────────────────
  "已停用帳號・存檔可見": "Deactivated account · archive visible",
  "這個帳號的主人 2022 年 9 月失蹤,至今未尋獲。以下是她生前公開的貼文存檔。":
    "This account's owner went missing in September 2022 and has not been found. Below is an archive of her public posts.",
  "這個帳號的主人 2022 年 9 月失蹤,遺骸已於今年 8 月尋獲確認。以下是她生前公開的貼文存檔。":
    "This account's owner went missing in September 2022; her remains were identified this past August. Below is an archive of her public posts.",
  "抽中了抽中了抽中了!!!!!!": "I WON I WON I WON!!!!!!",
  "靖河站限定藍光,而且是雋的簽名版本啊啊啊啊 這輩子運氣都用完了吧":
    "The Jinghe-stop exclusive Blu-ray, AND it's Jun's signed edition aaaahhh I think I used up all my luck for this life",
  "編號": "Serial No.",
  ",我要裱框(不是)": ", I'm framing this (jk)",
  "2019/11/23・": "2019/11/23 · ",
  "個讚": " likes",
  "晚點拍開箱給大家看,先讓我尖叫五分鐘": "I'll post the unboxing later, let me scream for five minutes first",
  "2019/11/23・89 個讚": "2019/11/23 · 89 likes",
  "拍好了 光碟殼有點刮傷但簽名超清楚 值了": "Got the photos! Case has a small scratch but the signature is crystal clear, so worth it",
  "2019/11/24・156 個讚": "2019/11/24 · 156 likes",
  "← 回二手交易區,確認編號": "← Back to the resale marketplace to confirm the serial",

  // ── transit/location-share.html ───────────────────────────────
  "定位分享": "Location Sharing",
  "設定紀錄・還原畫面": "Settings log · screen replay",
  "與「媽」分享位置": "Sharing location with “Mom”",
  "分享對象:媽": "Shared with: Mom",
  "分享時長:": "Duration: ",
  "2 小時": "2 hours",
  "開始時間:17:00": "Start time: 17:00",
  "結束時間:": "End time: ",
  "19:00(自動關閉)": "19:00 (auto-disabled)",
  "這件事是她媽媽後來跟我說的。她有開分享位置,兩個小時,17:00 到 19:00。 她大概覺得,兩小時,見個面、喝杯咖啡,怎麼樣都夠了。":
    "Her mom told me about this afterward. She did turn on location sharing — two hours, 17:00 to 19:00. She probably figured two hours would be plenty for meeting up and grabbing a coffee.",

  // ── transit/query.html ────────────────────────────────────────
  "靖河捷運": "Jinghe Metro",
  "時刻查詢・河西線": "Schedule lookup · Hexi Line",
  "路線圖": "Route Map",
  "青川": "Qingchuan",
  "興安": "Xing'an",
  "文昌": "Wenchang",
  "河景": "Hejing",
  "終點": "Terminus",
  "末班車時刻(河西線・往終點方向)": "Last Train Times (Hexi Line · toward Terminus)",
  "文昌站": "Wenchang Station",
  "末班 23:47": "Last train 23:47",
  "興安站": "Xing'an Station",
  "末班 23:52": "Last train 23:52",
  "轉乘河東線・末班": "Transfer to Hedong Line · last train",
  "17:30 前後班距約 4-6 分鐘,班次正常。": "Around 17:30, trains run every 4–6 minutes — normal service.",
  "當日路況回顧・8/13": "Traffic Review for That Day · 8/13",
  "河西往河東方向,17:00–18:00:順暢,無壅塞回報。": "Hexi to Hedong direction, 17:00–18:00: smooth, no congestion reported.",
  "他傳的這則訊息": "The Message He Sent",
  "「抱歉,明天好像會塞車,我們約晚一點好不好,17:30 可以嗎?」":
    "“Sorry, looks like there might be traffic tomorrow, can we meet a bit later — is 17:30 okay?”",
  "跟路況資料比對": "Compare with traffic data",
  "這則訊息我看過不知道幾次了。「明天好像會塞車」——聽起來就是很普通的一句抱歉,普通到我當初轉貼給大家看的時候,根本沒人多想。 可是查了路況才發現,那個時段根本沒塞車。他是提前一整天,就先想好要這樣說了。":
    "I've read this message more times than I can count. 'Looks like there might be traffic tomorrow' — sounds like such an ordinary apology, so ordinary that when I first shared it with everyone, nobody thought twice about it. But when I checked the traffic data, there was no congestion at all during that window. He wrote it a full day ahead — he'd already decided what he was going to say.",

  // ── transit/card-record.html ──────────────────────────────────
  "悠遊卡紀錄查詢": "EasyCard Record Lookup",
  "2025/08/14・單日明細": "2025/08/14 · single-day statement",
  "刷卡明細": "Tap Details",
  "你們約好的地點是文昌站 2 號出口。點下面清單中你覺得有問題的那一列。":
    "You'd agreed to meet at Wenchang Station Exit 2. Click the row below that looks off to you.",
  "文昌站,2 號出口。她到站了,人卻沒有出現在咖啡廳。 悠遊卡不會騙人——它只記錄你在哪裡刷過,不會記錄你為什麼在那裡。":
    "Wenchang Station, Exit 2. She arrived at the station — but never showed up at the café. An EasyCard doesn't lie. It only records where you tapped, not why you were there.",
  "跟約好的文昌站不一樣。": "Doesn't match the agreed Wenchang Station.",
  "周妤:我看到了。": "Zhou Yu: I see it.",
  "進站": "Entry",
  "出站": "Exit",

  // ── xunren/updates.html ───────────────────────────────────────
  "已釐清事項": "Confirmed Facts",
  "周妤持續更新": "Continuously updated by Zhou Yu",
  "公告": "Announcements",
  "建站。官方公告最後聯繫時間為 17:32。": "Site launched. Officials reported the last contact time as 17:32.",
  "晞晞在找一張光碟,只知道編號開頭是 #18_。她房間的相簿裡藏著這條線索,不知道她自己有沒有發現。":
    "Xi Xi was looking for a disc — all we knew was the serial started with #18_. The clue was hidden in the album on her computer; I don't know if she ever noticed it herself.",
  "確認編號是 #188。這份光碟從 2023/11/06 掛在二手平台上,兩年沒人動過,留言 47 則,賣家一則都沒回——直到今年七月。":
    "Confirmed the serial number: #188. This disc has been listed on the resale site since 2023/11/06 — two years untouched, 47 comments, and the seller never replied to a single one — until this July.",
  "拿到完整對話記錄。他們約在 8/14 文昌站見面,原本 16:00,後來他說塞車改成 17:30。":
    "Got the full chat log. They arranged to meet at Wenchang Station on 8/14 — originally 16:00, but he said there'd be traffic and changed it to 17:30.",
  "重建了 8/14 那一天。她做對了五件事——約在白天、約在公共場所、查過他的帳號、跟我說了、也開了定位分享。她還是出事了。":
    "Reconstructed that day, 8/14. She did five things right — met during the day, met in a public place, checked his account, told me about it, and even shared her location. It still happened.",
  "河堤那具遺骸,確認是林昭。我一直在想,如果我早一點意識到晞晞在做什麼就好了。":
    "The remains found by the riverbank have been confirmed as Lin Zhao. I keep thinking — if only I'd realized sooner what Xi Xi was doing.",
  "→ 繼續:重建 8/14 那一天": "→ Continue: reconstruct 8/14",
  "→ 繼續:再讀一次那份對話": "→ Continue: re-read that conversation",
  "→ 繼續:他的收藏資料夾": "→ Continue: his collection folder",

  // ── xunren/zhouyu-chat.html ───────────────────────────────────
  "我和她的對話": "My Conversation With Her",
  "8/14 當天・周妤提供": "That day, 8/14 · provided by Zhou Yu",
  "這是我跟她那天的對話紀錄。我一直在想,如果我那時候多問一句就好了。":
    "This is our chat log from that day. I keep thinking — if only I'd asked one more question.",
  "晞晞": "Xi Xi",
  "16:40・欸我等一下要出門一下": "16:40 · hey I'm heading out in a bit",
  "我": "Me",
  "16:41・去哪?": "16:41 · Where to?",
  "16:43・": "16:43 · ",
  "跟同學去買東西": "Going shopping with a classmate",
  "16:44・喔好,早點回家": "16:44 · Okay, come home early",
  "16:44・知道啦": "16:44 · I know",
  "她說得很含糊,但不是騙我。她只是不想被攔下來。 早知道我就多問一句「哪個同學」——現在想想,她連名字都沒提。":
    "She was vague, but she wasn't lying to me. She just didn't want to be stopped. I wish I'd asked 'which classmate' — thinking back now, she never even gave a name.",

  // ── news/report.html ──────────────────────────────────────────
  "靖河日報": "Jinghe Daily",
  "JINGHE DAILY・電子版": "JINGHE DAILY · Digital Edition",
  "社會": "Society",
  "靖河河堤尋獲不明遺骸 警方封鎖現場調查": "Unidentified Remains Found by Jinghe Riverbank, Police Cordon Off Site for Investigation",
  "記者 綜合報導・8/29": "Staff Report · 8/29",
  "靖河市警方昨(28)日下午接獲民眾通報,於河西段河堤草叢中尋獲一具遺骸,轄區警方獲報後已拉起封鎖線,通知鑑識人員到場採證,現場周邊道路一度交通管制。":
    "Jinghe City police received a report yesterday afternoon (the 28th) that remains had been found in the brush along the Hexi riverbank. Local police cordoned off the area upon arrival and called in forensic investigators to collect evidence; nearby roads saw temporary traffic control.",
  "警方初步研判遺骸已在該處一段時間,確切身分與死因尚待法醫相驗、比對確認,目前尚未對外公布相關細節。":
    "Police believe the remains had been at the site for some time. The exact identity and cause of death await forensic examination and confirmation; no further details have been released.",
  "知情人士透露,現場鑑識過程中同步採集了周邊土壤與植被樣本,不排除與鄰近轄區近年數起失蹤案件有所關聯,但警方對此不予證實。":
    "Sources close to the investigation say soil and vegetation samples were also collected at the scene, and a link to several recent missing-persons cases in the area has not been ruled out — though police declined to confirm this.",
  "轄區分局表示,已排除意外墜河的可能性,朝他殺方向擴大偵辦,呼籲民眾如有相關線索,請撥打 110 或逕洽靖河分局協助調查。本報將持續追蹤後續發展。":
    "The local precinct stated that accidental drowning has been ruled out, and the investigation is proceeding as a homicide. Anyone with relevant information is urged to call 110 or contact the Jinghe precinct directly. This paper will continue following the story.",
  "後續報導 →": "Follow-up report →",

  // ── news/2022-report.html ─────────────────────────────────────
  "JINGHE DAILY・電子版存檔": "JINGHE DAILY · Digital Archive",
  "社會・舊聞存檔": "Society · Archived Article",
  "本市女學生失蹤逾月 警方擴大協尋": "Local Female Student Missing Over a Month, Police Expand Search",
  "記者 綜合報導・2022/10/06": "Staff Report · 2022/10/06",
  "靖河市河東區一名林姓女學生(18歲)於上月初失蹤,家屬報案後警方多方尋找,迄今逾一個月仍無下落,警方已擴大協尋範圍,呼籲民眾提供線索。":
    "An 18-year-old female student surnamed Lin from Jinghe City's Hedong District went missing in early last month. Following a family report, police have searched extensively but she remains missing over a month later. Police have expanded the search and are asking the public for leads.",
  "據了解,林姓女學生失蹤前為應屆畢業生,平時生活單純,主要活動範圍在河東區住家與學校之間,失蹤前並無異狀,家屬對其突然音訊全無感到相當不解。":
    "According to sources, the student was a graduating senior with a simple daily routine, mostly moving between home and school in Hedong District. Nothing seemed unusual before she disappeared, and her family is at a loss over her sudden silence.",
  "警方表示,已調閱周邊路口監視器畫面,並持續透過該生手機及社群帳號活動紀錄追查其最後行蹤,呼籲若有目擊者或知情人士,請儘速與靖河分局聯繫。":
    "Police say they have pulled surveillance footage from nearby intersections and are tracing her last movements through her phone and social media activity. Anyone with information is asked to contact the Jinghe precinct as soon as possible.",
  "林姓女學生家屬透露,失蹤者平時個性內向,交友圈單純,實在想不出她可能去了哪裡,盼社會大眾協助留意,讓她早日平安返家。":
    "The family says she was introverted with a small circle of friends, and they truly cannot guess where she might have gone. They hope the public will help keep an eye out so she can return home safely soon.",
  "← 回二手交易區": "← Back to the resale marketplace",

  // ── news/identified.html ──────────────────────────────────────
  "社會・後續報導": "Society · Follow-up Report",
  "河堤遺骸身分確認 為 2022 年失蹤林姓女子": "Riverbank Remains Identified as Woman Surnamed Lin, Missing Since 2022",
  "記者 綜合報導・8/31": "Staff Report · 8/31",
  "警方今(30)日發布聲明,經法醫透過齒模比對確認,日前於河西段河堤尋獲的遺骸,身分為 2022 年 9 月失蹤的林姓女子(失蹤時 18 歲),死者家屬已於稍早獲得警方通知。":
    "Police issued a statement today (the 30th) confirming, via forensic dental comparison, that the remains recovered from the Hexi riverbank belong to a woman surnamed Lin who went missing in September 2022 at age 18. Her family was notified by police earlier today.",
  "警方表示,死者失蹤前最後出現地點,與此次尋獲遺骸地點有一定距離,不排除案發後遭人移動棄置,詳細案發經過與確切死亡時間仍待進一步調查釐清。":
    "Police stated that the location where the victim was last seen is some distance from where the remains were found, and have not ruled out the possibility that the body was moved after death. The full circumstances and exact time of death remain under investigation.",
  "據了解,死者失蹤前為應屆畢業生,平時與妹妹感情深厚。死者的妹妹於今年 8 月中同樣失聯至今未尋獲,家屬情緒難以平復,盼社會大眾若有相關線索儘速提供,協助警方釐清案情。":
    "According to sources, the victim was a graduating senior who was very close with her younger sister. That sister also went missing in mid-August this year and has not been found. The family remains deeply distressed and asks anyone with information to come forward to help police clarify the case.",
  "本案為靖河市近三年第二起女性失蹤後尋獲遺骸案件,警方表示不排除與其他懸案存在關聯,將擴大調查方向,不排除併案偵辦。":
    "This marks the second case in the past three years in Jinghe City where a missing woman's remains have later been recovered. Police say a connection to other unsolved cases has not been ruled out, and the investigation will be expanded, possibly to be combined with related cases.",
  "回到協尋林晞的網站 →": "Return to the Find Lin Xi site →",

  // ── ending/checkself.html ─────────────────────────────────────
  "你留下了什麼": "What You Left Behind",
  "以上全部沒有離開你的裝置,我們沒有存任何一筆。": "None of this ever left your device — we didn't save a single entry.",
  "但這些是任何一個網站都拿得到的。": "But this is exactly what any website can get.",
  "他不需要你告訴他任何事。": "He doesn't need you to tell him anything.",
  "瀏覽器語言": "Browser language",
  "時區": "Timezone",
  "螢幕解析度": "Screen resolution",
  "裝置類型": "Device type",
  "造訪時間": "Visit time",
  "累計停留時間": "Total time spent",
  "你當初在表單填的暱稱": "The nickname you entered in the form",
  "（未知）": "(unknown)",
  "行動裝置": "Mobile device",
  "桌機/平板": "Desktop/Tablet",

  // ── market/bookmarks.html ─────────────────────────────────────
  "書籤管理員 ── 資料夾:找碟(37)": "Bookmark Manager ── Folder: Disc Hunt (37)",
  "周妤把她手機備份出來的瀏覽器書籤匯出檔轉寄給你了。": "Zhou Yu forwarded you the browser bookmarks exported from her phone backup.",
  "書籤": "Bookmark",
  "網址": "URL",
  "加入日期": "Date added",
  "二手交易區・唱片週邊": "Resale Marketplace · Record Merch",
  "姐姐的舊帳號(存檔)": "Sister's Old Account (Archived)",
  "無法連線・此頁面已不存在": "Can't connect · this page no longer exists",
  "NOCTIS 官方後援會": "NOCTIS Official Fan Club",
  "【心得】LONG NIGHT 巡演回顧": "[Review] LONG NIGHT Tour Retrospective",
  "二手黑膠交流社團": "Used Vinyl Trading Group",
  "靖河跳蚤市場公告版": "Jinghe Flea Market Bulletin",
  "【問】誰有靖河站限定藍光": "[Ask] Anyone have the Jinghe-stop exclusive Blu-ray?",
  "NOCTIS 簽名真偽鑑定懶人包": "NOCTIS Autograph Authentication Guide",
  "【交換】用兩張黑膠換一張藍光": "[Trade] Two vinyls for one Blu-ray",
  "靖河二手店地圖總整理": "Jinghe Used Record Shop Map Roundup",
  "雋生日應援企劃連署": "Jun's Birthday Support Campaign Petition",
  "【開箱】終於等到補貨": "[Unboxing] Restock finally arrived",
  "NOCTIS 2019 巡演全場次總表": "NOCTIS 2019 Tour Full Venue List",
  "二手拍賣自介範本": "Resale Listing Self-Intro Template",
  "如何分辨黑膠翻版": "How to Spot a Bootleg Vinyl",
  "靖河跳蚤市場擺攤心得": "Jinghe Flea Market Vendor Tips",
  "NOCTIS 週邊代購揪團": "NOCTIS Merch Group Buy",
  "【心得】收藏十年的整理術": "[Notes] Ten Years of Collection Organizing Tips",
  "唱片行倒閉出清資訊彙整": "Record Store Closing Sale Info Roundup",
  "二手藍光片保存方法": "How to Store Used Blu-rays",
  "NOCTIS 應援色對照表": "NOCTIS Fan Color Reference Chart",
  "靖河站限定款式流出清單": "List of Leaked Jinghe-Stop Exclusive Variants",
  "【問卦】巡演限定盤真的很難找嗎": "[Ask] Are tour-exclusive editions really that hard to find?",
  "跳蚤市場擺攤申請表單": "Flea Market Vendor Application Form",
  "NOCTIS 全專輯歌詞本": "NOCTIS Complete Lyrics Booklet",
  "二手交易糾紛處理懶人包": "Resale Dispute Resolution Guide",
  "【心得】五年追星回顧": "[Notes] Five Years of Fandom Retrospective",
  "靖河站週邊商圈導覽": "Jinghe Stop Shopping District Guide",
  "唱片修復保養教學": "Record Restoration & Care Tutorial",
  "NOCTIS 巡演周邊全紀錄": "NOCTIS Tour Merch Complete Record",
  "二手黑膠估價工具": "Used Vinyl Pricing Tool",
  "跳蚤市場攤位地圖": "Flea Market Stall Map",
  "NOCTIS 十週年回顧特輯": "NOCTIS 10th Anniversary Retrospective Special",
  "限定盤收藏者交流版": "Exclusive Edition Collectors Board",
  "唱片行結業拍賣清單": "Record Store Closing Auction List",
  "二手平台賣家評價查詢": "Resale Platform Seller Review Lookup",

  // ── market/listing.html ───────────────────────────────────────
  "唱片・週邊 交易區": "Records & Merch Marketplace",
  "追蹤清單・NOCTIS 相關": "Watchlist · NOCTIS-related",
  "「好,我們來確認她到底在找哪一張。」——周妤": "“Okay, let's figure out exactly which one she was looking for.” — Zhou Yu",
  "你想起周妤提過:林昭 2019 年抽中限定盤的時候,好像有在自己帳號上曬過開箱。":
    "You remember Zhou Yu mentioning: when Lin Zhao won the exclusive edition back in 2019, she seemed to have posted an unboxing on her own account.",
  "→ 去她姐姐的舊帳號看看": "→ Check out her sister's old account",
  "周妤說晞晞的手機瀏覽器裡,有一個叫「找碟」的書籤資料夾,存了快兩年的搜尋紀錄。":
    "Zhou Yu said there's a bookmark folder called “Disc Hunt” in Xi Xi's phone browser, holding almost two years of search history.",
  "→ 看看她都存了什麼": "→ See what she saved",
  "篩選條件": "Filters",
  "專輯": "Album",
  "全部專輯": "All albums",
  "場次 / 版本": "Venue / Edition",
  "全部場次": "All venues",
  "靖河站限定": "Jinghe-stop exclusive",
  "首爾站限定": "Seoul-stop exclusive",
  "東京站限定": "Tokyo-stop exclusive",
  "高雄站限定": "Kaohsiung-stop exclusive",
  "曼谷站限定": "Bangkok-stop exclusive",
  "一般版": "Standard edition",
  "有無簽名": "Signed?",
  "不限": "Any",
  "有簽名": "Signed",
  "無簽名": "Unsigned",
  "簽名成員": "Signed by",
  "不限成員": "Any member",
  "JUN(雋)": "JUN",
  "LUNE(露恩)": "LUNE",
  "NOX(諾克斯)": "NOX",
  "VESPER(維斯)": "VESPER",
  "SOL(索爾)": "SOL",
  "KAI(凱)": "KAI",
  "RIEN(里恩)": "RIEN",
  "清除篩選": "Clear filters",
  "他也看得到你在找什麼。": "He can see what you're searching for too.",
  "賣家": "Seller",
  "上架日": "Listed",
  "最後更新": "Updated",
  "留言": "Comments",
  "上次上線": "Last online",
  "面交・議價": "Meet in person · Negotiable",
  "就是這份 —— 標記為找到了": "This is it — mark as found",
  "← 上一頁": "← Previous",
  "下一頁 →": "Next →",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray",
  "NOCTIS《LONG NIGHT》2019巡演 高雄站限定": "NOCTIS 《LONG NIGHT》 2019 Tour Kaohsiung-Stop Exclusive",
  "NOCTIS《AMBER RAIN》巡迴紀念盤(親筆簽名)": "NOCTIS 《AMBER RAIN》 Tour Commemorative Edition (Signed)",
  "NOCTIS《LONG NIGHT》2019巡演 一般版": "NOCTIS 《LONG NIGHT》 2019 Tour Standard Edition",
  "NOCTIS《LONG NIGHT》2019巡演 首爾站限定(含簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Seoul-Stop Exclusive (Signed)",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(JUN 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by JUN)",
  "NOCTIS《AFTERGLOW》巡迴紀念盤": "NOCTIS 《AFTERGLOW》 Tour Commemorative Edition",
  "NOCTIS《LONG NIGHT》2019巡演 東京站限定": "NOCTIS 《LONG NIGHT》 2019 Tour Tokyo-Stop Exclusive",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(NOX 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by NOX)",
  "NOCTIS《AS THE NIGHT FALLS》巡迴紀念盤(親筆簽名)": "NOCTIS 《AS THE NIGHT FALLS》 Tour Commemorative Edition (Signed)",
  "NOCTIS《PALE HOUR》巡迴紀念盤": "NOCTIS 《PALE HOUR》 Tour Commemorative Edition",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(VESPER 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by VESPER)",
  "NOCTIS《PALE HOUR》巡迴紀念盤(親筆簽名)": "NOCTIS 《PALE HOUR》 Tour Commemorative Edition (Signed)",
  "NOCTIS《LONG NIGHT》2019巡演 曼谷站限定(含簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Bangkok-Stop Exclusive (Signed)",
  "NOCTIS《AURORA VEIL》巡迴紀念盤(親筆簽名)": "NOCTIS 《AURORA VEIL》 Tour Commemorative Edition (Signed)",
  "NOCTIS《SOMNIA》巡迴紀念盤": "NOCTIS 《SOMNIA》 Tour Commemorative Edition",
  "NOCTIS《AMBER RAIN》巡迴紀念盤": "NOCTIS 《AMBER RAIN》 Tour Commemorative Edition",
  "NOCTIS《LONG NIGHT》2019巡演 東京站限定(含簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Tokyo-Stop Exclusive (Signed)",
  "NOCTIS《AS THE NIGHT FALLS》巡迴紀念盤": "NOCTIS 《AS THE NIGHT FALLS》 Tour Commemorative Edition",
  "NOCTIS《LONG NIGHT》2019巡演 高雄站限定(含簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Kaohsiung-Stop Exclusive (Signed)",
  "NOCTIS《MIDNIGHT ECHO》巡迴紀念盤": "NOCTIS 《MIDNIGHT ECHO》 Tour Commemorative Edition",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(KAI 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by KAI)",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(SOL 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by SOL)",
  "NOCTIS《AURORA VEIL》巡迴紀念盤": "NOCTIS 《AURORA VEIL》 Tour Commemorative Edition",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(LUNE 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by LUNE)",
  "NOCTIS《AFTERGLOW》巡迴紀念盤(親筆簽名)": "NOCTIS 《AFTERGLOW》 Tour Commemorative Edition (Signed)",
  "NOCTIS《LONG NIGHT》2019巡演 首爾站限定": "NOCTIS 《LONG NIGHT》 2019 Tour Seoul-Stop Exclusive",
  "NOCTIS《MIDNIGHT ECHO》巡迴紀念盤(親筆簽名)": "NOCTIS 《MIDNIGHT ECHO》 Tour Commemorative Edition (Signed)",
  "NOCTIS《LONG NIGHT》2019巡演 靖河站限定 藍光(RIEN 親筆簽名)": "NOCTIS 《LONG NIGHT》 2019 Tour Jinghe-Stop Exclusive Blu-ray (Signed by RIEN)",
  "NOCTIS《LONG NIGHT》2019巡演 曼谷站限定": "NOCTIS 《LONG NIGHT》 2019 Tour Bangkok-Stop Exclusive",

  // ── chat/thread.html ──────────────────────────────────────────
  "完整對話記錄・匯出檔": "Full chat log · exported file",
  "「這是我拿到的完整對話記錄,你自己看。」——周妤": "“This is the full chat log I got. Look for yourself.” — Zhou Yu",
  "有幾則訊息顯示為亂序": "A few messages appear out of order",
  "部分訊息被撤回或編輯過。點下面的訊息,再點要插入的位置,把它們還原成正確的時間順序。":
    "Some messages were recalled or edited. Tap a message below, then tap where it belongs, to restore the correct chronological order.",
  "你有沒有發現——他每次回覆的間隔,幾乎都精準落在 8 到 12 分鐘之間。一個半月來,從無例外。":
    "Did you notice — the gap between his replies almost always lands precisely between 8 and 12 minutes. A month and a half, without a single exception.",
  "重建 8/14 那一天 →": "Reconstruct 8/14 →",
  "已讀不代表安全。": "Read doesn't mean safe.",
  "已編輯": "Edited",
  "點這裡插入": "Tap to insert here",

  // ── chat/thread-review.html ───────────────────────────────────
  "一模一樣的對話記錄,一個字都沒改": "The exact same chat log, not a word changed",
  "「我們再讀一次,這次試著看懂他在做什麼。」——周妤": "“Let's read it again. This time, try to understand what he was doing.” — Zhou Yu",
  "檢查標註": "Check tags",
  "試探家庭狀況": "Probing family situation",
  "確認有無人會找": "Checking if anyone would look for her",
  "建立獨佔感": "Building exclusivity",
  "製造時間壓力": "Creating time pressure",
  "測試底線": "Testing boundaries",
  "轉移地點": "Shifting the meeting location",
  "移除標籤": "Remove tag",
  "那兩個「共同好友」帳號,發文時間、標點習慣(全形驚嘆號)、錯字模式,跟 @rec_1029 完全一致——是同一個人。":
    "Those two “mutual friend” accounts — posting times, punctuation habits (full-width exclamation marks), even typo patterns — match @rec_1029 exactly. It's the same person.",
  "你有沒有發現,他每次回覆的間隔,幾乎都精準落在 8 到 12 分鐘之間?他不是在忙。他是在刻意延遲,製造「他不是隨時在等妳」的錯覺。":
    "Did you notice the gap between his replies almost always lands precisely between 8 and 12 minutes? He wasn't busy. He was deliberately delaying, to create the illusion that he wasn't always waiting for you.",
  "他的收藏資料夾 →": "His collection folder →",

  // ── files/collection.html ─────────────────────────────────────
  "解壓縮中…": "Decompressing…",
  "協助調查問卷": "Help With Our Survey",
  "你曾在網路上提過自己的學校嗎?": "Have you ever mentioned your school online?",
  "是": "Yes",
  "否": "No",
  "/收藏 ── 12 個項目": "/Collection ── 12 items",
  "「這是我從他那邊——不知道該怎麼形容——拿到的東西。」——周妤": "“This is something I got from him — I don't even know how to describe it.” — Zhou Yu",
  "檔名": "Filename",
  "狀態": "Status",
  "大小": "Size",
  "建檔日期": "Date created",
  "可讀": "Readable",
  "〔無法讀取〕": "〔Unreadable〕",
  "暱稱": "Nickname",
  "就讀": "School",
  "放學時間": "Dismissal time",
  "同住成員": "Household members",
  "在意的東西": "What she cares about",
  "可施力點": "Leverage point",
  "雋": "Jun",
  "最後更新:2024/03/11": "Last updated: 2024/03/11",
  "晞": "Xi",
  "靖河高中 二年級": "2nd year, Jinghe High School",
  "約 15:30": "Around 15:30",
  "爸、媽(姐姐已失蹤)": "Dad, Mom (sister missing)",
  "一張光碟": "A disc",
  "他不是遇到她。": "He didn't meet her by chance.",
  "他掛了一張她這輩子唯一無法拒絕的餌,掛了兩年,等她自己走過來。":
    "He hung a lure she could never refuse, and left it hanging for two years, waiting for her to walk up to it herself.",
  "周妤傳來一則新聞連結 →": "Zhou Yu sent a news link →",
  "013 不是最後一個號碼。": "013 isn't the last number.",

  // ── editor/album.html ─────────────────────────────────────────
  "雲端相簿": "Cloud Album",
  "lin_xi 的相簿": "lin_xi's Album",
  "此相簿已加密": "This album is encrypted",
  "輸入密碼": "Enter password",
  "解鎖": "Unlock",
  "密碼不對,再確認一次周妤傳給你的訊息。": "Wrong password — double-check the message Zhou Yu sent you.",
  "相簿・18 張照片": "Album · 18 Photos",
  "依拍攝時間排序,由新到舊": "Sorted by date taken, newest first",

  // ── editor/img0431.html ───────────────────────────────────────
  "雲端相簿・編輯紀錄": "Cloud Album · Edit History",
  "版本紀錄": "Version History",
  "IMG_0431 ── 版本紀錄 ├─ v1_原始 ├─ v2 圖層 2｜修補筆刷 ×11(區域:臉部) │ 圖層 3｜物件移除(區域:右下 8%) ├─ v3 圖層 5｜物件移除(區域:左上 14%) │ 圖層 6｜已隱藏":
    "IMG_0431 ── Version History\n├─ v1_original\n├─ v2  Layer 2 | Retouch brush ×11 (area: face)\n│      Layer 3 | Object removal (area: bottom-right 8%)\n├─ v3  Layer 5 | Object removal (area: top-left 14%)\n│      Layer 6 | Hidden",
  "└─ final_真的最後.jpg": "└─ final_the_real_final.jpg",
  "← 點得開": "← Click to open",
  "比對:哪一格從頭到尾沒被修過?": "Compare: Which cell was never touched?",
  "點下面九宮格中的任一格,檢查該區域。標「已修改」的格子是依上面的紀錄比對出來的。":
    "Click any cell in the grid below to inspect that area. Cells marked “edited” were flagged by cross-referencing the version history above.",
  "下一步": "Next Step",
  "編號末位看不到。要知道完整編號,得去別的地方查證了。": "The last digit of the serial is cut off. To get the full number, you'll need to verify it somewhere else.",
  "去二手交易區查編號 →": "Go check the serial at the resale marketplace →",
  "圖層 6・已隱藏・草稿(未發布)": "Layer 6 · Hidden · Draft (unpublished)",
  "找到了!!找了快兩年終於找到了……先不要跟媽說 🤫": "Found it!! Almost two years of searching and I finally found it… don't tell Mom yet 🤫",
  "區域 C1・桌角": "Area C1 · Desk corner",
  "放大後,是一張對折的列印紙邊緣。攤開一半可以讀到——": "Zoomed in, it's the edge of a folded printout. Half-unfolded, you can make out—",
  "編號 #18_": "Serial No. #18_",
  "最後一位被裁掉了,看不到。": "The last digit is cropped off, unreadable.",
  "這一格依編輯紀錄比對,已被修過。": "According to the edit history, this cell has been retouched.",
  "看起來只是桌面,沒有異常。": "Just looks like the desk — nothing unusual.",

  // ── xunren/correction.html ────────────────────────────────────
  "更正資訊": "Submit a Correction",
  "協尋林晞・回報表單": "Find Lin Xi · Report Form",
  "在你送出之前": "Before You Submit",
  "我需要知道是誰在幫忙、還有你是怎麼找到這裡的——之後如果有進展,我才知道要通知誰。":
    "I need to know who's helping and how you found this site — so if there's any progress, I'll know who to notify.",
  "你的暱稱": "Your nickname",
  "你是怎麼知道這件事的?": "How did you hear about this?",
  "例如:朋友分享連結": "e.g. a friend shared the link",
  "正確的最後動態時間(24小時制,例如 19:41)": "The correct last-activity time (24-hour format, e.g. 19:41)",
  "送出更正": "Submit correction",
  "已收到,謝謝你": "Received, Thank You",
  "……妳說得對,我剛剛又去看了一次,真的是 19:41。我已經把公告改了。":
    "…you're right, I just went and checked again, it really is 19:41. I've already updated the notice.",
  "對了——我把她雲端相簿的密碼傳給你了:": "Oh — I sent you the password to her cloud album:",
  "我一直沒敢自己點進去看,你能不能幫我看看裡面有沒有什麼?": "I never had the guts to look through it myself. Could you check if there's anything in there?",
  "前往她的雲端相簿 →": "Go to her cloud album →",
  "時間好像不太對,你再確認一次她最後一則動態的時間戳。": "That time doesn't look right — double-check the timestamp on her last post.",

  // ── xunren/rebuild-0814.html ──────────────────────────────────
  "重建 8/14": "Reconstructing 8/14",
  "周妤整理": "Compiled by Zhou Yu",
  "好,我們現在要弄清楚一件事——她那天到底幾點還活著。 我把我這邊有的資料都整理出來了,你一個一個看,看完跟我說。":
    "Okay, there's one thing we need to figure out — what time that day she was still okay. I've put together everything I have. Go through them one by one and tell me when you're done.",
  "五件事": "Five Things",
  "約定時間有沒有問題": "Was there a problem with the agreed time",
  "她進出捷運的紀錄": "Her metro entry/exit records",
  "他的帳號可信嗎": "Was his account trustworthy",
  "她跟我說了什麼": "What she told me",
  "定位分享有沒有開": "Was location sharing on",
  "再讀一次那份對話 →": "Read that conversation again →",
  "這五件事我全部核對過了。\n\n她約在白天。她約在有其他人在的地方。她真的去查過那個帳號,看起來也真的沒問題。她有跟我說,雖然說得含糊。她甚至開了定位分享給她媽,只是設了兩個小時。\n\n我們從小聽到大的那些反詐騙宣導,她全部都做到了。\n\n她全部都做對了,人還是不見了。\n\n我不知道還能怎麼提醒下一個人。":
    "I've checked all five of these things.\n\nShe met him during the day. She met him somewhere other people were around. She really did check that account, and it really did look fine. She told me, even if vaguely. She even turned on location sharing for her mom — she just only set it for two hours.\n\nAll those anti-scam warnings we grew up hearing — she did every single one of them.\n\nShe did everything right, and she still disappeared.\n\nI don't know what else I can tell the next person.",

  // ── ending/index.html ─────────────────────────────────────────
  "靖河市失蹤協尋網": "Jinghe City Missing Persons Network",
  "繼續": "Continue",
  "/收藏": "/Collection",
  "資料夾多了一個新檔案": "A new file has appeared in the folder",
  "…我不知道還能做什麼。這個網站我會留著。\n如果你看到這裡了,謝謝你陪我走完這一段。":
    "…I don't know what else I can do. I'll keep this site up.\nIf you've read this far, thank you for staying with me through all of this.",
  "…我不知道還能做什麼。這個網站我本來是為了找晞晞才架的。\n\n我沒想到最後找到的是姐姐。\n\n三年了,我一直跟她們家說「說不定哪天林昭會自己回來」,現在我不知道要拿什麼臉再去見他們。\n\n晞晞呢?我不敢往下想。這個網站我會留著。\n如果你看到這裡了,謝謝你陪我走完這一段。":
    "…I don't know what else I can do. I built this site to find Xi Xi.\n\nI never expected the one we'd find would be her sister.\n\nFor three years I kept telling her family, \u201cmaybe Lin Zhao will come back on her own someday.\u201d Now I don't know what face I have left to show them.\n\nAnd Xi Xi? I can't bear to think about it. I'll keep this site up.\nIf you've read this far, thank you for staying with me through all of this.",

  // ── resources/help.html ───────────────────────────────────────
  "這是一部虛構作品": "This Is a Work of Fiction",
  "「協尋林晞」與本站出現的所有人物、帳號、對話、地點、事件皆為虛構創作, 用以提醒大家:不要與只在網路上認識的陌生人單獨見面,尤其是未成年人。 如有雷同,純屬巧合。":
    "“Find Lin Xi” and every person, account, conversation, location, and event on this site are fictional. It exists to remind people not to meet alone with strangers you've only known online — especially if you're a minor. Any resemblance to real events is coincidental.",
  "如果你正處於類似狀況,請尋求以下真實管道協助:": "If you're in a similar situation, please reach out through these real support channels:",
  "報案專線": "Police Hotline",
  "緊急狀況、人身安全受威脅,請立即撥打。": "For emergencies or threats to personal safety, call immediately.",
  "保護專線": "Protection Hotline",
  "婦幼保護、家庭暴力、性剝削等相關求助,24 小時服務。": "For women's/children's protection, domestic violence, sexual exploitation, and related issues. Available 24 hours.",
  "網路誘拐、不當交友邀約、網路性剝削等檢舉與諮詢。": "For reporting and consultation on online grooming, inappropriate contact, and online sexual exploitation.",
  "如果有人在網路上向你或你認識的未成年人索取個資、要求私下見面、 要求不要告訴家人朋友——這些都是需要提高警覺的訊號。":
    "If someone online asks you or a minor you know for personal information, requests a private meetup, or asks you not to tell family or friends — these are all warning signs to take seriously.",

  // ── assets/data/chat-thread.json 對話內容(38 則) ──────────────
  "請問這個還在嗎?看到你貼的靖河站限定": "Is this still available? Saw you posted the Jinghe-stop exclusive",
  "在啊,妳也是雋的粉絲?": "Yeah it's here, are you a Jun fan too?",
  "算是,我姐超愛他": "Kind of, my sister loves him",
  "妳姐是不是也超愛雋？看妳打字口氣就知道家裡有人帶妳入坑哈哈": "Your sister must really love Jun too? I can tell from how you type that someone at home got you into this haha",
  "哈哈算是啦": "Haha yeah kind of",
  "我這片是2019巡演的,靖河站真的很難找,妳知道場次很內行": "Mine's from the 2019 tour, the Jinghe stop is genuinely hard to find, you knowing the venue means you're really in the know",
  "我記得那場是12月吧?": "I remember that show was in December right?",
  "是11月,妳記錯了,不過很多人都會搞混": "It was November, you're misremembering, but a lot of people mix it up",
  "啊對齁,謝謝糾正": "Oh right, thanks for the correction",
  "我掛兩年了，問的人一堆，我一個都沒回。妳是第一個講得出場次的": "I've had this listed for two years, tons of people ask, I haven't replied to a single one. You're the first who could actually name the venue",
  "還在嗎?我這幾天在存錢": "Still available? I've been saving up these past few days",
  "不用急,我不賣別人": "No rush, I won't sell it to anyone else",
  "真的假的謝謝你!!": "Really?? Thank you!!",
  "妳還在唸書吧?錢自己留著,我又不趕時間": "You're still in school right? Keep your money, I'm not in a hurry anyway",
  "我打工存到一半了": "I've saved up half of it from my part-time job",
  "這片還是別跟太多人講好，唱片圈很亂，被知道會有人來搶": "Better not tell too many people about this one, the record scene's a mess, if word gets out people will try to snatch it from you",
  "好我不會亂講": "Okay I won't tell anyone",
  "別叫我大哥啦，我們算同好": "Don't call me 'big bro', we're basically fellow fans",
  "存夠了!!我們約時間好嗎": "Saved up enough!! Can we set a time?",
  "這麼晚還在？妳家管很鬆喔，我媽以前十點就收手機": "Still up this late? Your family's pretty relaxed, my mom used to take my phone away at ten",
  "哈哈我爸媽比較不管": "Haha my parents don't really keep track",
  "妳同學也有在追嗎？有的話我可以幫忙留意": "Do your friends follow him too? If so I can keep an eye out for them",
  "有一個,我再問問她": "One does, I'll ask her",
  "先傳個學生證我看一下好了，免得又是收了東西就跑的": "Send me a photo of your student ID first, just so it's not another case of someone taking the item and running",
  "喔好,那我傳一下": "Oh okay, I'll send it",
  "謝啦,這樣我也比較放心": "Thanks, that puts my mind at ease",
  "妳幾點下課？我看能不能配合妳": "What time do you get out of school? I'll see if I can work around your schedule",
  "禮拜四3點半": "Thursday, 3:30",
  "其實有人昨天出到兩萬，我先壓著沒回": "Actually someone offered twenty thousand yesterday, I've been sitting on it without replying",
  "真的假的!謝謝你留給我": "Seriously?! Thank you for holding it for me",
  "我這禮拜之後要去南部一陣子，回來不知道什麼時候": "I'm heading south for a while after this week, not sure when I'll be back",
  "那我們約禮拜四好嗎?8/14": "Then can we say Thursday? 8/14",
  "禮拜四可以啊,妳下課直接來嗎?": "Thursday works, will you come straight after school?",
  "應該可以,大概4點左右?": "Should be fine, around 4-ish?",
  "好啊那約在河西・文昌站見面": "Okay let's meet at Hexi · Wenchang Station",
  "文昌站哪個出口比較好找?": "Which exit at Wenchang Station is easier to find?",
  "2號出口,出來有一間連鎖咖啡廳,很好認": "Exit 2, there's a chain coffee shop right outside, easy to spot",
  "好!那就這樣說定了": "Okay! It's settled then",
  "抱歉,明天好像會塞車,我們約晚一點好不好,17:30左右?": "Sorry, looks like there might be traffic tomorrow, can we meet a bit later, around 17:30?",
  "喔好啊沒問題!": "Oh sure, no problem!",
  "那家咖啡廳我剛看有點吵，旁邊有間比較好講，我帶妳過去": "I just checked, that coffee shop's a bit loud, there's a better one nearby to talk, I'll take you there",
  "喔好啊": "Oh okay",
  "我車停興安那邊，走過去五分鐘就好": "My car's parked over by Xing'an, it's just a five minute walk",
  "好": "Okay",
};

// ── regex fallback:固定文字 + 動態內容(日期/數字/玩家輸入)拼在同一節點 ──
const JH_I18N_EN_PATTERNS = [
  // 「日期 更新」公告時間戳(首頁、已釐清事項頁)
  { re: /^(\d{1,2}\/\d{1,2}) 更新$/, build: (m) => `Updated ${m[1]}` },
  // 「☑/☐ 任務名稱」重建 8/14 的核對清單
  { re: /^([☑☐]) ([\s\S]+)$/, build: (m, tr) => `${m[1]} ${tr(m[2])}` },
  // 中文引號包住一段可能已在字典裡的文字(例如再讀對話頁的訊息引用)
  { re: /^「([\s\S]+)」$/, build: (m, tr) => `“${tr(m[1])}”` },
  // 對話重排謎題:「〔已編輯〕+ 訊息內容」
  { re: /^〔已編輯〕([\s\S]+)$/, build: (m, tr) => `〔Edited〕${tr(m[1])}` },
  // 對話重排謎題:已放置訊息的「時間・點一下拿回來重排」
  { re: /^(\d{2}\/\d{2} \d{2}:\d{2})・點一下拿回來重排$/, build: (m) => `${m[1]} · tap to pick it back up` },
  // 假瀏覽器網址列:雲端相簿的網域顯示
  { re: /^雲端(\/.*)?$/, build: (m) => `Cloud${m[1] || ""}` },
  // 二手平台留言數「X 則」或「X 則・賣家回覆 Y 則」
  {
    re: /^(\d+) 則(?:・賣家回覆 (\d+) 則)?$/,
    build: (m) => `${m[1]} comment${m[1] === "1" ? "" : "s"}${m[2] ? ` · ${m[2]} seller repl${m[2] === "1" ? "y" : "ies"}` : ""}`,
  },
  // 二手平台「共 X 筆結果」
  { re: /^共 (\d+) 筆結果$/, build: (m) => `${m[1]} results` },
  // 二手平台分頁「第 X / Y 頁」
  { re: /^第 (\d+) \/ (\d+) 頁$/, build: (m) => `Page ${m[1]} / ${m[2]}` },
  // 二手平台賣家「上次上線」X 分鐘前
  { re: /^(\d+) 分鐘前$/, build: (m) => `${m[1]} min ago` },
  // 停留時間「X 秒」/「X 分鐘」(checkself 頁)
  { re: /^(\d+) 秒$/, build: (m) => `${m[1]} sec` },
  { re: /^(\d+) 分鐘$/, build: (m) => `${m[1]} min` },
  // 再讀對話頁:標對計數「X / 12 標對了」(可能帶「・再想想看」後綴)
  {
    re: /^(\d+) \/ (\d+) 標對了(・再想想看)?$/,
    build: (m) => `${m[1]} / ${m[2]} tagged correctly${m[3] ? " · think again" : ""}`,
  },
  // 再讀對話頁:通關訊息「你標對了 X/12 句。」
  { re: /^你標對了 (\d+)\/12 句。$/, build: (m) => `You correctly tagged ${m[1]}/12 lines.` },
  // 筆記本裡動態標對句數的條目「重讀對話,標對 X/12 句誘導語句」
  {
    re: /^重讀對話,標對 (\d+)\/12 句誘導語句$/,
    build: (m) => `Re-read the conversation, correctly tagged ${m[1]}/12 manipulative lines`,
  },
  // 悠遊卡明細:「時間 進站/出站」
  {
    re: /^(\d{2}:\d{2}) (進站|出站)$/,
    build: (m) => `${m[1]} ${m[2] === "進站" ? "Entry" : "Exit"}`,
  },
  // 雲端相簿縮圖備註「── IMG_xxxx:沒有異常,普通生活照。」
  {
    re: /^── (IMG_\d+):沒有異常,普通生活照。$/,
    build: (m) => `── ${m[1]}: nothing unusual, just an ordinary photo.`,
  },
  // 林昭舊帳號重訪限動:「今天 HH:MM」
  { re: /^今天 (.+)$/, build: (m) => `Today ${m[1]}` },
];
