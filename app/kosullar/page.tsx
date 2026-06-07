import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanim Kosullari - AITASVIR STUDYO",
  description:
    "AITASVIR STUDYO kullanim kosullari. Platformun kullanim sartlari hakkinda bilgi edinin.",
  openGraph: {
    title: "Kullanim Kosullari | AITASVIR STUDYO",
    description: "Platform kullanim sartlari ve kosullari.",
  },
  alternates: { canonical: "/kosullar" },
};

export default function KosullarPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-black uppercase mb-2 text-brand-black">
          Kullanim Kosullari
        </h1>
        <p className="text-brand-black/50 text-sm mb-10">
          Son guncelleme: 24 Mayis 2026
        </p>

        <div className="prose max-w-none space-y-8 text-brand-black/80">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Kabul</h2>
            <p className="leading-relaxed">
              AITASVIR STUDYO platformunu kullanarak bu kullanim kosullarini
              kabul etmis sayilirsiniz. Kosullari kabul etmiyorsaniz platformu
              kullanmayiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              2. Hizmet Aciklamasi
            </h2>
            <p className="leading-relaxed">
              AITASVIR STUDYO, yapay zeka modelleri ile gorsel ve video
              olusturma hizmeti sunar. Platform iceriginde AI prompt sablonlari,
              gorsel olusturma araclari ve kredi sistemi bulunmaktadir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Kullanici Yukumlulukleri</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Platformu yasalara uygun sekilde kullanmak</li>
              <li>Hesap bilgilerinizin guvenligini saglamak</li>
              <li>
                Zararli, yasadisi veya telif hakki ihlali iceren icerik
                uretmemek
              </li>
              <li>Platform teknik altyapisini zorlamamak</li>
              <li>Baska kullanicilarin haklarina saygi gosteremek</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Kredi ve Odeme</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Ucretsiz baslangic kredileri platformun hediye kredileridir
              </li>
              <li>
                Satin alinan krediler iade edilmez
              </li>
              <li>
                Krediler AI gorsel olusturma icin kullanilir, nakit degeri
                yoktur
              </li>
              <li>Odeme islemleri PayTR uzerinden guvenli sekilde yapilir</li>
              <li>
                Fiyatlandirma degisikligi hakkiniz saklidir
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              5. Fikri Mulkiyet
            </h2>
            <p className="leading-relaxed">
              Platformdaki prompt sablonlari acik kaynaklidir ve AI
              modelleri tarafindan uretilen gorseller kullanicilara aittir.
              Ancak, AI ile uretilen iceriklerin ticari kullanimi ilgili
              yasantilara tabidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              6. Sorumluluk Sinirlamasi
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                AI tarafindan uretilen gorsellerin kalitesi degiskenlik
                gosterebilir
              </li>
              <li>
                Promptlar her zaman istenen sonucu vermeyebilir
              </li>
              <li>
                Platform kesintisiz hizmet garanti etmez
              </li>
              <li>
                Teknik sorunlardan dogan zararlardan sorumlu degiliz
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              7. Hesap Sonlandirma
            </h2>
            <p className="leading-relaxed">
              Kullanim kosullarini ihlal eden kullanicilarin hesaplari sonlandirilabilir. Kalan krediler iade edilmez.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">
              8. Degisiklikler
            </h2>
            <p className="leading-relaxed">
              Bu kosullar onceden bildirimde bulunmaksizin degistirilebilir.
              Degisiklikler sayfada yayimlandigi tarihte yururluge girer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. Iletisim</h2>
            <p className="leading-relaxed">
              Kullanim kosullari hakkinda sorulariniz icin:{" "}
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
