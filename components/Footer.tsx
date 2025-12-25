"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqItems: FAQItem[] = [
    {
        question: "NANO BANANA PRO NEDİR?",
        answer: "Nano Banana Pro, Google'ın en yeni çok modlu AI modelidir ve çok modlu anlama (metin, görüntü ve video), fotoğraf gerçekçiliğinden sanatsal stillere kadar yüksek kaliteli üretim, hızlı düzenlemeler ve varyasyonlarla hızlı yineleme, piksel sanatından yağlı boya resimlere kadar çeşitli stiller, kompozisyon ve aydınlatma üzerinde hassas kontrol ve karmaşık çok nesneli, çok karakterli sahne oluşturma özelliklerine sahiptir."
    },
    {
        question: "BU KISAYOLLAR NEREDEN GELİYOR?",
        answer: "Bu promptlar, dünya genelindeki AI sanatçıları ve yaratıcıları tarafından paylaşılan en iyi örneklerden derlenmektedir. Kaynaklarımız arasında Twitter/X, GitHub ve çeşitli AI toplulukları bulunmaktadır."
    },
    {
        question: "BU PROMPT'LARI NASIL KULLANIRIM?",
        answer: "Beğendiğiniz bir prompt'u kopyalayın, Nano Banana Pro veya desteklenen herhangi bir AI görsel oluşturucuya yapıştırın. İsterseniz kendi fotoğraflarınızı ekleyerek kişiselleştirebilirsiniz."
    },
    {
        question: "AI KISAYOLU NEDİR?",
        answer: "AI kısayolları, yapay zeka modellerine verilen özel talimat setleridir. Doğru prompt'lar kullanarak çok daha profesyonel ve tutarlı sonuçlar elde edebilirsiniz."
    },
    {
        question: "DAHA FAZLA KULLANIM DURUMU VAR MI?",
        answer: "Evet! Bu koleksiyonda portre, ürün, manzara, illüstrasyon ve daha birçok kategori bulunmaktadır. Ayrıca yeni prompt'lar sürekli eklenmektedir."
    }
];

export function Footer() {
    const [openIndex, setOpenIndex] = useState<number | null>(4); // Son soru varsayılan açık

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <footer className="w-full">
            {/* FAQ Section - Mor arka plan */}
            <section className="bg-[#A78BFA] py-12 px-4">
                <div className="container mx-auto max-w-3xl">
                    <div className="space-y-3">
                        {faqItems.map((item, index) => (
                            <div
                                key={index}
                                className="bg-brand-yellow border-2 border-brand-black shadow-neo"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left font-bold text-sm md:text-base hover:bg-yellow-300 transition-colors"
                                >
                                    <span>{item.question}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {openIndex === index && (
                                    <div className="px-4 pb-4 text-sm text-brand-black/80">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Cyan arka plan */}
            <section className="bg-brand-cyan py-16 px-4 relative overflow-hidden">
                <div className="container mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black uppercase mb-6 text-brand-black drop-shadow-[2px_2px_0_#fff]">
                        HAZIR MISINIZ
                        <br />
                        NANO BANANA İLE OLUŞTURMAYA?
                    </h2>

                    <div className="bg-white border-2 border-brand-black shadow-neo inline-block px-6 py-4">
                        <p className="font-medium text-brand-black">
                            Nano Banana Pro'nun güçlü yeteneklerini
                            <br />
                            deneyimleyin
                        </p>
                        <p className="text-brand-red font-bold text-lg">
                            HAYALGÜCÜNÜZİ UÇURUN
                        </p>
                    </div>
                </div>
            </section>

            {/* Copyright */}
            <section className="bg-brand-black py-4 px-4">
                <div className="container mx-auto text-center">
                    <p className="text-white/60 text-sm">
                        © 2024 BotsNANO. Tüm hakları saklıdır.
                    </p>
                </div>
            </section>
        </footer>
    );
}
