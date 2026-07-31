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
