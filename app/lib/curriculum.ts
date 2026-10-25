import { FIZIKA, KIMYA, BIOLOGIYA } from "./science";
export type Subject = { id: string; name: string; topics: string[] };
export type Program = { id: string; title: string; hint: string; subjects: Subject[] };

// "# ..." ilə başlayan sətir bölmə başlığıdır, mövzu deyil.

const AZ_9 = [
  "Fonetika", "Leksika", "Sözün tərkibi", "Söz yaradıcılığı", "İsim", "Sifət", "Say", "Əvəzlik",
  "Feil və feilin şəkilləri", "Feilin təsriflənməyən formaları", "Zərf", "Qoşma", "Bağlayıcı", "Ədat",
  "Modal söz və nida", "Nitq hissələrinin omonimliyi", "Söz birləşməsi", "Sintaktik əlaqələr",
  "Mübtəda və xəbər", "Tamamlıq, təyin, zərflik", "Həmcins üzvlər", "Əlavə, ara söz və xitab",
  "Cümlənin məqsəd və intonasiyaya görə növləri", "Baş üzvlərin iştirakına görə cümlələr",
  "Tabesiz mürəkkəb cümlə", "Durğu işarələri",
];

const AZ_BLOK = [
  ...AZ_9,
  "Tabeli mürəkkəb cümlə", "Vasitəsiz və vasitəli nitq", "Dil və yazı", "Ədəbi dilin normaları",
  "Üslublar və sözün üslubi funksiyaları", "Bədii üslub", "Elmi üslub", "Publisistik üslub",
  "Rəsmi-işgüzar və məişət üslubu", "Xülasə və tezis",
];

const RIYAZ_9 = [
  "Natural ədədlər və bölünmə", "Adi kəsrlər", "Onluq kəsrlər", "Tam və rasional ədədlər", "Həqiqi ədədlər",
  "Nisbət və tənasüb", "Faiz", "Birhədli və çoxhədlilər", "Müxtəsər vurma düsturları və vuruqlara ayırma",
  "Rasional ifadələr", "Kvadrat kök", "Tam üstlü qüvvət və standart şəkil", "n-ci dərəcədən kök və irrasional ifadələr",
  "Ölçmə və statistika", "Çoxluqlar", "Ehtimal nəzəriyyəsinin elementləri", "Xətti tənliklər",
  "Kvadrat tənliklər", "Rasional, irrasional və modullu tənliklər", "Tənliklər sistemi",
  "Ədədi bərabərsizliklər və aralıqlar", "Xətti və rasional bərabərsizliklər", "Kvadrat bərabərsizliklər",
  "Funksiyalar və qrafiklər", "Bucaqlar və paralel düz xətlər", "Çevrə və dairə", "Üçbucaqlar",
  "Üçbucaqların konqruyentliyi", "Düzbucaqlı üçbucaq və Pifaqor teoremi", "Dördbucaqlılar və çoxbucaqlılar",
  "Fiqurların sahəsi", "Koordinatlar üsulu", "Simmetriya və oxşarlıq", "Çoxüzlülər (səth və həcm)",
];

const ING_9 = [
  "Fonetika (Phonetics)", "Sinonim və antonimlər", "Tərkibi feillər (Phrasal Verbs)", "Sözdüzəltmə (Word formation)",
  "İsim: sayılan, sayılmayan, cəm", "İsmin halları (Possessive Case)", "Artikl (a, an, the)", "Sifət və dərəcələr",
  "Bağlayıcı feillər (Link verbs)", "Say (Numerals)", "Şəxs və yiyəlik əvəzlikləri", "Qayıdış və işarə əvəzlikləri",
  "Qeyri-müəyyən əvəzliklər və miqdar sözləri", "Present Simple", "Past Simple və used to", "Future Simple",
  "Present Continuous", "Past Continuous", "Present Perfect", "Modal feillər", "Məchul növ (Passive Voice)",
  "Əmr forması (Imperative)", "Məsdər (Infinitive)", "Cerund (Gerund)", "Zərf (Adverbs)", "Sözönü (Prepositions)",
  "Bağlayıcılar (Conjunctions)", "Söz birləşmələri (Collocations)", "Sual cümlələri", "So do I / Neither do I",
  "Şəxssiz cümlələr və There is/are", "Şərt budaq cümləsi (Zero və First Conditional)", "Zaman budaq cümləsi",
];

