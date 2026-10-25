# NANO PROMPT STUDYO V2 — Oturum Handoff (2026-10-25)

## 0. Video prompts section (2026-10-25, latest)
- Imported 1,132 video prompts (Seedance 2.0/2.5, Grok Imagine, Gemini, Claude Opus 5.5) into `banana_prompts` as display numbers **#5513 – #6644**, category `['video']`, `author = Botfusions`, `source = botfusions`, `approved = true`, `created_at` = original publish date. Table total: 5504 → **6636**.
- Source archive: `~/Documents/open/youmind-video-prompts/md/` (1,164 files). 32 prompts with CJK characters were skipped because `getAllPrompts()` hides them. Report: `video_import_report.json`.
- Rule from the user: the origin name must never appear on the site. 452 covers that sat on the origin CDN were copied to the Supabase bucket `image/video-prompts/<id>.jpg`; twimg covers kept as-is. New rows contain no origin string in any field (verified by query).
- Script: `scripts/import_video_prompts.js <md-dir> [--dry-run] [--limit N]`, idempotent (skips rows with the same title + prompt start).
- Code: `Video` added to `CATEGORIES`/`CATEGORY_MAP` (`src/data/prompts.ts`) and to the sitemap map; `isVideoPrompt()` in `src/data/filter.ts` keeps video rows out of the homepage "Tümü" feed; card tab reads "VIDEO PROMPT" for them; header got a "Video Promptlar" button to `/kategori/video`; category metadata has a video description.
- Verified locally (`next dev`, port 3077): `/kategori/video` 200 with 1,132 items, homepage first 100 contain no video rows, header link present.
- Committed as `10d77eb` and pushed to `botfusions/nanoprompt` main. Vercel auto-deployed; live check: `https://www.aitasvir.com/kategori/video` returns 200 with 1,132 items, no origin string in the HTML, header button visible on the homepage.
- Still untracked from the previous session, not part of the commit: `public/images/prompt_*.png` (6 files), `scripts/check_queue_status.js`, `scripts/sync_image_to_card.js`, `scripts/image_generation_queue.json`, `.claude/settings.json`.
- Open items: Grok Imagine, Gemini and Claude Opus 5.5 badges fall through to the gray default in `lib/modelHelper.ts` (Seedance has its own cyan rule); the homepage ISR is 3600 s, so cached visitors see the new header button within an hour. The 140 old image rows that carried `source = 'YouMind'` from an earlier migration were updated to `botfusions` on the user's request; their display numbers are in `exports/source_youmind_backup_2026-10-25.json`. No row in the table contains the origin name any more.

## 1. Twitter Prompts İçe Aktarımı (En Son)
1. **`scripts/import_twitter_prompts.js` çalıştırıldı:**
   - `twitter_prompts` tablosundaki 48 kaydın tamamı `banana_prompts`'a aktarıldı (48 başarılı, 0 hata).
   - Yeni kart numaraları: **#05465 – #05512**. `banana_prompts` toplam: 5456 → **5504**.
   - Aktarılan kayıtlar `twitter_prompts`'tan silindi, tablo artık boş (REST ile doğrulandı).
   - Model tespiti script içinde otomatik yapıldı (GPT Image 2 / Midjourney / Flux vb.).
2. **Eksik bilgi:** 1 kayıtta görsel yok — **#05486** (`id: 753a3b77-06cb-4681-bd0b-ac78059413f1`, "Girl character map" prompt'u). Detay `eksik_bilgi_raporu.json`'da; görsel üretimi bu id üzerinden yapılacak.

## 2. Canlı Site Doğrulaması
- Deploy gerekmedi: kart verisi Supabase'ten canlı geliyor, kod değişmedi.
- `aitasvir.com/api/prompts` yeni kartları veriyor (#5505–#5512 en yeniler arasında).
- `/prompt/5465`, `/prompt/5486`, `/prompt/5512` → hepsi 200.
- Ana sayfa ISR (`revalidate = 3600`): HTML en geç 1 saatte kendini yeniler; lazy-load listesi yenileri şimdiden gösteriyor.

## 3. Bilinen Sorun: Vercel Erişimi
- Vercel CLI: `vercel whoami` → "Not authorized".
- Vercel MCP token'ı: 403, `cenks-projects-305eb3e7` scope'una erişimi yok.
- Deployment geçmişi doğrulanamadı; canlı kontrol curl ile yapıldı.
- Deploy gerektiğinde önce `vercel login` yapılmalı. (CLI 59.4.0, güncel sürüm 62.2.0.)

## Önceki Oturum (2026-09-06, tamamlandı)
- Dinamik model rozetleri (`lib/modelHelper.ts`) + tam ekran lightbox (`components/ImageLightboxModal.tsx`) → commit `c36600e`, origin'e push'lu.

## Durum
- Veritabanı değişiklikleri kalıcı (Supabase). Kod değişikliği yok, commit gerekmiyor.
- Bekleyen iş: #05486 için görsel üretimi.
