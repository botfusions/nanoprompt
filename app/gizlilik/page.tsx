import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikasi - AITASVIR STUDYO",
  description:
    "AITASVIR STUDYO gizlilik politikasi. Kisisel verilerinizin nasil korundugu hakkinda bilgi edinin.",
  openGraph: {
    title: "Gizlilik Politikasi | AITASVIR STUDYO",
    description: "Kisisel verilerinizin korunmasi hakkinda bilgi.",
  },
  alternates: { canonical: "/gizlilik" },
};

export default function GizlilikPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-black uppercase mb-2 text-brand-black">
          Gizlilik Politikasi
        </h1>
        <p className="text-brand-black/50 text-sm mb-10">
          Son guncelleme: 24 Mayis 2026
        </p>

        <div className="prose max-w-none space-y-8 text-brand-black/80">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Genel</h2>
            <p className="leading-relaxed">
              AITASVIR STUDYO (&quot;Platform&quot;), BotFusions tarafindan
              isletilmektedir. Bu gizlilik politikasi, platformumuz uzerinden
              toplanan kisisel verilerinizin nasil islendigini aciklar. KVKK
              (Kisisel Verilerin Korunmasi Kanunu) uyumlu calismaktayiz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              2. Toplanan Veriler
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Hesap Bilgileri:</strong> Google OAuth ile giris
                yaptiginizda adi, e-posta adresi ve profil fotografi
              </li>
              <li>
                <strong>Kullanim Verileri:</strong> Olusturdugunuz gorsellerin
                prompt metinleri (gorseller kendileri saklanmaz)
              </li>
              <li>
                <strong>Kredi ve Odeme:</strong> Kredi bakiyeniz ve PayTR
                odeme kayitlari
              </li>
              <li>
                <strong>Teknik Veriler:</strong> IP adresi, tarayici bilgileri,
                cihaz bilgileri
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              3. Verilerin Kullanim Amaci
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Hizmet sunumu ve gelistirme</li>
              <li>Kullanici kimligi dogrulama</li>
              <li>Kredi sistemi yonetimi</li>
              <li>Guvenlik ve kotu niyetli kullanim onleme</li>
              <li>Yasal yukumluluklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Veri Paylasimi</h2>
            <p className="leading-relaxed">
              Kisisel verileriniz ucuncu kisilerle paylasilmaz. Asagidaki
              hizmet saglayicilar veri isleme amaciyla erisime sahiptir:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>
                <strong>Google (Firebase):</strong> Kimlik dogrulama
              </li>
              <li>
                <strong>Supabase:</strong> Veritabani barindirma
              </li>
              <li>
                <strong>Replicate:</strong> AI gorsel olusturma
              </li>
              <li>
                <strong>PayTR:</strong> Odeme isleme
              </li>
              <li>
                <strong>Vercel:</strong> Hosting ve CDN
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Cerezler</h2>
            <p className="leading-relaxed">
              Platformumuz, kullanici deneyimini iyilestirmek icin cerezler
              kullanmaktadir. Favoriler ve oturum bilgileri LocalStorage
              uzerinde tutulur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Veri Guvenligi</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>HTTPS/SSL sifreleme</li>
              <li>Content Security Policy (CSP)</li>
              <li>Row Level Security (RLS) veritabani korumasi</li>
              <li>Rate limiting ve IP bazli koruma</li>
              <li>API anahtarlari sifreli ortam degiskenlerinde saklanir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Haklariniz</h2>
            <p className="leading-relaxed mb-3">KVKK kapsaminda asagidaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Kisisel verilerinize erisim talep etme</li>
              <li>Duzeltilmesini isteme</li>
              <li>Silinmesini talep etme</li>
              <li>Islenmesine itiraz etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Iletisim</h2>
            <p className="leading-relaxed">
              Gizlilik politikasi hakkinda sorulariniz icin:{" "}
              <a
                href="mailto:info@botfusions.com"
                className="text-brand-cyan underline"
              >
                info@botfusions.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-black/10">
          <Link
            href="/"
            className="text-brand-cyan font-bold hover:underline"
          >
            &larr; Ana Sayfaya Don
          </Link>
        </div>
      </div>
    </main>
  );
}
