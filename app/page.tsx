"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowDown as ArrowDownIcon,
  GraduationCap as AcademicCapIcon,
  RefreshCw as ArrowPathIcon,
  FlaskConical as BeakerIcon,
  Landmark as BuildingLibraryIcon,
  Building2 as BuildingOffice2Icon,
  BadgeCheck as CheckBadgeIcon,
  ClipboardCheck as ClipboardDocumentCheckIcon,
  TriangleAlert as ExclamationTriangleIcon,
  Globe2 as GlobeAsiaAustraliaIcon,
  Search as MagnifyingGlassIcon,
  Map as MapIcon,
  Newspaper as NewspaperIcon,
  Scale as ScaleIcon,
  ShieldCheck as ShieldCheckIcon,
  Truck as TruckIcon,
  Users as UserGroupIcon,
} from "lucide-react";

type Role = {
  id: string;
  label: string;
  short: string;
  duty: string;
  powers: string[];
  boundary: string;
  tone: string;
  terms: { term: string; definition: string }[];
  more: string[];
  links: { label: string; url: string }[];
};

type RoleView = "summary" | "terms" | "practice" | "resources";

type Step = {
  title: string;
  owner: string;
  summary: string;
  actions: string[];
};

type ChainNode = {
  title: string;
  authority: string;
  task: string;
  focus: string;
  risk: string;
  handoff: string;
};

type CaseLink = {
  roles: string[];
  steps: number[];
  chains: number[];
  failures: number[];
  evidence: string;
};

const roles: Role[] = [
  {
    id: "business",
    label: "食品業者",
    short: "第一責任",
    duty: "從原料、製程到產品流向，負自主管理、主動處置與通報責任。",
    powers: ["建立監測與自主檢驗", "保存來源、批號與出貨紀錄", "有危害之虞即停產、停售、回收", "通報所在地地方政府"],
    boundary: "發現產品有危害衛生安全之虞時，應即採取法定措施；不能只等待政府抽驗或複驗。",
    tone: "teal",
    terms: [
      { term: "自主管理", definition: "業者依產品與製程風險，建立監測、檢驗、衛生管理及異常處置制度。" },
      { term: "追溯／追蹤", definition: "向上掌握原料來源，向下掌握產品批號、數量與流向。" },
      { term: "有危害之虞", definition: "尚未完成最終認定，但已有合理風險訊號，應先控制而非等待複驗。" },
    ],
    more: ["異常發現時間、內部決策、停產停售、回收與通報，都應留下可核對紀錄。", "進貨、製造、庫存、出貨與回收數量，應能相互勾稽。"],
    links: [
      { label: "食品安全衛生管理法", url: "https://www.fda.gov.tw/tc/includes/GetFile.ashx?cid=42305&id=f638745244205434237" },
      { label: "食品追溯追蹤制度公告", url: "https://www.fda.gov.tw/tc/newsContent.aspx?cid=3&id=30519" },
    ],
  },
  {
    id: "local",
    label: "地方政府",
    short: "第一線執法",
    duty: "查明轄內現場事實，控制工廠、產品與流通風險。",
    powers: ["進廠查核、抽樣與扣取資料", "依法命暫停作業、停止販賣與封存", "追查轄內上下游並監督回收處置", "依法裁罰、公布違法資訊"],
    boundary: "不必等待中央逐案下令；但不能單獨統一全國跨縣市標準。",
    tone: "indigo",
    terms: [
      { term: "查核", definition: "檢查場所、製程、文件、庫存、批號與產品流向。" },
      { term: "檢驗", definition: "對採樣檢體以公告或認可方法進行分析。" },
      { term: "封存", definition: "先限制產品移動或販售以控制風險，不等於最終裁罰或有罪認定。" },
    ],
    more: ["源頭所在地查工廠與原始紀錄；下游所在地查轄內通路與回收。", "新增批次或流向應即時通報中央及其他受影響縣市。"],
    links: [
      { label: "食品查核及檢驗資訊平台", url: "https://www.fda.gov.tw/testing/index.aspx" },
      { label: "食藥署食品稽查專區", url: "https://www.fda.gov.tw/TC/site.aspx?r=546794683&sid=9871" },
    ],
  },
  {
    id: "central",
    label: "衛福部／食藥署",
    short: "全國風險管理",
    duty: "制定全國規則，並在跨縣市或重大事件中協調一致處置。",
    powers: ["制定限量、檢驗及追溯規則", "邊境輸入查驗與境外查核", "協調全國一致的風險管理與處置原則", "整合全國流向、名單與回收進度"],
    boundary: "中央必要時可直接查核或採取措施；日常現場執法仍以地方主管機關為主。",
    tone: "blue",
    terms: [
      { term: "風險評估", definition: "依危害性、暴露程度與不確定性，判斷健康風險與管理強度。" },
      { term: "跨區統籌", definition: "統一批號、處置範圍、檢驗方法及全國資訊版本。" },
      { term: "輸入查驗", definition: "食品入境時，依產品、來源與業者風險採抽批、逐批或加強查驗。" },
    ],
    more: ["地方新增事證應驅動中央重新評估全國處置範圍，而非一次決定後不再調整。", "全國名單、回收量與解封原則應標示更新時間及修訂紀錄。"],
    links: [
      { label: "食藥署業務聯絡與分工", url: "https://www.fda.gov.tw/TC/siteContent.aspx?sid=1963" },
      { label: "食品查核及檢驗資訊平台", url: "https://www.fda.gov.tw/testing/index.aspx" },
    ],
  },
  {
    id: "cabinet",
    label: "跨部會體系",
    short: "源頭與場域協作",
    duty: "處理農業、環境、教育、經濟等不同風險入口與使用場域。",
    powers: ["農業部：農漁畜產源頭與用藥", "環境部：污染源與化學物質", "教育體系：校園採購與停用", "行政院：重大事件跨部會協調"],
    boundary: "目的事業主管機關管理場域；食品違法認定與裁罰核心仍是衛生機關。",
    tone: "amber",
    terms: [
      { term: "食品安全會報", definition: "行政院層級的跨部會食安政策與重大議題協調機制。" },
      { term: "源頭管理", definition: "在農產、環境、化學物質及輸入階段，預防風險進入食品鏈。" },
      { term: "場域管理", definition: "教育、醫療、長照等主管機關管理採購、使用、停用與供餐。" },
    ],
    more: ["農業、環境、教育、經濟與衛生資料，需要共同欄位及交換機制。", "跨部會協作負責補上交界，不取代各主管機關原有法定權責。"],
    links: [
      { label: "行政院食品安全辦公室", url: "https://www.ey.gov.tw/ofs/1FCFE0DE7AE0F7B9" },
      { label: "五環 2.0 食安政策", url: "https://www.ey.gov.tw/ofs/371319597964BB01" },
      { label: "食安政策辦理現況", url: "https://www.ey.gov.tw/ofs/A30E2C75E5F3AFD9" },
    ],
  },
  {
    id: "justice",
    label: "檢警調／司法",
    short: "刑事偵辦",
    duty: "追查故意造假、隱匿、串供、犯罪所得與其他刑事責任。",
    powers: ["搜索、扣押與調取通聯", "追查變造報告或調換留樣", "保全犯罪所得與財產", "由檢察官偵查、法院審判"],
    boundary: "行政違規不必然等於犯罪；扣押或交保也不等於已判決有罪。",
    tone: "red",
    terms: [
      { term: "行政責任", definition: "主管機關依食安法命改善、回收、停業或裁罰。" },
      { term: "刑事責任", definition: "行為符合犯罪構成要件，並經檢察官偵查、法院審判認定。" },
      { term: "扣押／羈押／交保", definition: "偵審中的保全或強制處分，不等於有罪判決。" },
    ],
    more: ["衛生機關提供產品、檢驗與流向專業；檢察官統籌刑事蒐證及犯罪所得追查。", "對外資訊應明確區分行政違規、涉嫌犯罪、起訴與判決。"],
    links: [
      { label: "查緝食品藥物犯罪執行方案", url: "https://mojlaw.moj.gov.tw/LawContent.aspx?LSID=FL088882" },
      { label: "打擊民生犯罪督導機制", url: "https://www.tph.moj.gov.tw/4421/4447/756121/757149/post" },
    ],
  },
];

