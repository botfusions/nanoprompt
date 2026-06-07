import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iletisim - AITASVIR STUDYO",
  description:
    "AITASVIR STUDYO ile iletisime gecin. Soru, oneri ve geri bildirimleriniz icin bizimle iletisime gecin.",
  openGraph: {
    title: "Iletisim | AITASVIR STUDYO",
    description: "AITASVIR STUDYO ile iletisime gecin.",
  },
  alternates: { canonical: "/iletisim" },
};

export default function IletisimPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-black uppercase mb-8 text-brand-black">
          Iletisim
        </h1>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Bizimle Iletisime Gecin</h2>
          <p className="text-brand-black/80 leading-relaxed mb-6">
            Soru, oneri veya geri bildirimleriniz icin asagidaki kanallardan
            bize ulasabilirsiniz.
          </p>
        </section>

        <section className="mb-10 space-y-6">
          <div className="bg-gray-50 border-2 border-brand-black/10 p-6">
            <h3 className="font-bold text-lg mb-2">E-posta</h3>
            <a
              href="mailto:info@botfusions.com"
              className="text-brand-cyan underline text-lg"
            >
              info@botfusions.com
            </a>
          </div>

          <div className="bg-gray-50 border-2 border-brand-black/10 p-6">
            <h3 className="font-bold text-lg mb-2">Sosyal Medya</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-brand-black/60">X (Twitter):</span>{" "}
                <span className="text-brand-black/80">Yakin zamanda aktif
                edilecek</span>
              </li>
              <li>
                <span className="text-brand-black/60">Instagram:</span>{" "}
                <span className="text-brand-black/80">Yakin zamanda aktif
                edilecek</span>
              </li>
              <li>
                <span className="text-brand-black/60">LinkedIn:</span>{" "}
                <span className="text-brand-black/80">Yakin zamanda aktif
                edilecek</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border-2 border-brand-black/10 p-6">
            <h3 className="font-bold text-lg mb-2">Sirket</h3>
            <p className="text-brand-black/80">
              <strong>BotFusions</strong>
              <br />
              Turkiye
            </p>
          </div>
        </section>

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
