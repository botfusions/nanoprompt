/**
 * /api/prompts regresyon kontrolu.
 *
 * Ana sayfa payload'i 9.1 MB -> 77 KB'a dusurulurken sayfalama sunucuya tasindi.
 * Kirilgan nokta: sunucunun bastigi ilk 32 kart ile API'nin ilk sayfasi ayni
 * olmazsa "daha fazla goster" kart tekrar eder veya atlar.
 *
 * Kullanim:  npm start   (ayri terminalde)
 *            node scripts/test_prompts_api.mjs
 */
import assert from 'node:assert';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';
const get = async (qs) => (await fetch(`${BASE}/api/prompts?${qs}`)).json();

const tests = {
    async 'sunucu ilk sayfasi API ilk sayfasiyla ayni'() {
        const html = await (await fetch(`${BASE}/`)).text();
        const ilkKart = [...html.matchAll(/display_number\\?":(\d+)/g)].map(m => +m[1])[0];
        const { items } = await get('limit=32&offset=0');
        assert.strictEqual(items[0].displayNumber, ilkKart,
            'sunucu HTML ile API ilk sayfasi uyusmuyor - dikiste kart tekrari olur');
    },

    async 'sayfalar birbirini tekrar etmiyor'() {
        const a = (await get('limit=32&offset=0')).items.map(i => i.id);
        const b = (await get('limit=32&offset=32')).items.map(i => i.id);
        assert.strictEqual(a.filter(id => b.includes(id)).length, 0, 'sayfalar kesisiyor');
        assert.strictEqual(new Set([...a, ...b]).size, 64, '64 kart benzersiz degil');
    },

    async 'kart numarasi ile arama tek sonuc dondurur'() {
        const { items, total } = await get('q=%234010&limit=32');
        assert.strictEqual(total, 1, '#4010 aramasi tek kart dondurmeli');
        assert.strictEqual(items[0].displayNumber, 4010);
    },

    async 'yilbasi kategorisi display_number araligina sadik'() {
        const { items } = await get(`limit=100&category=${encodeURIComponent('🎄 Yılbaşı Kartları')}`);
        assert.ok(items.length > 0, 'yilbasi kategorisi bos dondu');
        assert.ok(items.every(i => i.displayNumber >= 2973 && i.displayNumber <= 3112),
            'aralik disi kart sizdi');
    },

    async 'sonucsuz arama bos doner'() {
        const { items, total } = await get('q=zzzz-boyle-bir-sey-yok');
        assert.strictEqual(total, 0);
        assert.strictEqual(items.length, 0);
    },

    async 'limit ustten sinirlanir'() {
        const { items } = await get('limit=999&offset=0');
        assert.ok(items.length <= 100, `limit sinirlanmadi: ${items.length}`);
    },

    async 'prompt detay sayfasi cache\'lenebilir'() {
        // Bu rota once "no-store" ile calisiyordu: her bot istegi bir fonksiyon
        // calistirip tum tabloyu cekiyordu. generateStaticParams/revalidate
        // kaldirilirsa sessizce o hale doner - bu test onu yakalar.
        const res = await fetch(`${BASE}/prompt/4010`);
        assert.strictEqual(res.status, 200);
        const cc = res.headers.get('cache-control') || '';
        assert.ok(!/no-store/.test(cc), `prompt sayfasi cache'lenmiyor: ${cc}`);
        assert.ok(/s-maxage|max-age/.test(cc), `cache suresi yok: ${cc}`);
    },

    async 'gecersiz prompt id 404 doner'() {
        const res = await fetch(`${BASE}/prompt/boyle-bir-id-yok`);
        assert.strictEqual(res.status, 404);
    },

    async 'kategori sayfasi da payload sismiyor'() {
        // /kategori/[slug] ayni hataya sahipti: tum kategori prop olarak gecince
        // 329 KB HTML uretiyordu. 20 kategori sayfasi var, botlar hepsini geziyor.
        const html = await (await fetch(`${BASE}/kategori/photography`)).text();
        const kartSayisi = [...html.matchAll(/display_number/g)].length;
        assert.ok(kartSayisi <= 64,
            `kategori sayfasina ${kartSayisi} kart gomulmus`);
    },

    async 'kategori API slug ile filtreliyor'() {
        const { items, total } = await get('slug=photography&limit=32');
        assert.ok(total > 0, 'photography slug bos dondu');
        assert.ok(items.every(i =>
            i.categories?.some(c => c.toLowerCase().replace(/\s+/g, '-') === 'photography')),
            'slug disi kart sizdi');
    },

    async 'robots egitim botlarini kapatiyor'() {
        // Bu satirlar dusrse 5297 sayfalik katalog yine bedavaya taranir.
        const txt = (await (await fetch(`${BASE}/robots.txt`)).text()).toLowerCase();
        for (const bot of ['gptbot', 'google-extended', 'applebot-extended']) {
            const blok = txt.split(/\n\s*\n/).find(b => b.includes(`user-agent: ${bot}`));
            assert.ok(blok, `${bot} kurali yok`);
            assert.ok(/^disallow: \/$/m.test(blok), `${bot} hala acik: ${blok}`);
        }
    },

    async 'payload sismesi geri gelmedi'() {
        const html = await (await fetch(`${BASE}/`)).text();
        const kartSayisi = [...html.matchAll(/display_number/g)].length;
        assert.ok(kartSayisi <= 64,
            `ana sayfaya ${kartSayisi} kart gomulmus - tum veri seti yine payload'a giriyor`);
    },
};

let hata = 0;
for (const [ad, fn] of Object.entries(tests)) {
    try {
        await fn();
        console.log(`  ok  ${ad}`);
    } catch (e) {
        hata++;
        console.log(`  HATA ${ad}\n       ${e.message}`);
    }
}
console.log(hata === 0 ? '\nTUM TESTLER GECTI' : `\n${hata} TEST BASARISIZ`);
process.exit(hata === 0 ? 0 : 1);
