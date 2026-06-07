# Uygulama Planı - Prompt Veri Çıkarma Maratonu

Bu plan, 301 olan mevcut prompt sayısını 1228 hedefine ulaştırmak için aşamalı bir veri çıkarma stratejisini içerir.

## Faz 1: Prompt Sayısını 1228+ Hedefine Çıkarma

### Strateji
1. **GitHub Veri Kaynağı Kullanımı**: `YouMind-OpenLab/awesome-nano-banana-pro-prompts` reposu üzerinden tam veri setini (JSON formatında) çekeceğiz.
2. **Otomatik Çıkarma (Turbo Mod)**: Güvenli komutlar için kullanıcı onayı beklemeden (`SafeToAutoRun: true`) hızlı ilerlenecek.
3. **Mükerrer Kontrolü**: Mevcut 301 prompt ile yenileri karşılaştırılarak veri bütünlüğü korunacak.

### Teknik Detaylar
- Script: `scripts/extract_github_data.js` (Yeni oluşturulacak).
- Veri Kaynağı: GitHub API / Raw Content.

## Verifikasyon Planı
- `PROMPTS.length` değerinin 650+ olduğu kontrol edilecek.
- Rastgele seçilen yeni promptların UI üzerinde doğru göründüğü teyit edilecek.

---

## Faz 2: Hedef 950 (Gelecek Aşama)
## Faz 3: Hedef 1228 (Final)

