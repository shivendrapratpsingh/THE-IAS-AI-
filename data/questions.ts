// ============================================================================
// Static question banks used for offline-first MCQ practice and
// Answer Writing prompts. These rotate daily so the app is fully usable
// without the Claude API.
// ============================================================================

export type MCQTopic =
  | "Polity"
  | "History"
  | "Geography"
  | "Economy"
  | "Environment"
  | "Science"
  | "Current Affairs";

export interface MCQ {
  id: string;
  topic: MCQTopic;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
  explanation: string;
}

export const MCQ_TOPICS: MCQTopic[] = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Environment",
  "Science",
  "Current Affairs",
];

export const MCQ_BANK: MCQ[] = [
  // ---------------------------- POLITY ----------------------------
  {
    id: "polity-1",
    topic: "Polity",
    question: "Which Article of the Indian Constitution deals with the Right to Constitutional Remedies?",
    options: ["Article 30", "Article 32", "Article 21", "Article 19"],
    correctIndex: 1,
    explanation:
      "Article 32 empowers citizens to move the Supreme Court directly for enforcement of Fundamental Rights. Dr. B.R. Ambedkar called it the 'heart and soul' of the Constitution.",
  },
  {
    id: "polity-2",
    topic: "Polity",
    question: "The concept of 'Directive Principles of State Policy' was borrowed from the Constitution of:",
    options: ["United States", "Ireland", "Canada", "Australia"],
    correctIndex: 1,
    explanation:
      "DPSPs (Part IV) were inspired by the Irish Constitution of 1937, which itself borrowed the idea from the Spanish Constitution.",
  },
  {
    id: "polity-3",
    topic: "Polity",
    question: "Who has the power to decide on questions of disqualification of members of Parliament on grounds of defection?",
    options: ["The Election Commission", "The Speaker/Chairman of the House", "The President", "The Supreme Court"],
    correctIndex: 1,
    explanation:
      "Under the Tenth Schedule (Anti-Defection Law), the presiding officer (Speaker/Chairman) decides defection questions, subject to judicial review by courts.",
  },
  {
    id: "polity-4",
    topic: "Polity",
    question: "The 73rd Constitutional Amendment Act, 1992 relates to:",
    options: ["Municipalities", "Panchayati Raj Institutions", "Cooperative societies", "Goods and Services Tax"],
    correctIndex: 1,
    explanation:
      "The 73rd Amendment gave constitutional status to Panchayati Raj Institutions by adding Part IX and the Eleventh Schedule.",
  },
  {
    id: "polity-5",
    topic: "Polity",
    question: "Which of the following is NOT a Fundamental Duty under Article 51A?",
    options: [
      "To safeguard public property and abjure violence",
      "To provide free legal aid to the poor",
      "To protect and improve the natural environment",
      "To develop scientific temper, humanism and the spirit of inquiry",
    ],
    correctIndex: 1,
    explanation:
      "Free legal aid is a Directive Principle (Article 39A), not a Fundamental Duty. Fundamental Duties were added by the 42nd Amendment, 1976.",
  },
  {
    id: "polity-6",
    topic: "Polity",
    question: "The Union Public Service Commission (UPSC) submits its annual report to:",
    options: ["The Parliament directly", "The Prime Minister", "The President of India", "The Supreme Court"],
    correctIndex: 2,
    explanation:
      "UPSC presents its annual performance report to the President, who causes it to be laid before each House of Parliament along with an explanatory memorandum.",
  },
  {
    id: "polity-7",
    topic: "Polity",
    question: "Which writ is issued by a court to direct a public official to perform a duty they have failed or refused to perform?",
    options: ["Habeas Corpus", "Mandamus", "Certiorari", "Quo Warranto"],
    correctIndex: 1,
    explanation:
      "'Mandamus' literally means 'we command'. It directs a public authority to perform a mandatory duty it has neglected.",
  },
  {
    id: "polity-8",
    topic: "Polity",
    question: "The minimum age prescribed for becoming the Vice-President of India is:",
    options: ["25 years", "30 years", "35 years", "40 years"],
    correctIndex: 2,
    explanation:
      "Article 66 prescribes a minimum age of 35 years for the office of Vice-President, the same as for the President.",
  },
  {
    id: "polity-9",
    topic: "Polity",
    question: "'Money Bills' as defined under Article 110 can be introduced only in:",
    options: ["Rajya Sabha", "Lok Sabha", "Either House", "State Legislative Council"],
    correctIndex: 1,
    explanation:
      "Money Bills can only be introduced in the Lok Sabha and on the recommendation of the President; Rajya Sabha can only suggest changes within 14 days.",
  },
  {
    id: "polity-10",
    topic: "Polity",
    question: "Which constitutional body is described as the 'guardian of the public purse'?",
    options: ["NITI Aayog", "Finance Commission", "Comptroller and Auditor General (CAG)", "Public Accounts Committee"],
    correctIndex: 2,
    explanation:
      "The CAG audits government accounts and expenditure, ensuring accountability of the executive to Parliament — hence called the guardian of the public purse.",
  },

  // ---------------------------- HISTORY ----------------------------
  {
    id: "history-1",
    topic: "History",
    question: "The 'Doctrine of Lapse' was introduced by:",
    options: ["Lord Curzon", "Lord Dalhousie", "Lord Cornwallis", "Lord Wellesley"],
    correctIndex: 1,
    explanation:
      "Lord Dalhousie (Governor-General, 1848-56) used the Doctrine of Lapse to annex princely states like Satara, Jhansi, and Nagpur when rulers died without a natural male heir.",
  },
  {
    id: "history-2",
    topic: "History",
    question: "The Champaran Satyagraha (1917) was Mahatma Gandhi's first major movement in India, concerning:",
    options: ["Salt tax", "Indigo cultivation", "Khilafat issue", "Mill workers' wages"],
    correctIndex: 1,
    explanation:
      "Champaran Satyagraha addressed the exploitation of indigo farmers in Bihar under the 'Tinkathia' system imposed by British planters.",
  },
  {
    id: "history-3",
    topic: "History",
    question: "Who founded the Indian National Army (Azad Hind Fauj) in its original form before Subhas Chandra Bose took command?",
    options: ["Rash Behari Bose", "Mohan Singh", "Subhas Chandra Bose", "Captain Mohan Lal"],
    correctIndex: 1,
    explanation:
      "Captain Mohan Singh first organized the INA from Indian POWs in 1942 with Japanese support; Rash Behari Bose later formally inaugurated it before Subhas Chandra Bose revitalized it in 1943.",
  },
  {
    id: "history-4",
    topic: "History",
    question: "The Dandi March (Salt Satyagraha) began on:",
    options: ["26 January 1930", "12 March 1930", "8 August 1942", "15 August 1947"],
    correctIndex: 1,
    explanation:
      "Gandhi began the Dandi March from Sabarmati Ashram on 12 March 1930, reaching Dandi on 6 April 1930 to break the salt law.",
  },
  {
    id: "history-5",
    topic: "History",
    question: "Which Mughal ruler is associated with the 'Din-i-Ilahi' syncretic religion?",
    options: ["Babur", "Akbar", "Jahangir", "Aurangzeb"],
    correctIndex: 1,
    explanation:
      "Akbar promulgated Din-i-Ilahi around 1582, blending elements of various religions, reflecting his policy of religious tolerance ('Sulh-i-Kul').",
  },
  {
    id: "history-6",
    topic: "History",
    question: "The Indian Councils Act of 1909 (Morley-Minto Reforms) is significant for introducing:",
    options: ["Dyarchy", "Separate electorates for Muslims", "Provincial autonomy", "Universal adult franchise"],
    correctIndex: 1,
    explanation:
      "The 1909 Act introduced separate electorates for Muslims, a step widely seen as deepening communal divisions in Indian politics.",
  },
  {
    id: "history-7",
    topic: "History",
    question: "The 'Lucknow Pact' of 1916 was an agreement between:",
    options: [
      "Congress and the British government",
      "Congress and the Muslim League",
      "Hindu Mahasabha and Muslim League",
      "Moderates and Extremists within Congress",
    ],
    correctIndex: 1,
    explanation:
      "The Lucknow Pact (Dec 1916) was a temporary rapprochement between INC and the Muslim League, presenting joint demands for self-government to the British.",
  },
  {
    id: "history-8",
    topic: "History",
    question: "Who is known as the 'Father of Local Self-Government in India'?",
    options: ["Lord Ripon", "Lord Curzon", "Lord Mayo", "Lord Lytton"],
    correctIndex: 0,
    explanation:
      "Lord Ripon's resolution of 1882 laid the foundation for local self-government institutions, earning him this title.",
  },
  {
    id: "history-9",
    topic: "History",
    question: "The Battle of Plassey (1757) was fought between the British East India Company and:",
    options: ["Tipu Sultan", "Siraj-ud-Daulah", "Mir Qasim", "Shuja-ud-Daulah"],
    correctIndex: 1,
    explanation:
      "Robert Clive defeated the Nawab of Bengal, Siraj-ud-Daulah, at Plassey, marking the beginning of British political control in India.",
  },
  {
    id: "history-10",
    topic: "History",
    question: "The Poona Pact (1932) was signed between Mahatma Gandhi and:",
    options: ["Jawaharlal Nehru", "B.R. Ambedkar", "Muhammad Ali Jinnah", "Subhas Chandra Bose"],
    correctIndex: 1,
    explanation:
      "The Poona Pact ended Gandhi's fast against the Communal Award's separate electorates for Depressed Classes, replacing them with reserved seats within the general electorate, agreed with Ambedkar.",
  },

  // ---------------------------- GEOGRAPHY ----------------------------
  {
    id: "geo-1",
    topic: "Geography",
    question: "The Tropic of Cancer passes through how many Indian states?",
    options: ["6", "8", "10", "12"],
    correctIndex: 1,
    explanation:
      "The Tropic of Cancer (23°30' N) passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.",
  },
  {
    id: "geo-2",
    topic: "Geography",
    question: "Which Indian river is known as the 'Sorrow of Bihar' due to frequent flooding?",
    options: ["Ganga", "Kosi", "Son", "Gandak"],
    correctIndex: 1,
    explanation:
      "The Kosi river, originating in Nepal, frequently changes course and causes devastating floods in North Bihar, earning this name.",
  },
  {
    id: "geo-3",
    topic: "Geography",
    question: "The Western Ghats are an example of which type of mountains?",
    options: ["Fold mountains", "Block mountains", "Volcanic mountains", "Residual mountains"],
    correctIndex: 1,
    explanation:
      "The Western Ghats (Sahyadri) are classified as Block Mountains, formed due to faulting during the formation of the Indian Plate.",
  },
  {
    id: "geo-4",
    topic: "Geography",
    question: "Which of the following is the largest cold desert in India?",
    options: ["Thar Desert", "Ladakh", "Lahaul-Spiti", "Rann of Kutch"],
    correctIndex: 1,
    explanation:
      "Ladakh, lying in the trans-Himalayan rain-shadow region, is India's largest cold desert with very low precipitation and extreme temperatures.",
  },
  {
    id: "geo-5",
    topic: "Geography",
    question: "The 'Loktak Lake', the largest freshwater lake in Northeast India, is located in:",
    options: ["Assam", "Manipur", "Meghalaya", "Nagaland"],
    correctIndex: 1,
    explanation:
      "Loktak Lake in Manipur is famous for its floating islands of vegetation called 'phumdis', and hosts Keibul Lamjao National Park.",
  },
  {
    id: "geo-6",
    topic: "Geography",
    question: "Which type of soil is most suitable for cotton cultivation in India?",
    options: ["Alluvial soil", "Red soil", "Black (Regur) soil", "Laterite soil"],
    correctIndex: 2,
    explanation:
      "Black soil (Regur), derived from Deccan trap basalt, retains moisture well and is rich in iron, lime, and calcium — ideal for cotton, hence called 'black cotton soil'.",
  },
  {
    id: "geo-7",
    topic: "Geography",
    question: "The 'Roaring Forties' are strong westerly winds found in which latitude belt?",
    options: ["0°-10°", "20°-30°", "40°-50°", "60°-70°"],
    correctIndex: 2,
    explanation:
      "The Roaring Forties are strong, persistent westerly winds found roughly between 40° and 50° latitude in the Southern Hemisphere, with little landmass to obstruct them.",
  },
  {
    id: "geo-8",
    topic: "Geography",
    question: "Which strait separates India's Andaman and Nicobar Islands?",
    options: ["Palk Strait", "Ten Degree Channel", "Bering Strait", "Gulf of Mannar"],
    correctIndex: 1,
    explanation:
      "The Ten Degree Channel separates the Andaman group from the Nicobar group of islands, running along the 10°N latitude.",
  },
  {
    id: "geo-9",
    topic: "Geography",
    question: "El Niño is associated with the warming of surface waters in which ocean?",
    options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
    correctIndex: 2,
    explanation:
      "El Niño refers to periodic warming of sea surface temperatures in the central and eastern equatorial Pacific Ocean, affecting global weather including the Indian monsoon.",
  },
  {
    id: "geo-10",
    topic: "Geography",
    question: "Which Indian state has the longest coastline?",
    options: ["Tamil Nadu", "Andhra Pradesh", "Gujarat", "Kerala"],
    correctIndex: 2,
    explanation:
      "Gujarat has India's longest coastline among states (about 1,600 km), important for ports like Kandla and Mundra.",
  },

  // ---------------------------- ECONOMY ----------------------------
  {
    id: "econ-1",
    topic: "Economy",
    question: "The 'Repo Rate' is the rate at which:",
    options: [
      "RBI lends money to commercial banks against securities",
      "Commercial banks lend to each other",
      "RBI borrows from commercial banks",
      "Banks lend to retail customers",
    ],
    correctIndex: 0,
    explanation:
      "Repo (Repurchase) Rate is the rate at which RBI lends short-term funds to commercial banks against government securities. It is a key monetary policy tool.",
  },
  {
    id: "econ-2",
    topic: "Economy",
    question: "Which committee recommended the establishment of the Goods and Services Tax (GST) Council?",
    options: ["Kelkar Committee", "It was a constitutional provision under the 101st Amendment", "Raghuram Rajan Committee", "Shome Committee"],
    correctIndex: 1,
    explanation:
      "The GST Council was established under Article 279A, inserted by the 101st Constitutional Amendment Act, 2016.",
  },
  {
    id: "econ-3",
    topic: "Economy",
    question: "'Disguised unemployment' is most commonly associated with which sector in India?",
    options: ["Information Technology", "Agriculture", "Banking", "Manufacturing exports"],
    correctIndex: 1,
    explanation:
      "Disguised unemployment occurs when more people are employed than actually needed, common in Indian agriculture where family labor is shared on small landholdings without raising output.",
  },
  {
    id: "econ-4",
    topic: "Economy",
    question: "The Base Year for India's current GDP series (as of recent revisions) is:",
    options: ["2004-05", "2011-12", "2017-18", "2020-21"],
    correctIndex: 1,
    explanation:
      "India's GDP series was revised to base year 2011-12 by the CSO (now NSO) in 2015, changing methodology to market prices and incorporating MCA-21 data.",
  },
  {
    id: "econ-5",
    topic: "Economy",
    question: "'Gresham's Law' in economics relates to:",
    options: [
      "Bad money driving good money out of circulation",
      "Diminishing marginal utility",
      "The relationship between inflation and unemployment",
      "Demand and supply equilibrium",
    ],
    correctIndex: 0,
    explanation:
      "Gresham's Law states that when both overvalued (bad) and undervalued (good) money are in circulation, the good money is hoarded and the bad money drives it out of circulation.",
  },
  {
    id: "econ-6",
    topic: "Economy",
    question: "Which of these is classified as a 'Direct Tax' in India?",
    options: ["GST", "Customs Duty", "Income Tax", "Excise Duty"],
    correctIndex: 2,
    explanation:
      "Direct taxes (like Income Tax and Corporate Tax) are levied directly on income/wealth and cannot be shifted, unlike indirect taxes such as GST.",
  },
  {
    id: "econ-7",
    topic: "Economy",
    question: "The 'Phillips Curve' depicts the relationship between:",
    options: [
      "Inflation and unemployment",
      "Savings and investment",
      "Exports and imports",
      "Fiscal deficit and GDP growth",
    ],
    correctIndex: 0,
    explanation:
      "The Phillips Curve shows an inverse short-run relationship between the rate of inflation and the rate of unemployment.",
  },
  {
    id: "econ-8",
    topic: "Economy",
    question: "Which organization publishes the 'World Economic Outlook' report?",
    options: ["World Bank", "WTO", "International Monetary Fund (IMF)", "OECD"],
    correctIndex: 2,
    explanation:
      "The IMF publishes the World Economic Outlook biannually, providing analysis and projections of the global economy.",
  },
  {
    id: "econ-9",
    topic: "Economy",
    question: "India's Insolvency and Bankruptcy Code (IBC) was enacted in:",
    options: ["2014", "2016", "2018", "2020"],
    correctIndex: 1,
    explanation:
      "The IBC, 2016 created a unified, time-bound process for resolving insolvency for companies, partnerships, and individuals in India.",
  },
  {
    id: "econ-10",
    topic: "Economy",
    question: "'Operation Twist' conducted by the RBI involves:",
    options: [
      "Simultaneous sale and purchase of government securities of different maturities",
      "Direct cash transfer to citizens",
      "Buying foreign currency to manage exchange rates",
      "Reducing the cash reserve ratio to zero",
    ],
    correctIndex: 0,
    explanation:
      "Operation Twist involves RBI simultaneously selling short-term government securities and buying long-term ones (or vice versa) to manage the yield curve.",
  },

  // ---------------------------- ENVIRONMENT ----------------------------
  {
    id: "env-1",
    topic: "Environment",
    question: "The Kyoto Protocol is an international agreement linked to which convention?",
    options: ["CBD", "UNFCCC", "UNCCD", "Ramsar Convention"],
    correctIndex: 1,
    explanation:
      "The Kyoto Protocol (1997) operationalizes the UN Framework Convention on Climate Change (UNFCCC) by setting binding emission reduction targets for developed countries.",
  },
  {
    id: "env-2",
    topic: "Environment",
    question: "Which gas is primarily responsible for the depletion of the ozone layer?",
    options: ["Carbon dioxide", "Methane", "Chlorofluorocarbons (CFCs)", "Nitrogen"],
    correctIndex: 2,
    explanation:
      "CFCs release chlorine atoms in the stratosphere that catalytically destroy ozone molecules, leading to ozone layer depletion — addressed by the Montreal Protocol.",
  },
  {
    id: "env-3",
    topic: "Environment",
    question: "'Project Tiger' was launched in the year:",
    options: ["1969", "1973", "1980", "1991"],
    correctIndex: 1,
    explanation:
      "Project Tiger was launched in 1973 at Jim Corbett National Park to conserve the Bengal tiger population through a network of protected tiger reserves.",
  },
  {
    id: "env-4",
    topic: "Environment",
    question: "Which of the following ecosystems is known as the 'kidneys of the landscape' due to its filtering function?",
    options: ["Grasslands", "Wetlands", "Coral reefs", "Mangroves"],
    correctIndex: 1,
    explanation:
      "Wetlands filter pollutants, recharge groundwater, and regulate water flow, earning the nickname 'kidneys of the landscape' under the Ramsar framework.",
  },
  {
    id: "env-5",
    topic: "Environment",
    question: "The 'Nagoya Protocol' is associated with:",
    options: [
      "Access and benefit-sharing of genetic resources",
      "Trade in endangered species",
      "Trans-boundary movement of hazardous waste",
      "Reduction of greenhouse gases",
    ],
    correctIndex: 0,
    explanation:
      "The Nagoya Protocol (2010), under the CBD, governs access to genetic resources and fair sharing of benefits arising from their use.",
  },
  {
    id: "env-6",
    topic: "Environment",
    question: "Which Indian state has the highest forest cover in terms of percentage of geographical area (as per recent ISFR reports)?",
    options: ["Madhya Pradesh", "Arunachal Pradesh", "Mizoram", "Chhattisgarh"],
    correctIndex: 2,
    explanation:
      "Mizoram consistently records the highest forest cover as a percentage of its geographical area among Indian states, per India State of Forest Reports.",
  },
  {
    id: "env-7",
    topic: "Environment",
    question: "Eutrophication of water bodies is primarily caused by excess:",
    options: ["Heavy metals", "Nutrients (nitrogen and phosphorus)", "Plastic waste", "Radioactive material"],
    correctIndex: 1,
    explanation:
      "Eutrophication results from excessive nutrient runoff (especially nitrates and phosphates) causing algal blooms, oxygen depletion, and aquatic ecosystem damage.",
  },
  {
    id: "env-8",
    topic: "Environment",
    question: "The 'Green Climate Fund' was established under which framework?",
    options: ["World Bank", "UNFCCC", "WHO", "G20"],
    correctIndex: 1,
    explanation:
      "The Green Climate Fund (GCF) was set up within the UNFCCC framework to assist developing countries in climate mitigation and adaptation.",
  },
  {
    id: "env-9",
    topic: "Environment",
    question: "Which of these is an example of an 'in-situ' conservation method?",
    options: ["Seed banks", "Botanical gardens", "National Parks and Biosphere Reserves", "Zoos"],
    correctIndex: 2,
    explanation:
      "In-situ conservation protects species within their natural habitats (e.g., National Parks, Wildlife Sanctuaries, Biosphere Reserves), unlike ex-situ methods such as zoos or seed banks.",
  },
  {
    id: "env-10",
    topic: "Environment",
    question: "The Western Ghats were declared a UNESCO World Heritage Site primarily due to their:",
    options: [
      "Mineral wealth",
      "Exceptional levels of biological diversity and endemism",
      "Tourism infrastructure",
      "Hydroelectric potential",
    ],
    correctIndex: 1,
    explanation:
      "The Western Ghats are recognized as one of the world's eight 'hottest hotspots' of biological diversity, with extraordinary levels of endemic flora and fauna.",
  },

  // ---------------------------- SCIENCE ----------------------------
  {
    id: "sci-1",
    topic: "Science",
    question: "ISRO's Chandrayaan-3 mission successfully landed near which region of the Moon?",
    options: ["North Pole", "Equator", "South Pole region", "Far side (dark side)"],
    correctIndex: 2,
    explanation:
      "Chandrayaan-3's Vikram lander touched down near the lunar south pole in August 2023, making India the first country to land in this region.",
  },
  {
    id: "sci-2",
    topic: "Science",
    question: "CRISPR-Cas9 technology is primarily used for:",
    options: ["Gene editing", "Data encryption", "Nuclear fission", "Satellite navigation"],
    correctIndex: 0,
    explanation:
      "CRISPR-Cas9 is a precise gene-editing tool that allows scientists to alter DNA sequences and modify gene function, with applications in medicine and agriculture.",
  },
  {
    id: "sci-3",
    topic: "Science",
    question: "Which vitamin deficiency causes the disease 'Beriberi'?",
    options: ["Vitamin B1 (Thiamine)", "Vitamin C", "Vitamin D", "Vitamin K"],
    correctIndex: 0,
    explanation:
      "Beriberi results from a deficiency of Vitamin B1 (Thiamine), affecting the nervous and cardiovascular systems.",
  },
  {
    id: "sci-4",
    topic: "Science",
    question: "The 'Higgs Boson' particle is associated with which fundamental concept?",
    options: ["Dark matter", "Mass of particles", "Speed of light", "Nuclear fusion"],
    correctIndex: 1,
    explanation:
      "The Higgs Boson, discovered at CERN's LHC in 2012, is linked to the Higgs field which gives fundamental particles their mass.",
  },
  {
    id: "sci-5",
    topic: "Science",
    question: "5G technology primarily offers improvements over 4G in terms of:",
    options: [
      "Higher data speed, lower latency, and greater device density",
      "Only better call quality",
      "Cheaper hardware only",
      "Longer battery life only",
    ],
    correctIndex: 0,
    explanation:
      "5G networks provide significantly higher data speeds, ultra-low latency, and the ability to connect a much larger number of devices simultaneously (important for IoT).",
  },
  {
    id: "sci-6",
    topic: "Science",
    question: "Which Indian satellite system is the indigenous equivalent of the US GPS?",
    options: ["INSAT", "NavIC (IRNSS)", "CARTOSAT", "RISAT"],
    correctIndex: 1,
    explanation:
      "NavIC (Navigation with Indian Constellation), developed under IRNSS, is India's indigenous satellite navigation system covering India and surrounding regions.",
  },
  {
    id: "sci-7",
    topic: "Science",
    question: "Stem cells are characterized by their ability to:",
    options: [
      "Differentiate into various specialized cell types",
      "Only multiply without function",
      "Survive without oxygen indefinitely",
      "Convert directly into hormones",
    ],
    correctIndex: 0,
    explanation:
      "Stem cells are unspecialized cells capable of self-renewal and differentiation into various specialized cell types, making them valuable for regenerative medicine.",
  },
  {
    id: "sci-8",
    topic: "Science",
    question: "The 'Doppler Effect' is most commonly used in which application?",
    options: ["Radar speed guns and weather forecasting", "Photosynthesis measurement", "DNA sequencing", "Battery charging"],
    correctIndex: 0,
    explanation:
      "The Doppler Effect describes the change in frequency of a wave for an observer moving relative to the source — used in radar (speed detection) and Doppler weather radar.",
  },
  {
    id: "sci-9",
    topic: "Science",
    question: "Which of the following best describes 'Quantum Computing'?",
    options: [
      "Computing using qubits that can represent multiple states simultaneously",
      "A faster version of classical binary computing using silicon only",
      "Computing that only works at room temperature",
      "A type of cloud storage technology",
    ],
    correctIndex: 0,
    explanation:
      "Quantum computers use qubits, which leverage superposition and entanglement to represent and process multiple states simultaneously, enabling certain computations far faster than classical computers.",
  },
  {
    id: "sci-10",
    topic: "Science",
    question: "Which of these diseases is caused by a prion (misfolded protein) rather than a virus or bacterium?",
    options: ["Tuberculosis", "Creutzfeldt-Jakob Disease (Mad Cow related)", "Malaria", "Cholera"],
    correctIndex: 1,
    explanation:
      "Creutzfeldt-Jakob Disease and 'Mad Cow Disease' (BSE) are caused by prions — misfolded proteins that induce abnormal folding in normal proteins, unlike pathogens with genetic material.",
  },

  // ---------------------------- CURRENT AFFAIRS ----------------------------
  {
    id: "ca-1",
    topic: "Current Affairs",
    question: "The 'G20 Summit' presidency rotates annually among member countries; India hosted the summit in which year?",
    options: ["2021", "2022", "2023", "2024"],
    correctIndex: 2,
    explanation:
      "India held the G20 presidency from December 2022 to November 2023, culminating in the New Delhi Summit in September 2023.",
  },
  {
    id: "ca-2",
    topic: "Current Affairs",
    question: "The 'Vishwakarma Yojana' launched by the Government of India primarily targets:",
    options: [
      "Traditional artisans and craftspeople",
      "Software engineers",
      "Large industrial corporations",
      "Foreign investors",
    ],
    correctIndex: 0,
    explanation:
      "PM Vishwakarma Yojana provides financial support, skill training, and market linkages to traditional artisans and craftspeople across 18 trades.",
  },
  {
    id: "ca-3",
    topic: "Current Affairs",
    question: "'Digital Public Infrastructure' (DPI), often highlighted in India's G20 agenda, includes which of the following?",
    options: ["Aadhaar, UPI, and CoWIN-like platforms", "Only physical roads and highways", "Only defense satellites", "Only private banking apps"],
    correctIndex: 0,
    explanation:
      "India's DPI stack (Aadhaar for identity, UPI for payments, and platforms like CoWIN/DigiLocker) has been showcased globally as a model for inclusive digital infrastructure.",
  },
  {
    id: "ca-4",
    topic: "Current Affairs",
    question: "The 'Har Ghar Jal' mission aims to provide:",
    options: ["Free electricity to every household", "Functional tap water connections to rural households", "Free internet access", "Free LPG cylinders"],
    correctIndex: 1,
    explanation:
      "Under the Jal Jeevan Mission's 'Har Ghar Jal' component, the goal is to provide functional household tap connections (FHTC) to every rural home in India.",
  },
  {
    id: "ca-5",
    topic: "Current Affairs",
    question: "Which Indian state recently became a focus for the implementation of the Uniform Civil Code (UCC) as of 2024?",
    options: ["Uttarakhand", "Kerala", "Tamil Nadu", "West Bengal"],
    correctIndex: 0,
    explanation:
      "Uttarakhand became the first Indian state to pass and notify a Uniform Civil Code bill in 2024, reigniting national debate on UCC implementation.",
  },
  {
    id: "ca-6",
    topic: "Current Affairs",
    question: "The 'Agnipath Scheme' relates to recruitment in which sector?",
    options: ["Indian Railways", "Armed Forces (Agniveer recruitment)", "Banking sector", "Civil services"],
    correctIndex: 1,
    explanation:
      "Agnipath is a recruitment scheme for soldiers ('Agniveers') in the Indian Armed Forces for a tenure of four years, with provisions for retention of a percentage thereafter.",
  },
  {
    id: "ca-7",
    topic: "Current Affairs",
    question: "India's first 'Green Hydrogen Hub' policy push is most closely linked to which mission?",
    options: ["National Green Hydrogen Mission", "Smart Cities Mission", "Skill India Mission", "Digital India Mission"],
    correctIndex: 0,
    explanation:
      "The National Green Hydrogen Mission (approved 2023) aims to make India a global hub for production, usage, and export of green hydrogen.",
  },
  {
    id: "ca-8",
    topic: "Current Affairs",
    question: "The 'Nari Shakti Vandan Adhiniyam' (passed 2023) provides for:",
    options: [
      "33% reservation for women in Lok Sabha and State Assemblies",
      "Free education for girl children only",
      "Reservation for women in private companies",
      "Mandatory women CEOs in PSUs",
    ],
    correctIndex: 0,
    explanation:
      "Also known as the Women's Reservation Bill, this 106th Constitutional Amendment provides 33% reservation for women in the Lok Sabha and State Legislative Assemblies (implementation tied to delimitation).",
  },
  {
    id: "ca-9",
    topic: "Current Affairs",
    question: "Which Indian mission successfully studied the Sun from the L1 Lagrange point?",
    options: ["Mangalyaan", "Chandrayaan-3", "Aditya-L1", "Astrosat"],
    correctIndex: 2,
    explanation:
      "Aditya-L1, launched in 2023, is India's first dedicated solar observation mission, positioned near the Sun-Earth L1 Lagrange point.",
  },
  {
    id: "ca-10",
    topic: "Current Affairs",
    question: "The 'PM-SURYA GHAR: Muft Bijli Yojana' scheme primarily promotes:",
    options: [
      "Rooftop solar installations for households",
      "Free LPG connections",
      "Electric vehicle subsidies only",
      "Coal-based power expansion",
    ],
    correctIndex: 0,
    explanation:
      "PM-Surya Ghar Yojana aims to provide free electricity to households via subsidized rooftop solar installations, targeting one crore households.",
  },
];