const steps: Step[] = [
  { title: "異常訊號", owner: "多元來源", summary: "業者自主檢驗、政府抽驗、民眾檢舉、醫療通報或國外警訊，都可能啟動調查。", actions: ["確認產品、批號與業者身分", "保存檢體與第一手紀錄", "初步判斷是否已有危害之虞"] },
  { title: "先行控制與通報", owner: "業者＋地方", summary: "業者發現產品有危害之虞時，應即停止製造、加工與販賣、辦理回收並通報地方；主管機關也可依已知風險先採控制措施。", actions: ["停止問題產品繼續流通", "通報所在地地方主管機關", "保全批號、庫存與流向資料"] },
  { title: "現場查證", owner: "地方衛生機關", summary: "地方主管機關查明現場、抽樣並保全資料；必要時依法命暫停作業、停止販賣及封存產品。", actions: ["進廠查核與抽樣", "查閱、扣留或複製相關紀錄", "控制源頭與轄內市場"] },
  { title: "追溯與追蹤", owner: "地方＋中央", summary: "向上追溯原料來源、向下追蹤產品流向；外縣市資料須轉交相應主管機關並持續勾稽。", actions: ["核對生產、庫存、出貨與回收量", "交叉比對發票、物流與下游進貨", "找出漏報批次與未知流向"] },
  { title: "跨區統籌", owner: "中央協調", summary: "涉及大型上游、跨縣市、敏感供餐場域或資料不完整時，應提高中央統籌層級。", actions: ["協調處置範圍與檢驗方法", "整合可追溯版本的全國清單", "協調各地查核、下架與回報"] },
  { title: "結果分流", owner: "行政／司法", summary: "依查核與檢驗結果決定解封、回收、改製、沒入、銷毀或裁罰；涉嫌犯罪者另移送司法偵辦。", actions: ["監督回收與最終處置", "依法公布資訊與要求改善", "必要時移送刑事偵查"] },
];

const supplyChain: ChainNode[] = [
  { title:"生產源頭", authority:"農業部／地方農政", task:"農藥、動物用藥、飼料、產地與上市前監測", focus:"在農漁畜產品進入一般食品市場前，先控制用藥、飼料與產地風險。", risk:"源頭用藥或產地紀錄未能與後端產品流向串接。", handoff:"產品上市流通後，由衛生體系接手後市場食品安全監管。" },
  { title:"環境風險", authority:"環境部／地方環保", task:"污染源、毒性化學物質、重金屬與工業污染", focus:"辨識可能進入農地、水源、養殖或食品原料鏈的環境污染。", risk:"只檢驗終端食品，未同步追查污染源與受影響範圍。", handoff:"環保、農政與衛生單位需共享污染範圍、採樣與流向資料。" },
  { title:"進口邊境", authority:"食藥署", task:"輸入查驗、提高查驗強度、境外系統性查核", focus:"依產品、來源國與業者風險，決定抽批、逐批或加強查驗。", risk:"單批異常未及時升級為來源業者、產地或同類產品管理。", handoff:"產品放行後仍須納入國內製造、販售及追溯追蹤體系。" },
  { title:"製造加工", authority:"食品業者／地方衛生", task:"自主品管、GHP／HACCP、工廠稽查與抽驗", focus:"確認原料驗收、製程、留樣、批號及自主檢驗紀錄可以相互勾稽。", risk:"業者資料失真、留樣不具代表性，或生產與出貨紀錄無法對應。", handoff:"成品出廠後，批號、數量與下游客戶資料必須完整移交流通端。" },
  { title:"物流販售", authority:"業者／地方衛生", task:"倉儲、批發、零售、餐飲與團膳市場查核", focus:"掌握產品在倉儲、物流、通路與餐飲端的實際流向及庫存。", risk:"只通知第一層客戶，未繼續追到加工品、餐飲或最終使用場所。", handoff:"異常產品須回傳源頭，並把跨縣市流向交由各地主管機關查核。" },
  { title:"特殊場域", authority:"場域主管機關／地方衛生", task:"採購、食材登錄、停用，以及食品法規稽查", focus:"優先確認校園、醫療、長照、軍隊等敏感供餐場域是否使用受影響產品。", risk:"採購或食材登錄資料與衛生機關產品清單未能即時比對。", handoff:"場域主管機關負責停用與供餐管理，衛生機關負責食品法規查核與處置。" },
];

const states = [
  ["01", "疑似風險", "已有合理疑慮，資訊仍待確認。", "蒐證、比對、擴大抽樣"],
  ["02", "預防性控制", "先阻止風險繼續流通，不等於最終違法認定。", "停售、封存、必要時停工"],
  ["03", "完成查核／檢驗", "交叉比對文件、流向與檢驗結果，確認事實與適用規定。", "形成處置依據"],
];

const stateOutcomes = [
  ["確認違規或不合格", "依規定辦理回收、改製、沒入或銷毀，並視違規行為裁罰及公布資訊。", "違規處置"],
  ["確認合格或風險排除", "符合主管機關所定條件後，解除封存或恢復流通。", "解除管制"],
];

const failurePoints = [
  ["過度依賴單一資料源", "若只依業者清冊追查，漏報或錯報就會縮小風險範圍。", "交叉比對 ERP、發票、物流、下游進貨與槽體紀錄。"],
  ["中央與地方資訊不同步", "新增批次、產品名單與回收量出現多個版本，難以確認何者最新。", "建立具時間戳、修訂紀錄與統一欄位的單一資料版本。"],
  ["檢驗與下架門檻混淆", "產品合格標準與資訊未明時的預防性控制標準，回答的是不同問題。", "公開風險依據、適用範圍與重新評估時間。"],
  ["跨區事件升級太晚", "大型上游已跨縣市或涉及敏感供餐場域，仍按單一地方案件處理。", "以跨縣市、團膳、高健康風險及資料疑點作為明確升級條件。"],
  ["用稽查家數取代風險指標", "公布查核家數，卻未說明產品總量、回收率與未知流向是否逐步歸零。", "以原料總量、回收率、未確認下游及待驗批次衡量控制成效。"],
];

const myths = [
  ["地方要等中央指示才能下架？", "不是。地方主管機關依法可進廠、抽驗，並在法定要件下命暫停作業、停止販賣及封存產品。"],
  ["事情發生在哪個縣市，就全部由該縣市負責？", "不是。源頭所在地查工廠，各地查轄內下游，中央整合跨縣市措施。"],
  ["一定要檢驗不合格才能停售？", "不是。有合理危害疑慮即可先採預防性控制；沒入、銷毀或裁罰則須符合各自法定要件與證據門檻。"],
  ["中央公布原則後，地方只要照表執行？", "不完整。中央的全國判斷仍依賴地方取得的批號、流向、檢體與現場資料；地方也須持續回報新事證。"],
  ["稽查家數越多，代表風險已受控？", "不一定。必須看總量能否勾稽、下游是否全數確認，以及未知去向是否歸零。"],
];

