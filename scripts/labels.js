// Non-narrative UI strings shared by every page: field labels, nav/footer chrome,
// notebook chrome, content-warning gate text. No case/plot content belongs here —
// each page inlines its own narrative data instead of pulling from a shared bundle.

export const LABELS = {
  home: { "zh-Hant": "首頁", "zh-Hans": "首页", en: "Home" },
  language: { "zh-Hant": "語言", "zh-Hans": "语言", en: "Language" },
  langNames: {
    "zh-Hant": { "zh-Hant": "繁體中文", "zh-Hans": "繁体中文", en: "Traditional Chinese" },
    "zh-Hans": { "zh-Hant": "簡體中文", "zh-Hans": "简体中文", en: "Simplified Chinese" },
    en: { "zh-Hant": "英文", "zh-Hans": "英文", en: "English" }
  },
  caseId: { "zh-Hant": "案件編號", "zh-Hans": "案件编号", en: "Case No." },
  name: { "zh-Hant": "姓名", "zh-Hans": "姓名", en: "Name" },
  ageAtDisappearance: { "zh-Hant": "失蹤時年齡", "zh-Hans": "失踪时年龄", en: "Age When Missing" },
  missingDate: { "zh-Hant": "失蹤日期", "zh-Hans": "失踪日期", en: "Date Missing" },
  lastSeen: { "zh-Hant": "最後目擊地點", "zh-Hans": "最后目击地点", en: "Last Seen" },
  status: { "zh-Hant": "狀態", "zh-Hans": "状态", en: "Status" },
  summary: { "zh-Hant": "案情摘要", "zh-Hans": "案情摘要", en: "Case Summary" },
  poster: { "zh-Hant": "協尋啟事 PDF", "zh-Hans": "协寻启事 PDF", en: "Search Notice (PDF)" },
  viewPdf: { "zh-Hant": "檢視 PDF", "zh-Hans": "查看 PDF", en: "View PDF" },
  relatedLinks: { "zh-Hant": "相關連結", "zh-Hans": "相关链接", en: "Related Links" },
  note: { "zh-Hant": "備註", "zh-Hans": "备注", en: "Note" },
  recoveryDate: { "zh-Hant": "尋獲日期", "zh-Hans": "寻获日期", en: "Date Recovered" },
  recoveryPlace: { "zh-Hant": "尋獲地點", "zh-Hans": "寻获地点", en: "Location Recovered" },
  condition: { "zh-Hant": "遺體狀況", "zh-Hans": "遗体状况", en: "Condition" },
  cause: { "zh-Hant": "死因", "zh-Hans": "死因", en: "Cause of Death" },
  timeOfDeath: { "zh-Hant": "死亡時間", "zh-Hans": "死亡时间", en: "Time of Death" },
  belongings: { "zh-Hant": "隨身物品", "zh-Hans": "随身物品", en: "Belongings" },
  statusHistory: { "zh-Hant": "狀態異動紀錄", "zh-Hans": "状态异动记录", en: "Status History" },
  breadcrumbDb: { "zh-Hant": "尋人資料庫", "zh-Hans": "寻人数据库", en: "Missing Persons Database" },
  continue: { "zh-Hant": "繼續", "zh-Hans": "继续", en: "Continue" },
  mute: { "zh-Hant": "靜音", "zh-Hans": "静音", en: "Mute" },
  unmute: { "zh-Hant": "取消靜音", "zh-Hans": "取消静音", en: "Unmute" },
  notFound: { "zh-Hant": "找不到頁面", "zh-Hans": "找不到页面", en: "Page not found" },
  backHome: { "zh-Hant": "回首頁", "zh-Hans": "回首页", en: "Back to home" },
  collectionTitle: { "zh-Hant": "收藏", "zh-Hans": "收藏", en: "Collection" },
  trustBreadcrumb: { "zh-Hant": "徵信專區", "zh-Hans": "征信专区", en: "Donor Disclosure" },
  archiveBreadcrumb: { "zh-Hant": "網站存檔", "zh-Hans": "网站存档", en: "Site Archive" },
  introBreadcrumb: { "zh-Hant": "志工登錄", "zh-Hans": "志工登录", en: "Volunteer Sign-in" },
  date: { "zh-Hant": "日期", "zh-Hans": "日期", en: "Date" },
  amount: { "zh-Hant": "金額", "zh-Hans": "金额", en: "Amount" },
  donorName: { "zh-Hant": "姓名", "zh-Hans": "姓名", en: "Name" },
  zip: { "zh-Hant": "郵遞區號", "zh-Hans": "邮递区号", en: "Postal Code" },
  year: { "zh-Hant": "年度", "zh-Hans": "年度", en: "Year" },
  listingTitle: { "zh-Hant": "商品", "zh-Hans": "商品", en: "Item" },
  posted: { "zh-Hant": "刊登日期", "zh-Hans": "刊登日期", en: "Posted" },
  deal: { "zh-Hant": "交易方式", "zh-Hans": "交易方式", en: "Deal" },
  spot: { "zh-Hant": "面交地點", "zh-Hans": "面交地点", en: "Meetup Spot" },
  seller: { "zh-Hant": "賣家", "zh-Hans": "卖家", en: "Seller" },
  attachment: { "zh-Hant": "附件", "zh-Hans": "附件", en: "Attachment" },
  recoveredFromLabel: { "zh-Hant": "來源", "zh-Hans": "来源", en: "Source" },
  filed: { "zh-Hant": "建檔", "zh-Hans": "建档", en: "Filed" },
  lastUpdated: { "zh-Hant": "最後更新", "zh-Hans": "最后更新", en: "Last Updated" },
  evidenceChatlog: { "zh-Hant": "附件：雲端備份對話紀錄", "zh-Hans": "附件：云端备份对话记录", en: "Attachment: Recovered Chat Log (Cloud Backup)" },
  evidenceSchoolNotice: { "zh-Hant": "校方公告（比對用）", "zh-Hans": "校方公告（比对用）", en: "School Notice (for comparison)" },
  relatedMarketSnapshot: { "zh-Hant": "疑似相關網路紀錄快照", "zh-Hans": "疑似相关网络记录快照", en: "Possibly related online record snapshot" },
  archiveLink: { "zh-Hant": "查看 2019 年網站存檔", "zh-Hans": "查看 2019 年网站存档", en: "View the 2019 site archive" },
  trustFooterLink: { "zh-Hant": "歷年徵信錄", "zh-Hans": "历年征信录", en: "Historical Donor Disclosure" },
  comments: { "zh-Hant": "留言數", "zh-Hans": "留言数", en: "Comments" },
  replies: { "zh-Hant": "回覆數", "zh-Hans": "回复数", en: "Replies" },
  upLink: { "zh-Hant": "..", "zh-Hans": "..", en: ".." },
  closeSnapshot: { "zh-Hant": "關閉快照，回協尋基金會", "zh-Hans": "关闭快照，回协寻基金会", en: "Close snapshot, return to the foundation site" },
  navAbout: { "zh-Hant": "關於我們", "zh-Hans": "关于我们", en: "About Us" },
  navFaq: { "zh-Hant": "常見問題", "zh-Hans": "常见问题", en: "FAQ" },
  navContact: { "zh-Hant": "聯絡我們", "zh-Hans": "联络我们", en: "Contact" },
  navPrivacy: { "zh-Hant": "隱私權政策", "zh-Hans": "隐私权政策", en: "Privacy Policy" },
  navAccessibility: { "zh-Hant": "無障礙宣告", "zh-Hans": "无障碍宣告", en: "Accessibility Statement" },
  statsTotal: { "zh-Hant": "累計受理案件", "zh-Hans": "累计受理案件", en: "Total Cases Filed" },
  statsUnit: { "zh-Hant": "件", "zh-Hans": "件", en: "" },
  filterAll: { "zh-Hant": "全部狀態", "zh-Hans": "全部状态", en: "All Statuses" },
  filterLabel: { "zh-Hant": "篩選", "zh-Hans": "筛选", en: "Filter" },
  sortLabel: { "zh-Hant": "排序", "zh-Hans": "排序", en: "Sort" },
  sortMissingDesc: { "zh-Hant": "失蹤時間（新到舊）", "zh-Hans": "失踪时间（新到旧）", en: "Date Missing (Newest First)" },
  sortMissingAsc: { "zh-Hant": "失蹤時間（舊到新）", "zh-Hans": "失踪时间（旧到新）", en: "Date Missing (Oldest First)" },
  sortId: { "zh-Hant": "案件編號", "zh-Hans": "案件编号", en: "Case No." },
  sortName: { "zh-Hant": "姓名", "zh-Hans": "姓名", en: "Name" },
  sortStatusOpt: { "zh-Hant": "狀態", "zh-Hans": "状态", en: "Status" },
  officeHours: { "zh-Hant": "服務時間", "zh-Hans": "服务时间", en: "Office Hours" },
  phone: { "zh-Hant": "協尋專線", "zh-Hans": "协寻专线", en: "Search Hotline" },
  email: { "zh-Hant": "電子郵件", "zh-Hans": "电子邮件", en: "Email" }
};