const RIYAZ_BLOK = [
  "Həqiqi ədədlər", "Kompleks ədədlər", "Nisbət, tənasüb, faiz", "Rasional ifadələr",
  "İrrasional ifadələr və həqiqi üstlü qüvvət", "Ölçmə, statistika və çoxluqlar", "Birləşmələr və ehtimal",
  "Birdəyişənli tənliklər", "Tənliklər sistemi", "Bərabərsizliklər", "Ədədi ardıcıllıqlar və silsilələr",
  "Funksiyalar və qrafiklər", "Triqonometrik funksiyalar", "Triqonometrik tənliklər", "Üstlü və loqarifmik funksiyalar",
  "Üstlü və loqarifmik tənliklər və bərabərsizliklər", "Limit, kəsilməzlik və törəmə", "Törəmənin tətbiqi",
  "İbtidai funksiya və inteqral", "Sadə həndəsi fiqurlar", "Çevrə və dairə", "Üçbucaqlar",
  "Dördbucaqlılar və çoxbucaqlılar", "Fiqurların sahəsi", "Koordinatlar üsulu, hərəkət, oxşarlıq, vektorlar",
  "Fəzada nöqtə, düz xətt, müstəvi", "Çoxüzlülər", "Fırlanma cisimləri",
];

const EDEBIYYAT = [
  "# Şifahi və qədim dövr", "Şifahi xalq ədəbiyyatı: növ və janrlar", "Aşıq yaradıcılığı və dastanlar",
  "Kitabi-Dədə Qorqud eposu",
  "# İntibah və orta əsrlər", "XI–XII əsr: Xaqani və Məhsəti", "Nizami Gəncəvi", "XIII–XIV əsr anadilli şeir",
  "İmadəddin Nəsimi", "Şah İsmayıl Xətayi", "Məhəmməd Füzuli",
  "# XVII–XIX əsr", "XVII–XVIII əsr aşıq şeiri və Koroğlu", "Molla Pənah Vaqif", "XIX əsr maarifçi realizm dövrü",
  "Qasım bəy Zakir", "Mirzə Fətəli Axundzadə", "Aşıq Ələsgər", "Seyid Əzim Şirvani", "Nəcəf bəy Vəzirov",
  "# XX əsrin əvvəli", "Tənqidi realizm və Molla Nəsrəddin jurnalı", "Romantizm və Füyuzat jurnalı",
  "Cəlil Məmmədquluzadə", "Mirzə Ələkbər Sabir", "Hüseyn Cavid", "Əhməd Cavad",
  "# Cənubi Azərbaycan və sovet dövrü", "Məhəmmədhüseyn Şəhriyar", "Sovet dövrü: sosialist realizmi",
  "Cəfər Cabbarlı", "Səməd Vurğun", "Rəsul Rza", "Mir Cəlal", "XX əsrin 60–90-cı illəri",
  "İlyas Əfəndiyev", "İsmayıl Şıxlı",
  "# Müstəqillik dövrü və dünya ədəbiyyatı", "Müstəqillik dövrü ədəbiyyatı", "Bəxtiyar Vahabzadə",
  "Dünya ədəbiyyatından seçmələr", "Ədəbiyyat nəzəriyyəsi",
];

const TARIX = [
  "# Azərbaycan tarixi",
  "Tarix elminə giriş", "Daş, tunc və dəmir dövrləri", "İlk dövlətlər: Aratta, Lullubi, Kuti", "Manna dövləti",
  "İskit şahlığı, Midiya və Əhəməni dövrü", "Atropatena dövləti", "Qafqaz Albaniyası",
  "Sasani dövründə Azərbaycan (III–VII əsr)", "Ərəb işğalı və Xilafət dövrü", "Xürrəmilər hərəkatı və Babək",
  "IX–XI əsr feodal dövlətləri", "Səlcuqlar və Eldənizlər", "Monqol dövrü: Hülakülər, Çobanilər, Cəlairilər",
  "Qaraqoyunlu və Ağqoyunlu dövlətləri", "Səfəvi dövləti: I İsmayıl və I Təhmasib",
  "Şah I Abbas və Səfəvilərin tənəzzülü", "Nadir şah Əfşar", "Azərbaycan xanlıqları",
  "Rusiya işğalı: Gülüstan və Türkmənçay", "Müstəmləkə rejimi və islahatlar (XIX əsr)",
  "Neft sənayesi və iqtisadi inkişaf", "Milli oyanış və milli hərəkat", "Cənubi Azərbaycan XIX–XX əsrin əvvəli",
  "1917-ci il və Cənubi Qafqaz Seymi", "Azərbaycan Xalq Cümhuriyyəti", "Azərbaycan Xalq Cümhuriyyətinin süqutu",
  "Azərbaycan SSR (20–40-cı illər)", "İkinci Dünya müharibəsi illəri", "Azərbaycan SSR (1945–1980-ci illər)",
  "Cənubi Azərbaycan XX əsr", "Xalq hərəkatı və 20 Yanvar", "Müstəqilliyin bərpası və I Qarabağ müharibəsi",
  "Heydər Əliyevin rəhbərliyi və dövlət quruculuğu", "Yeni minillikdə inkişaf",
  "Vətən müharibəsi və Böyük Qayıdış", "Mədəniyyət və idman",
  "# Ümumi tarix: qədim dövr",
  "Qədim Misir", "Qədim Şumer", "Böyük Hun dövləti", "Qədim Çin", "Qədim Hindistan", "Qədim Yunanıstan",
  "Makedoniya və İsgəndər", "Qədim Roma",
  "# Ümumi tarix: orta əsrlər",
  "Feodalizm", "Göytürk və Xəzər dövlətləri", "Ərəb Xilafəti", "Frank dövləti və Avropa IX–XI əsr", "Bizans",
  "Böyük Səlcuq dövləti", "Monqol imperiyası və Qızıl Ordu", "Hindistan: Dehli sultanlığı və Böyük Moğollar",
  "Osmanlı imperiyası (yüksəliş)", "Teymuri dövləti", "Xaçlı yürüşləri", "Qərbi Avropada mərkəzləşmiş dövlətlər",
  "Reformasiya və Otuzillik müharibə", "Böyük coğrafi kəşflər",
  "# Ümumi tarix: yeni və ən yeni dövr",
  "Osmanlı imperiyası (durğunluq və geriləmə)", "Hindistan, Çin və Yaponiya (Yeni dövr)", "Şimali Qafqaz",
  "İngiltərə inqilabı", "Fransa", "Almaniya", "Rusiya", "Ən yeni dövr",
];