const checks = [
  "異常訊號最早何時出現、由誰發現，證據來源是什麼？",
  "業者何時知悉，何時採取停產、停售、回收及通報措施？",
  "地方主管機關何時知悉，並採取哪些風險控制與查證措施？",
  "何時出現跨縣市、敏感場域或重大風險等升級條件？由誰掌握？",
  "中央何時提出全國一致的下架範圍、產品名單、檢驗與解封原則？",
  "生產、庫存、出貨、回收及未知流向能否完整勾稽？尚缺哪些資料？",
];
const checkTopics = ["異常訊號", "業者知悉與控制", "地方知悉與處置", "跨區升級條件", "中央統一原則", "數量與流向勾稽"];
type CheckStatus = "confirmed" | "partial" | "conflict" | "unknown";
const checkStates: { id: CheckStatus; label: string; definition: string }[] = [
  { id: "confirmed", label: "已確認", definition: "有可核對的正式資料" },
  { id: "partial", label: "部分確認", definition: "只回答部分時間、數量或行動" },
  { id: "conflict", label: "資訊衝突", definition: "不同來源的說法無法相互吻合" },
  { id: "unknown", label: "未確認", definition: "尚未找到足以判讀的公開資料" },
];

const majorEvents = [
  { id:"melamine-2008", year:"2008", title:"中國乳製品三聚氰胺事件", type:"乳製品", scenario:"邊境輸入", status:"邊境強化", issue:"中國三鹿奶粉檢出三聚氰胺後，台灣追查輸入乳粉及使用該原料的下游加工產品。", response:"清查輸入與下游流向、封存相關產品，並提高中國乳製品輸入查驗強度。", lesson:"境外警訊不能只停在邊境批次；原料已進入國內製造鏈時，必須同步追查加工品與銷售流向。", source:"https://www.fda.gov.tw/TC/csmnewsContent.aspx?id=132&mid=272" },
  { id:"plasticizer-2011", year:"2011", title:"塑化劑污染起雲劑事件", type:"食品添加物", scenario:"供應鏈追溯", status:"制度改革", issue:"稽查時從益生菌產品發現 DEHP，後續確認業者將塑化劑蓄意加入起雲劑，並波及食品與保健產品供應鏈。", response:"追查起雲劑上下游、啟動食品源頭控制與國際通報，並推動食品業者登錄、自主管理及追溯制度改革。", lesson:"化工原料若未與食品添加物分流管理，業者資料與原料流向就可能成為系統性盲點。", source:"https://www.fda.gov.tw/TC/publishJFDAListContent.aspx?id=2058" },
  { id:"starch-2013", year:"2013", title:"順丁烯二酸酐化製澱粉事件", type:"澱粉製品", scenario:"非法添加", status:"完成處置", issue:"食品業者使用未經核准的順丁烯二酸酐化製澱粉產製食品，涉及違反當時食品衛生管理規定。", response:"食藥署訂定污染食品處理原則，地方追查涉案業者與產品，並依產品風險及違法情節下架處置。", lesson:"添加物是否准用與終端產品風險是兩個判斷層次，均須有清楚的追溯與處置規則。", source:"https://www.fda.gov.tw/tc/siteListContent.aspx?id=7843&sid=3498" },
  { id:"adulterated-oil-2013", year:"2013", title:"大統長基偽摻油品事件", type:"油品", scenario:"刑事偵辦", status:"司法與賠償", issue:"調查發現低價油品混充高價油品，並涉及以銅葉綠素調色及不實標示。", response:"檢警與衛生機關進廠追查、產品下架，後續推動油品檢驗方法、加重責任及消費訴訟。", lesson:"合格成分被用於不准用的食品或用來掩飾產品真實性，仍可能構成重大食安與詐欺問題。", source:"https://www.fda.gov.tw/TC/newsContent.aspx?cid=4&id=13988" },
  { id:"recycled-oil-2014", year:"2014", title:"強冠回收油／黑心油品事件", type:"油品", scenario:"供應鏈追溯", status:"制度改革", issue:"回收廢油與非食用油脂進入食用豬油供應鏈，影響大量下游食品業者。", response:"擴大封存、下架與流向追查，強化輸入油品證明與逐批查驗，並修法建立食安會報、三級品管及追溯制度。", lesson:"只檢驗成品不一定能辨識原料身分；必須同時管理廢油流向、輸入證明與供應鏈交易紀錄。", source:"https://www.fda.gov.tw/tc/sitecontent.aspx?sid=4094" },
  { id:"dimethyl-yellow-2014", year:"2014", title:"豆干二甲基黃事件", type:"豆製品", scenario:"非法添加", status:"制度強化", issue:"工業染料二甲基黃經乳化劑原料進入豆製品供應鏈，影響多家豆干與相關產品。", response:"地方追查原料與下游產品、辦理下架封存；中央建立檢驗方法並運用業者登錄資料協助追溯。", lesson:"非法添加可能藏在複合原料中，必須同時核對配方、供應商、製造紀錄與下游產品。", source:"https://www.mohw.gov.tw/cp-16-21292-1.html" },
  { id:"dioxin-eggs-2017", year:"2017", title:"雞蛋戴奧辛超標事件", type:"畜產品", scenario:"農業源頭", status:"完成處置", issue:"背景監測檢出雞蛋戴奧辛 5.23 pg/g 脂肪，超過當時 2.5 pg/g 脂肪管制限值。", response:"由批發端逆向追查蛋場，衛生、農政與環境單位聯合採樣，並下架受影響雞蛋。", lesson:"環境污染案件必須從食品檢體回追飼養場與污染源，不能只停在零售端抽驗。", source:"https://www.fda.gov.tw/TC/siteContent.aspx?sid=9438" },
  { id:"fipronil-eggs-2017", year:"2017", title:"雞蛋芬普尼事件", type:"畜產品", scenario:"農業源頭", status:"跨部會處置", issue:"國際警訊後，台灣擴大全國蛋雞場抽驗並檢出芬普尼不合格雞蛋。", response:"農政與衛生體系啟動移動管制、封存、回收與流向追查，並跨部會追查用藥與環境來源。", lesson:"農場端異常需要源頭管制、上市後食品追查與跨縣市資訊同步共同運作。", source:"https://www.fda.gov.tw/tc/includes/GetFile.ashx?cid=24926&id=f636694284682773373&type=2" },
  { id:"red-yeast-2024", year:"2024", title:"小林製藥紅麴原料事件", type:"保健食品", scenario:"國際警訊", status:"預防性回收", issue:"日本發布紅麴產品健康危害與回收警訊後，台灣追查使用相關原料的輸入批次及下游產品。", response:"停止相關原料輸入、清查兩家輸入業者與 56 批產品、啟動回收，並受理疑似不良反應通報。", lesson:"國際警訊的處理不只看產品檢驗，也要把輸入紀錄、下游使用與健康通報串在一起。", source:"https://www.fda.gov.tw/tc/newsContent.aspx?cid=4&id=t622694" },
  { id:"baolin-2024", year:"2024", title:"寶林茶室邦克列酸中毒事件", type:"食品中毒", scenario:"醫療通報", status:"跨域調查", issue:"多名消費者用餐後出現嚴重不適，後續檢體確認涉及邦克列酸，成為台灣首見相關食品中毒事件。", response:"醫療通報後由衛生、疾管、地方與毒理專家協作，採集人體、食品及環境檢體並追查共同餐食與製程。", lesson:"急性食品中毒需把臨床通報、流行病學調查、食品稽查與實驗室檢驗同步整合。", source:"https://www.fda.gov.tw/tc/newsContent.aspx?cid=4&id=t622705" },
  { id:"sudan-red-2024", year:"2024", title:"辣椒粉蘇丹紅事件", type:"香辛料", scenario:"邊境輸入", status:"邊境強化", issue:"輸入辣椒粉及其下游產品檢出不得使用的蘇丹色素，問題沿原料供應鏈擴散。", response:"對涉案出口商與製造廠暫停輸入查驗，特定來源辣椒粉採 100% 逐批查驗，國內同步封存與下架。", lesson:"邊境查驗與後市場抽驗必須互相回饋；一旦發現系統性異常，管制應從單批產品升級到來源業者。", source:"https://www.fda.gov.tw/TC/newsContent.aspx?cid=4&id=t622577" },
  { id:"zhonglian-2026", year:"2026", title:"中聯油脂苯駢芘超標事件", type:"油品", scenario:"供應鏈追溯", status:"持續追查", issue:"大豆沙拉油多批檢出苯(a)駢芘超過 2.0 μg/kg 限量；截至 7 月 16 日累計 7 批超標、30 批納入追查。", response:"源頭停產、擴大預防性下架、追查衍生產品，並對四家油脂工廠全面實地稽查與抽驗。", lesson:"留樣、出貨品與下游檢驗不一致時，政府不能只依業者清冊，必須擴大抽樣並交叉勾稽所有流向。", source:"https://www.fda.gov.tw/tc/csmnewsContent.aspx?id=t634505&mid=267" },
];

