import { Prompt, CATEGORY_MAP, CHRISTMAS_CARDS_RANGE } from "./prompts";

/**
 * Kategori + arama filtresi.
 *
 * Bu mantik onceden HomeClient icinde, tarayiciya gonderilen 5297 promptun
 * tamami uzerinde calisiyordu. Artik hem sunucu (/api/prompts) hem de ilk
 * render ayni fonksiyonu kullaniyor - boylece sayfalama sunucuya tasinirken
 * filtreleme davranisi birebir ayni kaliyor.
 */
/**
 * /kategori/[slug] sayfasinin kendi kategori eslesmesi.
 *
 * matchesFilter'dan bilerek ayri: burada DB'deki etiketin bosluklari tireye
 * cevriliyor ve yilbasi display_number ozel durumu yok - yilbasi kategorisi
 * sayfasi etikete gore, ana sayfadaki filtre numara araligina gore calisiyor.
 * Sayfalama API'ye tasinirken bu davranis birebir kalsin diye birlestirilmedi.
 */
export function matchesCategorySlug(p: Prompt, slug: string): boolean {
    return (
        p.categories?.some(
            (c) => c.toLowerCase().replace(/\s+/g, "-") === slug
        ) || false
    );
}

export function matchesFilter(
    p: Prompt,
    activeCategory: string,
    searchQuery: string
): boolean {
    const englishTag = CATEGORY_MAP[activeCategory] || "";
    const displayNum = p.displayNumber || 0;
    const cardNumber = `#${String(displayNum).padStart(5, "0")}`;

    // Kart numarasi ile arama (orn. #00002 veya #2)
    const searchNum = searchQuery.replace("#", "").replace(/^0+/, ""); // bastaki sifirlari at
    const cardNum = String(displayNum);

    const matchesCardNumber =
        searchQuery.startsWith("#") &&
        (cardNumber === searchQuery ||
            cardNumber.includes(searchQuery.replace("#", "")) ||
            cardNum === searchNum);

    // Yilbasi kartlari display_number araligina gore filtrelenir, kategoriye gore degil
    let matchesCategory = false;
    if (activeCategory === "Tümü") {
        matchesCategory = true;
    } else if (englishTag === "christmas") {
        matchesCategory =
            displayNum >= CHRISTMAS_CARDS_RANGE.start &&
            displayNum <= CHRISTMAS_CARDS_RANGE.end;
    } else {
        matchesCategory =
            p.categories?.some(
                (cat) => cat.toLowerCase() === englishTag.toLowerCase()
            ) || false;
    }

    const matchesSearch =
        !searchQuery ||
        matchesCardNumber ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prompt?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && !!matchesSearch;
}