export const STATUS_VALUES = {
  協尋中: { "zh-Hant": "協尋中", "zh-Hans": "协寻中", en: "Searching" },
  已尋獲: { "zh-Hant": "已尋獲", "zh-Hans": "已寻获", en: "Found" },
  已結案: { "zh-Hant": "已結案", "zh-Hans": "已结案", en: "Closed" }
};

export const ORG_CHROME = {
  name: { "zh-Hant": "社團法人臺灣失蹤兒少協尋關懷基金會", "zh-Hans": "社团法人台湾失踪儿少协寻关怀基金会", en: "Taiwan Missing Children & Youth Search and Care Foundation" },
  donate: { "zh-Hant": "捐款支持我們", "zh-Hans": "捐款支持我们", en: "Support Us — Donate" },
  footer: {
    taxId: { "zh-Hant": "統一編號：00000000", "zh-Hans": "统一编号：00000000", en: "Tax ID: 00000000" },
    address: { "zh-Hant": "地址：（本頁資料為虛構）", "zh-Hans": "地址：（本页资料为虚构）", en: "Address: (fictional — this page is a work of fiction)" },
    updated: { "zh-Hant": "資料更新日期　2026/09/05", "zh-Hans": "资料更新日期　2026/09/05", en: "Last updated 2026/09/05" }
  }
};

export const CONTENT_WARNING = {
  title: { "zh-Hant": "觀看前請注意", "zh-Hans": "观看前请注意", en: "Please Note Before Viewing" },
  body: { "zh-Hant": "本作品為虛構創作，內容包含失蹤、死亡與暴力暗示。故事中的人物、機構與事件均為虛構。", "zh-Hans": "本作品为虚构创作，内容包含失踪、死亡与暴力暗示。故事中的人物、机构与事件均为虚构。", en: "This work is fiction. It contains references to disappearance, death, and implied violence. All characters, organizations, and events depicted are fictional." },
  continue: { "zh-Hant": "我了解，開始", "zh-Hans": "我了解，开始", en: "I understand, begin" }
};

export const NOTEBOOK_UI = {
  buttonLabel: { "zh-Hant": "筆記本", "zh-Hans": "笔记本", en: "Notebook" },
  title: { "zh-Hant": "已知事項", "zh-Hans": "已知事项", en: "Known Facts" },
  empty: { "zh-Hant": "還沒有已知事項。繼續往下看。", "zh-Hans": "还没有已知事项。继续往下看。", en: "No known facts yet. Keep reading." },
  close: { "zh-Hant": "關閉", "zh-Hans": "关闭", en: "Close" }
};
