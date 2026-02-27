# Görev Listesi - Prompt Araştırması

## 📋 Planlama

- [x] Proje yapısının incelenmesi ve Supabase yapılandırmasının bulunması
- [x] Mevcut veri tabanı tiplerinin (`supabase.ts` vb.) kontrol edilmesi
- [x] Uygulama planının (implementation_plan.md) oluşturulması ve onaylanması
- [x] `twitter_prompts` ve "yükleme deposu" verilerinin izinin sürülmesi
  - [x] `twitter_prompts` tablosu staging alanı olarak belirlendi (Stüdyo URL: `supabase.turklawai.com`)
  - [x] `botfusions-banana` projesindeki `import_twitter_prompts.js` betiği tespit edildi
  - [x] `banana_prompts` ana tablo, `twitter_prompts` ise yükleme deposu olarak doğrulandı

## 🚀 Uygulama

- [x] Bulunan promptların veritabanındaki yerinin tespiti (Şu an 71 adet beklemede)
- [x] Yazılımın tespiti (`botfusions-banana`)
- [x] 71 promptun `twitter_prompts` tablosundan `banana_prompts` tablosuna aktarılması
  - [x] Geçici migration scriptinin oluşturulması (`twitter_import.cjs`)
  - [x] Scriptin çalıştırılması ve verilerin aktarılması
  - [x] Geçici scriptin silinmesi

## ✅ Doğrulama

- [x] İşlem sonrası `banana_prompts` tablosundaki artışın kontrolü
- [x] `twitter_prompts` tablosunun temizlendiğinin teyidi
- [x] Bulguların kullanıcıya raporlanması

## 📁 Dokümantasyon ve Yedekleme

- [/] Raporların proje klasörüne kopyalanması (`docs/database_imports/`)
- [ ] Değişikliklerin GitHub'a push edilmesi