const caseLinks: Record<string, CaseLink> = {
  "melamine-2008": { roles:["business","local","central"], steps:[0,1,2,3,4,5], chains:[2,3,4], failures:[0,1,3,4], evidence:"境外警訊與邊境批次是追查起點；原料流入國內後，仍須另行確認加工品、庫存與銷售流向。" },
  "plasticizer-2011": { roles:["business","local","central","justice"], steps:[0,1,2,3,4,5], chains:[3,4], failures:[0,3,4], evidence:"本案從異常檢出進入源頭控制與追查，後續另涉及故意添加與刑事責任認定。" },
  "starch-2013": { roles:["business","local","central"], steps:[0,1,2,3,4,5], chains:[3,4], failures:[0,2,4], evidence:"須分開判斷添加物是否准用、產品風險及後續行政處置，不能只用單一檢驗結果概括。" },
  "adulterated-oil-2013": { roles:["business","local","central","justice"], steps:[0,1,2,3,5], chains:[3,4], failures:[0,2,4], evidence:"除食品規格與標示外，還須以製程、交易與主觀故意等證據判斷摻偽及刑事責任。" },
  "recycled-oil-2014": { roles:["business","local","central","cabinet","justice"], steps:[0,1,2,3,4,5], chains:[1,3,4], failures:[0,1,3,4], evidence:"預防性封存與下架可先控制風險；原料身分、流向及故意行為則須另行查證。" },
  "dimethyl-yellow-2014": { roles:["business","local","central","justice"], steps:[0,1,2,3,4,5], chains:[3,4], failures:[0,1,2,4], evidence:"檢出非法色素可控制產品；原料如何進入配方及影響哪些下游，仍須比對交易、製程與流向資料。" },
  "dioxin-eggs-2017": { roles:["business","local","central","cabinet"], steps:[0,1,2,3,4,5], chains:[0,1,4], failures:[0,1,3], evidence:"食品檢體超標是控制起點，污染源與受影響蛋場範圍仍需農政、環保與衛生體系共同確認。" },
  "fipronil-eggs-2017": { roles:["business","local","central","cabinet"], steps:[0,1,2,3,4,5], chains:[0,1,4], failures:[0,1,3,4], evidence:"蛋場檢驗結果可啟動移動管制；受影響雞蛋流向與用藥來源仍須跨農政、衛生與地方資料確認。" },
  "red-yeast-2024": { roles:["business","local","central"], steps:[0,1,2,3,4,5], chains:[2,3,4], failures:[0,1,3,4], evidence:"國外回收警訊可觸發預防措施；國內影響範圍須以輸入批次、下游使用及不良反應通報共同判讀。" },
  "baolin-2024": { roles:["business","local","central","cabinet"], steps:[0,1,2,3,4,5], chains:[3,4], failures:[0,1,3,4], evidence:"臨床症狀與共同餐食形成警訊；病因確認須結合流行病學、人體、食品與環境檢體。" },
  "sudan-red-2024": { roles:["business","local","central","justice"], steps:[0,1,2,3,4,5], chains:[2,3,4], failures:[0,1,3,4], evidence:"邊境與後市場異常可先觸發封存下架；來源業者、同類產品與違法責任須依追查結果擴大。" },
  "zhonglian-2026": { roles:["business","local","central","justice"], steps:[0,1,2,3,4,5], chains:[3,4], failures:[0,1,2,3,4], evidence:"已確認超標批次可依法處置；擴大預防性下架、延遲通報與刑事責任各自需要不同證據。" },
};

const roleIcons = [ShieldCheckIcon, BuildingOffice2Icon, GlobeAsiaAustraliaIcon, BuildingLibraryIcon, ScaleIcon];
const stepIcons = [ExclamationTriangleIcon, ClipboardDocumentCheckIcon, MagnifyingGlassIcon, ArrowPathIcon, MapIcon, CheckBadgeIcon];
const chainIcons = [BeakerIcon, ExclamationTriangleIcon, GlobeAsiaAustraliaIcon, BuildingOffice2Icon, TruckIcon, AcademicCapIcon];
const checkIcons = [MagnifyingGlassIcon, ExclamationTriangleIcon, BuildingOffice2Icon, MapIcon, GlobeAsiaAustraliaIcon, ArrowPathIcon];

