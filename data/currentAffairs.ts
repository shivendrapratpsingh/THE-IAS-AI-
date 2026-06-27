// ============================================================================
// Curated Current Affairs feed (rotates weekly). Each item has a short
// summary and a UPSC relevance tag. "Explain in UPSC context" uses Claude
// to expand on these at runtime.
// ============================================================================

export interface CurrentAffairItem {
  id: string;
  headline: string;
  summary: string; // ~3 lines
  tag: string; // UPSC relevance tag (e.g. GS2, GS3, Prelims)
  date: string; // ISO date for display
}

export const CURRENT_AFFAIRS: CurrentAffairItem[] = [
  {
    id: "ca-001",
    headline: "India's Green Hydrogen Mission gains momentum with new electrolyser manufacturing incentives",
    summary:
      "The government expanded incentive schemes for domestic electrolyser manufacturing under the National Green Hydrogen Mission. The move aims to cut import dependence and position India as a green hydrogen export hub. Several states have announced dedicated green hydrogen parks.",
    tag: "GS3 - Energy & Environment",
    date: "2026-06-08",
  },
  {
    id: "ca-002",
    headline: "Supreme Court reiterates timelines for Governors' assent to state bills",
    summary:
      "The Supreme Court issued directions on reasonable timeframes within which Governors must act on bills passed by state legislatures. The ruling addresses recurring Centre-State friction over delayed assent. It reaffirms the constitutional role of Governors as facilitators, not obstacles, to legislative processes.",
    tag: "GS2 - Polity & Governance",
    date: "2026-06-07",
  },
  {
    id: "ca-003",
    headline: "India and EU resume talks on the long-pending Free Trade Agreement (FTA)",
    summary:
      "A fresh round of India-EU FTA negotiations focused on market access for agriculture, automobiles, and services, alongside sustainability clauses. Both sides aim to balance trade liberalization with domestic industry protection. The agreement could significantly reshape India's trade relations with its largest trading bloc.",
    tag: "GS2/GS3 - International Relations & Economy",
    date: "2026-06-06",
  },
  {
    id: "ca-004",
    headline: "ISRO advances preparations for the Gaganyaan human spaceflight test missions",
    summary:
      "ISRO completed key milestones in crew escape system testing ahead of the Gaganyaan uncrewed test flights. The mission is a precursor to India's first human spaceflight. Success would make India only the fourth country to independently send humans to space.",
    tag: "GS3 - Science & Technology",
    date: "2026-06-05",
  },
  {
    id: "ca-005",
    headline: "New National Education Policy implementation review highlights gaps in foundational literacy",
    summary:
      "A government review of NEP 2020 implementation found uneven progress on foundational literacy and numeracy targets across states. The report recommends increased teacher training and remedial learning programs. Foundational learning is seen as critical for reducing later-stage dropout rates.",
    tag: "GS2 - Social Justice / Education",
    date: "2026-06-04",
  },
  {
    id: "ca-006",
    headline: "RBI's Monetary Policy Committee holds repo rate amid easing inflation",
    summary:
      "The RBI's MPC kept the repo rate unchanged, citing a gradual easing in retail inflation while flagging risks from global commodity prices. The central bank maintained its 'withdrawal of accommodation' stance review. Analysts see this as a balancing act between growth support and price stability.",
    tag: "GS3 - Indian Economy",
    date: "2026-06-03",
  },
  {
    id: "ca-007",
    headline: "India ramps up coastal surveillance with new maritime domain awareness centres",
    summary:
      "New Maritime Domain Awareness (MDA) centres were inaugurated to strengthen real-time tracking of vessels along India's coastline. The initiative is part of efforts to counter smuggling, illegal fishing, and maritime security threats. It complements the Indian Navy's Information Fusion Centre for the Indian Ocean Region.",
    tag: "GS3 - Internal Security",
    date: "2026-06-02",
  },
  {
    id: "ca-008",
    headline: "Cabinet approves extension of PM Awas Yojana targets for rural housing",
    summary:
      "The Union Cabinet approved an extension and expansion of housing targets under the PM Awas Yojana-Gramin scheme. The decision aims to address the housing shortfall identified in recent socio-economic surveys. Funds will be released in phases linked to construction progress verified via geo-tagging.",
    tag: "GS2 - Government Schemes",
    date: "2026-06-01",
  },
  {
    id: "ca-009",
    headline: "World Health Organization flags rising antimicrobial resistance (AMR) in South Asia",
    summary:
      "A WHO regional report highlighted increasing antimicrobial resistance rates in South Asia, attributing it to overuse of antibiotics in healthcare and agriculture. India's National Action Plan on AMR was cited as a model but with implementation gaps. The report calls for stronger surveillance and stewardship programs.",
    tag: "GS2/GS3 - Health & Science",
    date: "2026-05-31",
  },
  {
    id: "ca-010",
    headline: "India's semiconductor mission attracts new fabrication unit investments",
    summary:
      "Under the India Semiconductor Mission, fresh investment commitments were announced for chip fabrication and packaging units in multiple states. The initiative seeks to reduce reliance on imported semiconductors critical for electronics and defense manufacturing. Skill development programs for semiconductor talent were also announced alongside.",
    tag: "GS3 - Science & Technology / Economy",
    date: "2026-05-30",
  },
  {
    id: "ca-011",
    headline: "Parliamentary committee report calls for reforms in the criminal justice system's backlog",
    summary:
      "A parliamentary standing committee report examined the pendency of cases in lower courts and proposed measures including fast-track courts and increased judicial appointments. The report links judicial delays to undertrial overcrowding in prisons. It recommends greater use of technology for case management.",
    tag: "GS2 - Judiciary & Governance",
    date: "2026-05-29",
  },
  {
    id: "ca-012",
    headline: "India hosts multilateral disaster-resilient infrastructure dialogue ahead of monsoon season",
    summary:
      "India convened a multilateral dialogue under the Coalition for Disaster Resilient Infrastructure (CDRI) focusing on monsoon preparedness and climate-proofing infrastructure. Discussions covered early warning systems and resilient urban planning. The initiative builds on India's leadership role in global disaster resilience partnerships.",
    tag: "GS3 - Disaster Management",
    date: "2026-05-28",
  },
  {
    id: "ca-013",
    headline: "New tribal welfare scheme expands eligibility for forest rights certification",
    summary:
      "An expanded tribal welfare initiative aims to speed up the recognition of community and individual forest rights claims under the Forest Rights Act. The scheme includes digitization of land records for tribal communities. Activists welcomed the move while calling for stronger grievance redressal mechanisms.",
    tag: "GS1/GS2 - Social Justice / Tribal Welfare",
    date: "2026-05-27",
  },
  {
    id: "ca-014",
    headline: "India's exports of electronics and defense equipment post record growth",
    summary:
      "Latest trade data showed record growth in India's exports of electronics goods and defense equipment, reflecting gains from production-linked incentive schemes. The growth was attributed to expanding manufacturing capacity and new export destinations. Officials linked the trend to the broader 'Atmanirbhar Bharat' push.",
    tag: "GS3 - Economy & Defence",
    date: "2026-05-26",
  },
];

/** Returns this week's set of current affairs (most recent N items). */
export function getWeeklyCurrentAffairs(count = 14): CurrentAffairItem[] {
  return [...CURRENT_AFFAIRS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