const COGRAFIYA = [
  "# Yer kürəsi və xəritə", "Coğrafiyaya giriş", "Plan, miqyas və xəritə", "Yerin forma və hərəkətləri",
  "# Litosfer", "Yerin quruluşu və süxurlar", "Tektonika, zəlzələ və vulkanlar", "Faydalı qazıntılar",
  "Azərbaycanın geoloji quruluşu", "Relyef",
  "# Atmosfer", "Atmosferin tərkibi və günəş radiasiyası", "Havanın temperaturu", "Atmosfer təzyiqi və küləklər",
  "Atmosferdə su və yağıntılar", "Hava, iqlim və iqlim qurşaqları", "Azərbaycanın iqlimi",
  "# Hidrosfer", "Dünya okeanı", "Çaylar və göllər", "Xəzər dənizi", "Buzlaqlar və yeraltı sular",
  "# Biosfer və landşaftlar", "Torpaq", "Coğrafi təbəqə və təbii zonalar", "Azərbaycanın landşaftları",
  "# Dünyanın coğrafiyası", "Dünyanın siyasi xəritəsi", "Təbii ehtiyatlar", "Dünya əhalisi",
  "Məskunlaşma və urbanizasiya", "Əmək ehtiyatları və məşğulluq", "Dünya təsərrüfatı", "Nəqliyyat",
];

const FIZIKA_OLD = [
  "# Mexanika", "Mexaniki hərəkət və kinematika", "Düzxətli bərabərsürətli hərəkət", "Düzxətli bərabərtəcilli hərəkət",
  "Çevrə üzrə bərabərsürətli hərəkət", "Nyuton qanunları", "Kütlə və sıxlıq", "Qüvvə və tarazlıq", "Sadə mexanizmlər",
  "Ümumdünya cazibə qanunu", "Ağırlıq qüvvəsi və sərbəst düşmə", "Elastiklik və sürtünmə qüvvələri",
  "İmpuls və saxlanma qanunları", "Mexaniki iş, güc və enerji", "Mexaniki rəqslər", "Mexaniki dalğalar və səs",
  "Təzyiq, Paskal və Arximed qanunu",
  "# Molekulyar fizika", "Molekulyar-kinetik nəzəriyyənin əsasları", "İdeal qaz qanunları", "Temperatur və şkalalar",
  "Termodinamikanın əsasları", "İstilik mühərrikləri", "Bərk cisimlər", "Səthi gərilmə və kapilyar hadisələr",
  "# Digər bölmələr", "Elektrodinamika", "Optika", "Atom və atom nüvəsi",
];

const KIMYA_OLD = [
  "# Ümumi kimya", "Kimyanın ilk anlayışları", "Atom-molekul təlimi və kimyəvi formullar", "Kimyəvi tənliklər",
  "Maddə miqdarı, mol və Avoqadro qanunu", "Atomun quruluşu", "Dövri qanun və dövri sistem", "Kimyəvi rabitə",
  "Valentlik və oksidləşmə dərəcəsi", "Kimyəvi reaksiyaların təsnifatı və istilik effekti",
  "Oksidləşmə-reduksiya reaksiyaları", "Reaksiya sürəti və kimyəvi tarazlıq", "Məhlullar",
  "Elektrolitik dissosiasiya", "Elektroliz və hidroliz", "Qeyri-üzvi birləşmələrin sinifləri",
  "# Qeyri-üzvi kimya", "Hidrogen, oksigen və su", "Halogenlər (Xlor)", "Oksigen yarımqrupu (Kükürd)",
  "Azot yarımqrupu", "Karbon yarımqrupu (Karbon, Silisium)",
  "# Üzvi kimya", "Üzvi birləşmələrin quruluş nəzəriyyəsi", "Mürəkkəb efirlər", "Polimerlər və kauçuklar",
];