export default function Home() {
  const [preloadProgress, setPreloadProgress] = useState(12);
  const [preloading, setPreloading] = useState(true);
  const [activeRole, setActiveRole] = useState(roles[0].id);
  const [roleView, setRoleView] = useState<RoleView>("summary");
  const [activeStep, setActiveStep] = useState(0);
  const [chainModalIndex, setChainModalIndex] = useState<number | null>(null);
  const [insightMode, setInsightMode] = useState<"diagnosis" | "myths">("diagnosis");
  const [openInsight, setOpenInsight] = useState<number | null>(0);
  const [checkResults, setCheckResults] = useState<(CheckStatus | null)[]>(checks.map(() => null));
  const [activeCheck, setActiveCheck] = useState(0);
  const [eventYear, setEventYear] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [eventScenario, setEventScenario] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("zhonglian-2026");
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [caseMode, setCaseMode] = useState(false);
  const [menuScrolled, setMenuScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overviewRoleId, setOverviewRoleId] = useState<string | null>(null);
  useEffect(() => {
    let finished = false;
    const timers: number[] = [];
    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay);
      timers.push(timer);
      return timer;
    };
    const advance = (value: number) => setPreloadProgress((current) => Math.max(current, value));
    later(() => advance(32), 60);
    later(() => advance(58), 180);
    const finish = () => {
      if (finished) return;
      finished = true;
      advance(86);
      later(() => advance(100), 130);
      later(() => setPreloading(false), 430);
    };
    const fallback = later(finish, 2400);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        window.clearTimeout(fallback);
        finish();
      });
    } else {
      finish();
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);
  useEffect(() => {
    const updateMenu = () => setMenuScrolled(window.scrollY > 24);
    updateMenu();
    window.addEventListener("scroll", updateMenu, { passive: true });
    return () => window.removeEventListener("scroll", updateMenu);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (!window.matchMedia("(max-width: 980px)").matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    window.addEventListener("resize", closeOnDesktop, { passive: true });
    return () => {
      window.removeEventListener("keydown", closeMenu);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuOpen]);
  useEffect(() => {
    if (!overviewRoleId && chainModalIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOverviewRoleId(null);
        setChainModalIndex(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [overviewRoleId, chainModalIndex]);
  const role = useMemo(() => roles.find((item) => item.id === activeRole) ?? roles[0], [activeRole]);
  const overviewRole = overviewRoleId ? roles.find((item) => item.id === overviewRoleId) ?? null : null;
  const overviewRoleIndex = overviewRole ? roles.findIndex((item) => item.id === overviewRole.id) : 0;
  const OverviewRoleIcon = roleIcons[Math.max(0, overviewRoleIndex)];
  const reviewed = checkResults.filter(Boolean).length;
  const checkCounts = Object.fromEntries(checkStates.map(({ id }) => [id, checkResults.filter((value) => value === id).length])) as Record<CheckStatus, number>;
  const pendingChecks = checks.length - reviewed;
  const checkAssessment = reviewed === 0
    ? { tone: "neutral", level: "尚未判讀", headline: "先標示六項資料狀態", detail: "這裡判讀的是公開資訊是否足以釐清責任，不是勾選完成度。", next: "先依各題現有證據，選擇最符合的資料狀態。" }
    : checkCounts.conflict > 0
      ? { tone: "danger", level: "高優先追查", headline: `${checkCounts.conflict} 項資訊互相衝突`, detail: `目前不宜直接定責${pendingChecks ? `，另有 ${pendingChecks} 項尚未標示` : ""}。`, next: "先比對原始文件、發布時間、採樣或統計口徑，找出衝突來源。" }
      : checkCounts.unknown >= 2
        ? { tone: "danger", level: "重大資料缺口", headline: `${checkCounts.unknown} 項關鍵事實未確認`, detail: `現有公開資料不足以形成可靠責任判斷${pendingChecks ? `，另有 ${pendingChecks} 項尚未標示` : ""}。`, next: "優先要求公開知悉時間、控制措施、流向與數量勾稽資料。" }
        : pendingChecks > 0
          ? { tone: "neutral", level: "判讀進行中", headline: `尚有 ${pendingChecks} 項未標示`, detail: "目前只能看到局部資訊狀態，不能據此判定哪一方應負主要責任。", next: "完成其餘項目；遇到資料不足時應選「部分確認」或「未確認」。" }
          : checkCounts.unknown > 0 || checkCounts.partial >= 2
            ? { tone: "warning", level: "需要補強證據", headline: "目前不足以完成責任判讀", detail: `共有 ${checkCounts.unknown + checkCounts.partial} 項資料未完全確認。`, next: "補齊具體時間、批號、數量、行動紀錄與主管機關依據。" }
            : checkCounts.partial > 0
              ? { tone: "warning", level: "可初步判讀", headline: "仍有一項資料需要補強", detail: "可開始比較各方行動，但結論應保留條件並標示證據限制。", next: "交叉驗證尚未完整的項目，再比較法定義務與處置時效。" }
              : { tone: "clear", level: "資料基礎完整", headline: "可進入責任比較", detail: "六項關鍵事實都有可核對資料，但責任仍須依法律義務與實際行動判斷。", next: "比較業者、地方與中央各自的知悉時間、法定義務、行動與證據。" };
  const eventYears = [...new Set(majorEvents.map((event) => event.year))].sort((a,b) => Number(b)-Number(a));
  const eventTypes = [...new Set(majorEvents.map((event) => event.type))];
  const eventScenarios = [...new Set(majorEvents.map((event) => event.scenario))];
  const visibleEvents = useMemo(() => majorEvents.filter((event) =>
    (eventYear === "all" || event.year === eventYear) &&
    (eventType === "all" || event.type === eventType) &&
    (eventScenario === "all" || event.scenario === eventScenario)
  ), [eventYear,eventType,eventScenario]);
  const eventDetail = visibleEvents.find((event) => event.id === selectedEvent) ?? visibleEvents[0];
  const caseSummary = caseMode && eventDetail ? caseLinks[eventDetail.id] : null;
  const recentEvents = visibleEvents.slice(-6);
  const displayedEvents = eventsExpanded || visibleEvents.length <= 6
    ? visibleEvents
    : eventDetail && !recentEvents.some((event) => event.id === eventDetail.id)
      ? [eventDetail, ...recentEvents.slice(1)]
      : recentEvents;
  const chainModalNode = chainModalIndex === null ? null : supplyChain[chainModalIndex];
  const ChainModalIcon = chainIcons[chainModalIndex ?? 0];
  const revealMobile = (selector: string) => {
    if (!window.matchMedia("(max-width: 640px)").matches) return;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      const headerHeight = document.querySelector<HTMLElement>(".topbar")?.offsetHeight ?? 116;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 10);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }));
  };
  const showGovernanceRole = (roleId: string) => {
    setOverviewRoleId(roleId);
  };
  const openCaseJourney = (mobile: boolean) => {
    setCaseMode(true);
    if (mobile) revealMobile(".event-detail.mobile-inline-detail .case-journey");
  };
  const selectCheckStatus = (index: number, status: CheckStatus) => {
    const updated = checkResults.map((value, itemIndex) => itemIndex === index ? status : value);
    const nextIndex = updated.findIndex((value, itemIndex) => itemIndex > index && !value);
    setCheckResults(updated);
    setActiveCheck(nextIndex >= 0 ? nextIndex : index);
    revealMobile(nextIndex >= 0 ? `.check-row:nth-child(${nextIndex + 1})` : ".check-score");
  };
  const smoothScrollTo = (event: { preventDefault: () => void }, hash: string) => {
    event.preventDefault();
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    setMenuOpen(false);
    const headerHeight = window.matchMedia("(max-width: 980px)").matches
      ? 66
      : document.querySelector<HTMLElement>(".topbar")?.offsetHeight ?? 76;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 8);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.history.pushState(null, "", hash);
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };
  const roleDetailPanel = (mobile = false) => <div className={`role-detail ${mobile ? "mobile-inline-detail" : "desktop-detail"}`} role="tabpanel">
    <div className="role-view-tabs" role="tablist" aria-label={`${role.label}內容分類`}>
      {([['summary','角色摘要'],['terms','名詞解說'],['practice','實務補充'],['resources','官方資源']] as [RoleView,string][]).map(([id,label]) => <button key={id} role="tab" aria-selected={roleView === id} onClick={() => setRoleView(id)}>{label}</button>)}
    </div>
    <div className="role-view-content">
      {roleView === "summary" && <><div><span className={`detail-dot ${role.tone}`} /><p className="detail-label">目前角色</p><h3>{role.label}</h3><p className="detail-duty">{role.duty}</p></div><div><p className="detail-label">應做什麼</p><ul>{role.powers.map((power) => <li key={power}>{power}</li>)}</ul></div><div className="boundary"><p className="detail-label">責任邊界</p><p>{role.boundary}</p></div></>}
      {roleView === "terms" && <section className="role-glossary role-view-panel"><div className="role-panel-heading"><p className="detail-label">名詞解說</p><h3>先釐清這三個關鍵概念</h3></div><dl>{role.terms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section>}
      {roleView === "practice" && <section className="role-practice role-view-panel"><div className="role-panel-heading"><p className="detail-label">實務補充</p><h3>執行時還要注意什麼？</h3></div><ol>{role.more.map((item,index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol></section>}
      {roleView === "resources" && <section className="role-links role-view-panel"><div className="role-panel-heading"><p className="detail-label">官方延伸資源</p><h3>查看主管機關原始資料</h3></div><div>{role.links.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer"><span>{item.label}</span><b aria-hidden="true">↗</b></a>)}</div></section>}
    </div>
  </div>;
  const caseJourneyPanel = () => {
    if (!caseSummary || !eventDetail) return null;
    const summaryRows = [
      ["01", "涉及角色", caseSummary.roles.flatMap((id) => {
        const item = roles.find((roleItem) => roleItem.id === id);
        return item ? [item.label] : [];
      }).join("、")],
      ["02", "應變範圍", caseSummary.steps.flatMap((index) => steps[index] ? [steps[index].title] : []).join("、")],
      ["03", "監管節點", caseSummary.chains.flatMap((index) => supplyChain[index] ? [supplyChain[index].title] : []).join("、")],
      ["04", "制度觀察", caseSummary.failures.flatMap((index) => failurePoints[index] ? [failurePoints[index][0]] : []).join("、")],
    ];
    return <aside className="case-journey inline-case-journey" aria-live="polite">
      <header><div><span>案例制度摘要</span><h3>{eventDetail.title}</h3><p>以下僅整理本案涉及的制度面向與範圍，不連動其他區塊，也不代表責任認定。</p></div><button onClick={()=>setCaseMode(false)}>關閉摘要</button></header>
      <div className="case-summary-grid" aria-label="案例制度摘要四面向">
        {summaryRows.map(([number, title, description]) => <div key={number}><b>{number}</b><span>{title}<small>{description}</small></span></div>)}
      </div>
    </aside>;
  };
  const eventDetailPanel = (mobile = false) => eventDetail && <article className={`event-detail ${mobile ? "mobile-inline-detail" : "desktop-detail"}`}><div className="event-meta"><span>{eventDetail.year}</span><b>{eventDetail.type}</b><b>{eventDetail.scenario}</b><em>{eventDetail.status}</em></div><h3>{eventDetail.title}</h3><dl><div><dt>已知問題</dt><dd>{eventDetail.issue}</dd></div><div><dt>主要處置</dt><dd>{eventDetail.response}</dd></div><div><dt>治理觀察</dt><dd>{eventDetail.lesson}</dd></div></dl><div className="event-actions"><button className="case-apply" onClick={()=>openCaseJourney(mobile)}>{caseMode ? "制度摘要已展開 ↓" : "查看制度摘要 →"}</button><a href={eventDetail.source} target="_blank" rel="noreferrer">查看官方來源 ↗</a></div>{caseJourneyPanel()}</article>;
  const stepDetailPanel = (mobile = false) => <div className={`system-detail ${mobile ? "mobile-inline-detail" : "desktop-detail"}`}>
    {mobile && <nav className="mobile-detail-nav" aria-label="應變步驟切換"><button disabled={activeStep === 0} onClick={()=>{setActiveStep(Math.max(0,activeStep-1));revealMobile('.system-detail.mobile-inline-detail');}}>← 上一步</button><span>步驟 {activeStep+1}／{steps.length}</span><button disabled={activeStep === steps.length-1} onClick={()=>{setActiveStep(Math.min(steps.length-1,activeStep+1));revealMobile('.system-detail.mobile-inline-detail');}}>下一步 →</button></nav>}
    <div><span className="step-tag">STEP {String(activeStep + 1).padStart(2, "0")}</span><h3>{steps[activeStep].title}</h3><p>{steps[activeStep].summary}</p></div>
    <ol>{steps[activeStep].actions.map((action, index) => <li key={action}><span>{index + 1}</span>{action}</li>)}</ol>
  </div>;

  return (
    <main aria-busy={preloading}>
      {preloading && <div className="preloader" role="progressbar" aria-label="網站載入進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={preloadProgress}>
        <div className="preloader-panel">
          <span className="preloader-mark">食安</span>
          <p>台灣食安治理導航</p>
          <strong>{preloadProgress}<small>%</small></strong>
          <div className="preloader-track" aria-hidden="true"><i style={{ width: `${preloadProgress}%` }} /></div>
          <small>正在準備字型與互動內容</small>
        </div>
      </div>}
      <header className={`topbar ${menuScrolled ? "scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}>
        <a href="#top" className="brand" aria-label="台灣食安治理｜回到首頁" onClick={(event) => smoothScrollTo(event, "#top")}>
          <ShieldCheckIcon className="brand-logo" aria-hidden="true" />
          <span className="brand-title-short">台灣食安治理</span>
        </a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "關閉導覽選單" : "開啟導覽選單"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span /><span />
        </button>
        <nav id="site-navigation" aria-label="主要導覽">
          <a href="#overview" onClick={(event) => smoothScrollTo(event, "#overview")}><ArrowPathIcon aria-hidden="true" />治理流程總覽</a><a href="#roles" onClick={(event) => smoothScrollTo(event, "#roles")}><UserGroupIcon aria-hidden="true" />權責分工</a><a href="#events" onClick={(event) => smoothScrollTo(event, "#events")}><MagnifyingGlassIcon aria-hidden="true" />事件案例</a><a href="#incident" onClick={(event) => smoothScrollTo(event, "#incident")}><MapIcon aria-hidden="true" />應變流程</a><a href="#management" onClick={(event) => smoothScrollTo(event, "#management")}><GlobeAsiaAustraliaIcon aria-hidden="true" />日常監管</a><a href="#check" onClick={(event) => smoothScrollTo(event, "#check")}><ClipboardDocumentCheckIcon aria-hidden="true" />責任判讀</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">TAIWAN FOOD SAFETY GOVERNANCE</p>
          <div className="hero-title-row"><ShieldCheckIcon aria-hidden="true" /><h1>台灣食安管理流程與權責分工</h1></div>
          <p className="lede">先釐清權責，再用重大事件帶入應變、日常監管與處置門檻；最後檢查制度斷點、補齊事實並判讀責任。</p>
          <div className="hero-links"><a className="primary-link" href="#overview" onClick={(event) => smoothScrollTo(event, "#overview")}><ArrowDownIcon aria-hidden="true" /><span>先看治理全貌</span></a><a href="#incident" onClick={(event) => smoothScrollTo(event, "#incident")}>直接查看應變流程 →</a></div>
        </div>
        <aside className="governance-visual" aria-label="食安治理五方協作主視覺">
          <div className="visual-orbit" aria-hidden="true" />
          <div className="visual-core"><ShieldCheckIcon /><span>食安治理</span><b>協作鏈</b></div>
          <div className="visual-node visual-business"><UserGroupIcon /><span>業者</span></div>
          <div className="visual-node visual-local"><BuildingOffice2Icon /><span>地方</span></div>
          <div className="visual-node visual-central"><GlobeAsiaAustraliaIcon /><span>中央</span></div>
          <div className="visual-node visual-cabinet"><BuildingLibraryIcon /><span>跨部會</span></div>
          <div className="visual-node visual-justice"><ScaleIcon /><span>司法</span></div>
          <div className="visual-caption">
            <span className="visual-caption-label">核心治理原則</span>
            <div className="principle-card"><BuildingOffice2Icon aria-hidden="true" /><span><small>地方政府</small><b>查清現場事實</b></span></div>
            <i className="principle-link" aria-label="協作">＋</i>
            <div className="principle-card"><GlobeAsiaAustraliaIcon aria-hidden="true" /><span><small>中央政府</small><b>畫定全國風險邊界</b></span></div>
          </div>
        </aside>
      </section>

      <section className="governance-summary" id="overview" aria-labelledby="governance-summary-title">
        <div className="governance-summary-heading">
          <p className="kicker">治理流程總覽</p>
          <h2 id="governance-summary-title" className="summary-title"><ArrowPathIcon aria-hidden="true" /><span>從第一責任到事件分流</span></h2>
          <p>先掌握整體協作關係，再開啟各角色的獨立詳情；跨部會協作與司法偵辦依事件性質分流，並非每案都會啟動。</p>
        </div>
        <div className="governance-summary-flow">
          <button type="button" aria-haspopup="dialog" onClick={() => showGovernanceRole("business")}><span><ShieldCheckIcon aria-hidden="true" /><b>01</b></span><strong>業者自主控制與通報</strong><small>第一責任</small><i>開啟業者詳情 →</i></button>
          <button type="button" aria-haspopup="dialog" onClick={() => showGovernanceRole("local")}><span><BuildingOffice2Icon aria-hidden="true" /><b>02</b></span><strong>地方查證與控制現場</strong><small>第一線執法</small><i>開啟地方詳情 →</i></button>
          <button type="button" aria-haspopup="dialog" onClick={() => showGovernanceRole("central")}><span><GlobeAsiaAustraliaIcon aria-hidden="true" /><b>03</b></span><strong>中央跨區統籌</strong><small>全國風險管理</small><i>開啟中央詳情 →</i></button>
          <article className="governance-branch"><span><ArrowPathIcon aria-hidden="true" /><b>04</b></span><strong>依事件性質分流</strong><small>兩者可分別或同時啟動</small><div><button type="button" aria-haspopup="dialog" onClick={() => showGovernanceRole("cabinet")}><BuildingLibraryIcon aria-hidden="true" />跨部會協作詳情</button><button type="button" aria-haspopup="dialog" onClick={() => showGovernanceRole("justice")}><ScaleIcon aria-hidden="true" />司法偵辦詳情</button></div></article>
        </div>
      </section>

      {overviewRole && <div className="overview-modal" role="presentation" onMouseDown={() => setOverviewRoleId(null)}>
        <article className="overview-modal-panel" role="dialog" aria-modal="true" aria-labelledby="overview-modal-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="overview-modal-close" type="button" aria-label="關閉詳情" autoFocus onClick={() => setOverviewRoleId(null)}>×</button>
          <header><span><OverviewRoleIcon aria-hidden="true" />角色 0{overviewRoleIndex + 1}</span><h3 id="overview-modal-title">{overviewRole.label}</h3><b>{overviewRole.short}</b><p>{overviewRole.duty}</p></header>
          <div className="overview-modal-content">
            <section><p className="detail-label">主要任務</p><ul>{overviewRole.powers.map((power) => <li key={power}>{power}</li>)}</ul></section>
            <aside><p className="detail-label">責任邊界</p><p>{overviewRole.boundary}</p></aside>
            <section className="overview-modal-terms"><p className="detail-label">關鍵名詞</p><dl>{overviewRole.terms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section>
          </div>
        </article>
      </div>}

      <section className="section roles-section" id="roles">
        <div className="section-heading">
          <div><p className="kicker">01｜權責架構</p><h2 className="title-with-icon"><UserGroupIcon aria-hidden="true" /><span>先分清楚：誰負責現場，誰統籌全國？</span></h2></div>
          <p>五類角色不是單純上下級，而是依風險來源、執法場域及案件規模分工。選擇角色查看任務、責任邊界、名詞解說與官方資源。</p>
        </div>
        <div className="role-tabs" role="tablist" aria-label="治理角色">
          {roles.map((item, index) => { const Icon = roleIcons[index]; return (
            <Fragment key={item.id}><button role="tab" aria-selected={activeRole === item.id} className={`role-tab ${item.tone}`} onClick={() => { setActiveRole(item.id); setRoleView("summary"); revealMobile(".role-detail.mobile-inline-detail"); }}>
              <span className="role-top"><span className="role-index">0{index + 1}</span><Icon aria-hidden="true" /></span><b>{item.label}</b><small>{item.short}</small>
            </button>{activeRole === item.id && roleDetailPanel(true)}</Fragment>
          ); })}
        </div>
        {roleDetailPanel()}
      </section>

      <section className="section event-section" id="events">
        <div className="section-heading">
          <div><p className="kicker">02｜事件案例</p><h2 className="title-with-icon"><NewspaperIcon aria-hidden="true" /><span>用重大事件對照制度如何運作</span></h2></div>
          <p>這是代表性案例索引，不是完整案件資料庫或即時風險清單；個案狀態與數字仍應以官方最新公告為準。</p>
        </div>
        <div className="event-controls" aria-label="重大食安事件篩選">
          <label><span>年份</span><div className="select-field"><select value={eventYear} onChange={(event)=>setEventYear(event.target.value)}><option value="all">全部年份</option>{eventYears.map((year)=><option key={year}>{year}</option>)}</select></div></label>
          <label><span>事件類型</span><div className="select-field"><select value={eventType} onChange={(event)=>setEventType(event.target.value)}><option value="all">全部類型</option>{eventTypes.map((type)=><option key={type}>{type}</option>)}</select></div></label>
          <label><span>制度情境</span><div className="select-field"><select value={eventScenario} onChange={(event)=>setEventScenario(event.target.value)}><option value="all">全部情境</option>{eventScenarios.map((scenario)=><option key={scenario}>{scenario}</option>)}</select></div></label>
          <div className="result-count"><strong>{visibleEvents.length}</strong><span>筆事件</span></div>
        </div>
        {eventDetail ? <div className="event-browser">
          <div className="event-list-column"><div className="event-list" role="listbox" aria-label="事件清單">{displayedEvents.map((event)=><Fragment key={event.id}><button role="option" aria-selected={eventDetail.id===event.id} onClick={()=>{setSelectedEvent(event.id);revealMobile(".event-detail.mobile-inline-detail");}}><span>{event.year}</span><div><b>{event.title}</b><small>{event.type} · {event.scenario}</small></div><em>{event.status}</em></button>{eventDetail.id===event.id&&eventDetailPanel(true)}</Fragment>)}</div>{visibleEvents.length > 6 && <button className="event-list-toggle" onClick={()=>setEventsExpanded((value)=>!value)}>{eventsExpanded ? "收合較早事件 ↑" : `顯示全部 ${visibleEvents.length} 筆事件 ↓`}</button>}</div>
          {eventDetailPanel()}
        </div> : <div className="event-empty">找不到符合條件的事件，請調整年份、事件類型或制度情境。</div>}
      </section>

      <section className="system-section" id="incident">
        <div className="system-header">
          <div><p className="kicker light">03｜事件應變</p><h2 className="title-with-icon"><MapIcon aria-hidden="true" /><span>食安事件如何從警訊走到處置？</span></h2></div>
          <p>這是一般化的應變邏輯，不代表所有案件都按固定順序；風險控制、現場查證與流向追查常會同步進行。</p>
        </div>
        <div className="system-map" aria-label="食安事件六階段互動流程">
          {steps.map((step, index) => { const Icon = stepIcons[index]; return (
            <Fragment key={step.title}><button className={`system-node ${activeStep === index ? "active" : ""} ${index === 4 ? "upgrade" : ""}`} onClick={() => {setActiveStep(index);revealMobile(".system-detail.mobile-inline-detail");}} aria-pressed={activeStep === index}>
              <span className="node-top"><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden="true" /></span><b>{step.title}</b><small>{step.owner}</small>
            </button>{activeStep===index&&stepDetailPanel(true)}</Fragment>
          ); })}
        </div>
        {stepDetailPanel()}
        <div className="upgrade-rule"><b>哪些情況需要提高中央統籌層級？</b><span>大型上游原料商</span><span>跨越多個縣市</span><span>涉及校園、醫療或團膳</span><span>高健康風險</span><span>業者資料疑似不完整</span></div>
      </section>

      <section className="section" id="management">
        <div className="section-heading">
          <div><p className="kicker">04｜日常監管</p><h2 className="title-with-icon"><GlobeAsiaAustraliaIcon aria-hidden="true" /><span>從源頭到消費端，主管機關如何接力？</span></h2></div>
          <p>三類風險入口會依產品性質進入產製與供應鏈，並非所有食品都依序經過六個節點。點選節點開啟獨立詳情，查看分工與交接重點。</p>
        </div>
        <div className="chain-flow" aria-label="食品供應鏈監管接力圖">
          <div className="chain-entry-group"><span className="chain-group-label"><b>01</b><span>風險從哪裡進入？</span><small>三類入口並列，依產品性質擇一或同時涉及</small></span>{supplyChain.slice(0,3).map((node,index)=>{const Icon=chainIcons[index];return <button key={node.title} className="chain-node" type="button" aria-haspopup="dialog" onClick={()=>setChainModalIndex(index)}><span><Icon aria-hidden="true" />{String(index+1).padStart(2,"0")}</span><b>{node.title}</b><small>{node.authority}</small></button>})}</div>
          <div className="chain-bridge" aria-hidden="true"><span>進入食品鏈後</span><i>↓</i></div>
          <div className="chain-pipeline"><span className="chain-group-label"><b>02</b><span>產製與供應如何接力？</span><small>從製造加工走向流通與特殊使用場域</small></span>{supplyChain.slice(3).map((node,offset)=>{const index=offset+3;const Icon=chainIcons[index];return <button key={node.title} className="chain-node" type="button" aria-haspopup="dialog" onClick={()=>setChainModalIndex(index)}><span><Icon aria-hidden="true" />{String(index+1).padStart(2,"0")}</span><b>{node.title}</b><small>{node.authority}</small></button>})}</div>
        </div>
        {chainModalNode && <div className="overview-modal" role="presentation" onMouseDown={() => setChainModalIndex(null)}>
          <article className="overview-modal-panel chain-modal-panel" role="dialog" aria-modal="true" aria-labelledby="chain-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="overview-modal-close" type="button" aria-label="關閉節點詳情" autoFocus onClick={() => setChainModalIndex(null)}>×</button>
            <header><span><ChainModalIcon aria-hidden="true" />監管節點 {String((chainModalIndex ?? 0) + 1).padStart(2,"0")}</span><h3 id="chain-modal-title">{chainModalNode.title}</h3><b>{chainModalNode.authority}</b><p>{chainModalNode.task}</p></header>
            <div className="chain-modal-content"><section><p className="detail-label">監管重點</p><p>{chainModalNode.focus}</p></section><section><p className="detail-label">常見斷點</p><p>{chainModalNode.risk}</p></section><section><p className="detail-label">交接重點</p><p>{chainModalNode.handoff}</p></section></div>
          </article>
        </div>}
      </section>

      <section className="section evidence-section">
        <div className="section-heading">
          <div>
            <p className="kicker">05｜處置門檻</p><h2 className="title-with-icon"><ScaleIcon aria-hidden="true" /><span>風險控制與違法認定，需要不同證據</span></h2>
          </div>
          <p>預防性控制是先降低風險，不代表產品已確認違法；完成查核或檢驗後，才依結果分流處置。</p>
        </div>
        <div className="evidence-flow">
          <div className="evidence-stages">
            {states.map((state, index) => { const StageIcon = [MagnifyingGlassIcon, ShieldCheckIcon, ClipboardDocumentCheckIcon][index]; return <article className="evidence-stage" key={state[0]}><div className="evidence-card-top"><span>{state[0]}</span><figure className="evidence-illustration" aria-hidden="true"><StageIcon /></figure></div><h3>{state[1]}</h3><p>{state[2]}</p><b>{state[3]}</b></article>; })}
          </div>
          <div className="evidence-decision"><span>依查核與檢驗結果分流</span></div>
          <div className="evidence-outcomes">
            {stateOutcomes.map((outcome, index) => { const OutcomeIcon = index === 0 ? ExclamationTriangleIcon : CheckBadgeIcon; return <article className={`evidence-outcome ${index === 0 ? "noncompliant" : "compliant"}`} key={outcome[0]}><div className="evidence-outcome-top"><span>{outcome[2]}</span><figure className="evidence-illustration" aria-hidden="true"><OutcomeIcon /></figure></div><h3>{outcome[0]}</h3><p>{outcome[1]}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="section insights-section" id="diagnosis">
        <div className="section-heading">
          <div><p className="kicker">06｜治理判讀</p><h2 className="title-with-icon"><ExclamationTriangleIcon aria-hidden="true" /><span>先找制度斷點，再釐清權責迷思</span></h2></div>
          <p>兩組內容回答不同問題：制度斷點用來檢查治理是否失靈；權責迷思則避免把下架、跨區統籌與責任認定混為一談。</p>
        </div>
        <div className="insight-tabs" role="tablist" aria-label="治理判讀內容">
          <button role="tab" aria-selected={insightMode === "diagnosis"} className={insightMode === "diagnosis" ? "active" : ""} onClick={() => { setInsightMode("diagnosis"); setOpenInsight(0); }}><ExclamationTriangleIcon aria-hidden="true" /><span><b>制度斷點</b><small>檢查治理是否失靈</small></span><em>5</em></button>
          <button role="tab" aria-selected={insightMode === "myths"} className={insightMode === "myths" ? "active" : ""} onClick={() => { setInsightMode("myths"); setOpenInsight(0); }}><MagnifyingGlassIcon aria-hidden="true" /><span><b>權責迷思</b><small>釐清常見錯誤歸責</small></span><em>5</em></button>
        </div>
        <div className="insight-accordion" role="tabpanel">
          {insightMode === "diagnosis" ? failurePoints.map((point, index) => {
            const open = openInsight === index;
            return <article key={point[0]}><button aria-expanded={open} onClick={() => setOpenInsight(open ? null : index)}><span><small>診斷 0{index + 1}</small><b>{point[0]}</b></span><em>{open ? "−" : "+"}</em></button>{open && <div className="insight-detail"><div><small>風險表現</small><p>{point[1]}</p></div><div><small>改善方向</small><p>{point[2]}</p></div></div>}</article>;
          }) : myths.map((myth, index) => {
            const open = openInsight === index;
            return <article key={myth[0]}><button aria-expanded={open} onClick={() => setOpenInsight(open ? null : index)}><span><small>迷思 0{index + 1}</small><b>{myth[0]}</b></span><em>{open ? "−" : "+"}</em></button>{open && <div className="insight-detail myth-answer"><div><small>正確理解</small><p>{myth[1]}</p></div></div>}</article>;
          })}
        </div>
      </section>

      <section className="check-section" id="check">
        <div className="check-heading"><div><p className="kicker light">07｜責任判讀</p><h2 className="title-with-icon"><ClipboardDocumentCheckIcon aria-hidden="true" /><span>先補齊六項事實，再談誰該負責</span></h2></div><p>這是資料完整性檢核，不是責任評分器。逐題標示公開資料狀態後，仍須比較各方的法定義務、實際行動、時效與證據。</p></div>
        <div className="check-layout">
          <div className="checklist compact-checklist">
            {checks.map((item, index) => {
              const ItemIcon = checkIcons[index];
              const result = checkResults[index];
              const state = checkStates.find((entry) => entry.id === result);
              const open = activeCheck === index;
              return <article key={item} className={`check-row ${open ? "open" : ""} ${result ? `status-${result}` : ""}`}>
                <button className="check-row-trigger" aria-expanded={open} onClick={() => {const next = open ? -1 : index;setActiveCheck(next);if(next >= 0)revealMobile(`.check-row:nth-child(${index + 1})`);}}>
                  <span className="check-row-index"><ItemIcon aria-hidden="true" />{String(index + 1).padStart(2, "0")}</span>
                  <b>{checkTopics[index]}</b>
                  <em className={result ? `result-${result}` : ""}>{state?.label ?? "尚未標示"}</em>
                  <span className="check-chevron" aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
                {open && <div className="check-row-detail"><p>{item}</p><div className="check-statuses" role="group" aria-label={`第 ${index + 1} 題資料狀態`}>{checkStates.map((option) => <button key={option.id} className={result === option.id ? "active" : ""} aria-pressed={result === option.id} onClick={() => selectCheckStatus(index, option.id)}>{option.label}</button>)}</div><small className="check-state-help">{state?.definition ?? "請依目前可核對的公開資料選擇狀態。"}</small></div>}
              </article>;
            })}
          </div>
          <aside className={`check-score assessment-${checkAssessment.tone}`} aria-live="polite"><span>公開資訊判讀結果</span><em className="assessment-level">{checkAssessment.level}</em><strong className="assessment-headline">{checkAssessment.headline}</strong><p className="assessment-detail">{checkAssessment.detail}</p><div className="marked-progress"><span>已標示 {reviewed}／6 項</span><div className="progress" aria-label={`已標示 ${reviewed}／6 項`}><i style={{ width: `${reviewed / checks.length * 100}%` }} /></div></div><div className="next-action"><b>下一步</b><p>{checkAssessment.next}</p></div><small className="score-disclaimer">這是公開資訊的缺口與追查優先度，不是食品健康風險、責任比例或治理分數。</small><button onClick={() => { setCheckResults(checks.map(() => null)); setActiveCheck(0); }}>清除判讀結果</button></aside>
        </div>
      </section>

      <footer><span>本頁為制度流程與權責教育整理；個案事實、處分與法規版本仍應以主管機關最新公告為準。</span><a href="#top">回到頁首 ↑</a></footer>
    </main>
  );
}