/**
 * Returns a deterministic but date-seeded shuffle of the MCQ bank, sliced
 * into a 10-question daily set. Same date => same set (offline-friendly).
 */
export function getDailyMCQSet(date: Date = new Date(), count = 10): MCQ[] {
  const seed = Number(
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate()
    ).padStart(2, "0")}`
  );
  const pool = [...MCQ_BANK];
  // Simple seeded shuffle (Fisher-Yates with LCG)
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

// ============================================================================
// Answer Writing Prompts — 100+ curated GS-style questions (15 words rotation)
// ============================================================================

export interface AnswerPrompt {
  id: string;
  paper: "GS1" | "GS2" | "GS3" | "GS4" | "Essay";
  question: string;
  wordLimit: number;
}

const gs1 = [
  "Discuss the salient features of the Indian freedom struggle that distinguish it from other anti-colonial movements.",
  "Examine the socio-economic impact of the Green Revolution on Indian agriculture and rural society.",
  "Analyze the role of women in the Indian National Movement and their contribution to nation-building.",
  "Discuss the factors responsible for the decline of the Mughal Empire in the 18th century.",
  "Critically examine the impact of British land revenue policies on Indian peasantry.",
  "Discuss the geographical factors influencing the distribution of monsoon rainfall in India.",
  "Examine the causes and consequences of urbanization in post-independence India.",
  "Discuss the salient features of Buddhist and Jain architecture and their influence on Indian art.",
  "Analyze the role of regionalism in shaping Indian politics and society.",
  "Discuss the impact of globalization on Indian society and culture.",
  "Examine the role of art and literature in the freedom struggle.",
  "Discuss the factors responsible for the location of industries in India.",
  "Analyze the causes of the Revolt of 1857 and its consequences for British policy.",
  "Discuss the salient features of the Indus Valley Civilization and its decline.",
  "Examine the impact of the Bhakti and Sufi movements on Indian society.",
  "Discuss the population distribution and density patterns in India and their determinants.",
  "Analyze the role of the press in shaping public opinion during colonial India.",
  "Discuss the changing nature of family structure in urban India and its implications.",
  "Examine the role of natural resources in regional development with examples from India.",
  "Discuss the contribution of Subhas Chandra Bose to the Indian independence movement.",
  "Analyze the social reform movements of the 19th century and their long-term impact.",
  "Discuss the geographical reasons behind the uneven distribution of mineral resources in India.",
  "Examine the role of education in social transformation during the colonial period.",
  "Discuss the factors leading to the partition of India in 1947.",
];

const gs2 = [
  "Discuss the role of the Finance Commission in Centre-State fiscal relations.",
  "Examine the significance of the basic structure doctrine in Indian constitutional law.",
  "Discuss the challenges in implementation of the Right to Education Act, 2009.",
  "Analyze the role of civil society organizations in strengthening democracy in India.",
  "Discuss the functions and significance of the National Human Rights Commission.",
  "Examine the impact of judicial activism on governance in India.",
  "Discuss the challenges faced by India's healthcare system and policy measures to address them.",
  "Analyze the role of e-governance in improving public service delivery.",
  "Discuss the significance of India's neighbourhood-first policy in foreign relations.",
  "Examine the issue of criminalization of politics and possible reforms.",
  "Discuss the role of the Election Commission in ensuring free and fair elections.",
  "Analyze the challenges in centre-state relations with respect to GST implementation.",
  "Discuss the importance of social audits in improving accountability of welfare schemes.",
  "Examine the relevance of the Directive Principles of State Policy in contemporary India.",
  "Discuss the role of India in regional organizations like SAARC and BIMSTEC.",
  "Analyze the impact of the 'one nation, one ration card' scheme on welfare delivery.",
  "Discuss the challenges to inner-party democracy in Indian political parties.",
  "Examine the role of Panchayati Raj Institutions in rural development.",
  "Discuss the implications of India's stance on UN Security Council reform.",
  "Analyze the effectiveness of the Right to Information Act in promoting transparency.",
  "Discuss the issues related to the appointment of judges through the NJAC vs collegium debate.",
  "Examine the significance of bilateral trade agreements for India's economic diplomacy.",
  "Discuss the role of the Governor in state administration and points of friction with elected governments.",
  "Analyze the steps taken by India to strengthen disaster management institutions.",
];

const gs3 = [
  "Discuss the significance of Micro, Small and Medium Enterprises (MSMEs) in India's economic growth.",
  "Examine the challenges in achieving food security in India despite surplus production.",
  "Discuss the role of Foreign Direct Investment (FDI) in India's manufacturing sector.",
  "Analyze the impact of climate change on Indian agriculture and adaptation strategies.",
  "Discuss the significance of the National Infrastructure Pipeline for economic recovery.",
  "Examine the challenges of cybersecurity for India's critical infrastructure.",
  "Discuss the role of renewable energy in achieving India's net-zero commitments.",
  "Analyze the causes of non-performing assets (NPAs) in the Indian banking sector and remedial measures.",
  "Discuss the significance of the Production Linked Incentive (PLI) scheme for Indian industry.",
  "Examine the role of space technology in disaster management and agriculture in India.",
  "Discuss the challenges in managing India's water resources amid increasing demand.",
  "Analyze the role of artificial intelligence in transforming India's economy and associated risks.",
  "Discuss the significance of inland waterways for freight transportation in India.",
  "Examine the impact of e-commerce on traditional retail in India.",
  "Discuss the steps needed to strengthen India's food processing industry.",
  "Analyze the security challenges posed by left-wing extremism and government responses.",
  "Discuss the role of biotechnology in addressing healthcare and agricultural challenges in India.",
  "Examine the implications of cryptocurrency and digital assets for India's financial system.",
  "Discuss the significance of border infrastructure development for national security.",
  "Analyze the challenges of plastic waste management in urban India.",
  "Discuss the role of cooperative federalism in disaster risk reduction.",
  "Examine the importance of skill development programs in addressing unemployment in India.",
  "Discuss the strategic significance of the Indo-Pacific region for India's security policy.",
  "Analyze the impact of mechanization on agricultural employment in India.",
];

const gs4 = [
  "Discuss the relationship between ethics and law, with suitable examples from public administration.",
  "Examine the concept of 'public interest' and its relevance to civil service decision-making.",
  "Discuss the importance of emotional intelligence in effective leadership and governance.",
  "Analyze the ethical dilemmas faced by civil servants in implementing welfare schemes.",
  "Discuss the role of probity in governance and measures to ensure it.",
  "Examine the significance of empathy and compassion in public service delivery.",
  "Discuss the concept of accountability versus responsibility in administrative ethics.",
  "Analyze how conflict of interest situations arise in public administration and how to address them.",
  "Discuss the importance of transparency as a value in democratic governance.",
  "Examine the role of moral courage in whistleblowing within government organizations.",
  "Discuss the ethical considerations in the use of artificial intelligence by government agencies.",
  "Analyze the significance of the 'Code of Conduct' for civil servants in India.",
];

const essay = [
  "Technology as an enabler for inclusive growth in India.",
  "Education is what survives when what is learned has been forgotten.",
  "A nation's strength ultimately consists in what it can do on its own, and not in what it can borrow from others.",
  "Public service is the rent we pay for living on this planet.",
  "Compassion is the basis of all morality.",
  "Reform, perform, transform — the journey of New India.",
  "Innovation distinguishes between a leader and a follower.",
  "Nothing in the world is permanent except change.",
  "The youth of a nation are the trustees of posterity.",
  "Crisis is also an opportunity.",
];

export const ANSWER_PROMPTS: AnswerPrompt[] = [
  ...gs1.map((q, i) => ({ id: `gs1-${i + 1}`, paper: "GS1" as const, question: q, wordLimit: 150 })),
  ...gs2.map((q, i) => ({ id: `gs2-${i + 1}`, paper: "GS2" as const, question: q, wordLimit: 150 })),
  ...gs3.map((q, i) => ({ id: `gs3-${i + 1}`, paper: "GS3" as const, question: q, wordLimit: 150 })),
  ...gs4.map((q, i) => ({ id: `gs4-${i + 1}`, paper: "GS4" as const, question: q, wordLimit: 150 })),
  ...essay.map((q, i) => ({ id: `essay-${i + 1}`, paper: "Essay" as const, question: q, wordLimit: 250 })),
];

/** Returns the daily Answer Writing prompt, rotating deterministically by date. */
export function getDailyAnswerPrompt(date: Date = new Date()): AnswerPrompt {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return ANSWER_PROMPTS[dayIndex % ANSWER_PROMPTS.length];
}

// ============================================================================
// Fallback "Daily Legal / Constitutional Question" (used if Claude API fails)
// ============================================================================
export interface LegalQuestion {
  question: string;
  options: [string, string, string, string];
  correct_answer: string; // e.g. "B"
  explanation: string;
}

export const FALLBACK_LEGAL_QUESTIONS: LegalQuestion[] = [
  {
    question: "Under the Indian Constitution, which Article empowers the President to issue ordinances when Parliament is not in session?",
    options: ["Article 123", "Article 124", "Article 352", "Article 356"],
    correct_answer: "A",
    explanation:
      "Article 123 grants the President power to promulgate ordinances during recess of Parliament, having the same force as an Act, but must be approved within 6 weeks of reassembly.",
  },
  {
    question: "The 'basic structure' doctrine of the Indian Constitution was propounded in which landmark case?",
    options: ["Golaknath v. State of Punjab", "Kesavananda Bharati v. State of Kerala", "Maneka Gandhi v. Union of India", "Minerva Mills v. Union of India"],
    correct_answer: "B",
    explanation:
      "In Kesavananda Bharati v. State of Kerala (1973), the Supreme Court held that Parliament's power to amend the Constitution under Article 368 does not extend to altering its 'basic structure'.",
  },
  {
    question: "Which schedule of the Constitution deals with the disqualification of members on grounds of defection?",
    options: ["Eighth Schedule", "Ninth Schedule", "Tenth Schedule", "Eleventh Schedule"],
    correct_answer: "C",
    explanation:
      "The Tenth Schedule, added by the 52nd Amendment Act (1985), contains provisions for disqualification of MPs/MLAs on grounds of defection.",
  },
];

/** Seeded index into fallback legal questions, changes daily. */
export function getFallbackLegalQuestion(date: Date = new Date()): LegalQuestion {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return FALLBACK_LEGAL_QUESTIONS[dayIndex % FALLBACK_LEGAL_QUESTIONS.length];
}