const BIOLOGIYA_OLD = [
  "# Bitkilər aləmi", "Canlıların xüsusiyyətləri və tədqiqat üsulları", "Bitki hüceyrəsi", "Bitki toxumaları",
  "Kök", "Zoğ, tumurcuq və gövdə", "Yarpaq", "Fotosintez və tənəffüs", "Vegetativ çoxalma",
  "Çiçək və generativ orqanlar", "Tozlanma və mayalanma", "Meyvə və toxum", "Bitkilər və ətraf mühit",
  "Canlıların təsnifatı", "Yosunlar", "Mamırlar və qıjıkimilər", "Çılpaq və örtülütoxumlular",
  "İkiləpəlilər və birləpəlilər", "Bakteriyalar, göbələklər, şibyələr",
  "# Heyvanlar aləmi", "Birhüceyrəli heyvanlar", "Bağırsaqboşluqlular", "Yastı qurdlar", "Sap və həlqəvi qurdlar",
  "Molyusklar", "Balıqlar",
  "# İnsan, hüceyrə və təkamül", "Qan-damar sistemi və qan", "Hüceyrənin kimyəvi tərkibi", "Genetika",
  "İnsanın əmələ gəlməsi və təkamül",
];

const INFORMATIKA = [
  "İnformasiya və informasiya prosesləri", "İnformasiya təhlükəsizliyi", "İnformasiyanın kodlaşdırılması və miqdarı",
  "Say sistemləri", "Modelləşdirmə", "Kompüterin aparat təminatı", "Proqram təminatı və əməliyyat sistemi",
  "Mətn prosessorları", "Cədvəl prosessorları", "Verilənlər bazası", "Alqoritm", "Proqramlaşdırma (Python)",
  "Kompüter şəbəkələri", "İnternet", "Veb-proqramlaşdırma (HTML, CSS)",
];

const S = (id: string, name: string, topics: string[]): Subject => ({ id, name, topics });

export const PROGRAMS: Program[] = [
  {
    id: "b9",
    title: "9-cu sinif buraxılış",
    hint: "Azərbaycan dili, Riyaziyyat, İngilis dili",
    subjects: [S("az9", "Azərbaycan dili", AZ_9), S("riy9", "Riyaziyyat", RIYAZ_9), S("ing9", "İngilis dili", ING_9)],
  },
  {
    id: "b11",
    title: "11-ci sinif buraxılış",
    hint: "Azərbaycan dili, Riyaziyyat, İngilis dili",
    subjects: [S("az", "Azərbaycan dili", AZ_BLOK), S("riy", "Riyaziyyat", RIYAZ_BLOK), S("ing11", "İngilis dili", [])],
  },
  {
    id: "k1",
    title: "11-ci sinif blok: 1-ci qrup",
    hint: "Riyaziyyat, Fizika, Kimya, İnformatika",
    subjects: [S("riy", "Riyaziyyat", RIYAZ_BLOK), S("fiz", "Fizika", FIZIKA), S("kim", "Kimya", KIMYA), S("inf", "İnformatika", INFORMATIKA)],
  },
  {
    id: "k2",
    title: "11-ci sinif blok: 2-ci qrup",
    hint: "Riyaziyyat, Coğrafiya, Tarix",
    subjects: [S("riy", "Riyaziyyat", RIYAZ_BLOK), S("cog", "Coğrafiya", COGRAFIYA), S("tar", "Tarix", TARIX)],
  },
  {
    id: "k3",
    title: "11-ci sinif blok: 3-cü qrup",
    hint: "Azərbaycan dili, Ədəbiyyat, Tarix, Coğrafiya",
    subjects: [S("az", "Azərbaycan dili", AZ_BLOK), S("edb", "Ədəbiyyat", EDEBIYYAT), S("tar", "Tarix", TARIX), S("cog", "Coğrafiya", COGRAFIYA)],
  },
  {
    id: "k4",
    title: "11-ci sinif blok: 4-cü qrup",
    hint: "Fizika, Kimya, Biologiya",
    subjects: [S("fiz", "Fizika", FIZIKA), S("kim", "Kimya", KIMYA), S("bio", "Biologiya", BIOLOGIYA)],
  },
];