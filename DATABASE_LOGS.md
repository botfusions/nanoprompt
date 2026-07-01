# Database Sync & Update History

All major database operations and imports are recorded here.

## [2026-06-13] Bulk Prompt Visualization (2. Paket - 7 Kart)

**Summary:** Visualized 7 more imageless prompts from the database using image generator and updated the records with local image paths. 3 prompts are pending due to API quota limits.

**Details:**
- **Scale:** 7 prompts total (#4364, #4363, #4353, #4347, #4296, #4293, #4275).
- **Images Generated:** Saved under `public/images/<prompt_id>.png`.
- **Database Update:** Updated `update_database_images.js` and successfully wrote local image paths and set `approved = true`.

**Applied by:** Antigravity AI
**Status:** In Progress (Quota Limited) ⏳

---

## [2026-06-13] Bulk Prompt Visualization (1. Paket - 10 Kart)

**Summary:** Visualized the first 10 imageless prompts from the database using image generator and updated the records with local image paths.

**Details:**
- **Scale:** 10 prompts total (#4591, #4571, #4548, #4533, #4530, #4524, #4515, #4512, #4491, #4407).
- **Images Generated:** Saved under `public/images/<prompt_id>.png`.
- **Database Update:** Ran `scripts/update_database_images.js` using service role key to write local image paths `['/images/<prompt_id>.png']` and set `approved = true`.
- **Verification:** Verified images copy and metadata schema mapping. Next.js server test performed.

**Applied by:** Antigravity AI
**Status:** Completed ✅

---

## [2026-06-13] Card Fix: #04509 Prompt Restored

**Summary:** Restored the real prompt on card **#04509** — it had a placeholder ("Prompts in ALT") instead of the actual prompt (images were present, prompt was missing).

**Details:**
- **Card:** `f2ee66db-60b3-4abe-9998-ed71fa19e7c9` (display_number `4605`, author `umesh_ai`, 4 images)
- **Before:** `POV: You just discovered nature's hidden artwork! Prompts in ALT Generated with ChatGPT Images 2.0` (100 chars — placeholder, not a real prompt)
- **After:** Mediterranean first-person driving scene prompt (442 chars)
- **Applied via:** `UPDATE public.banana_prompts SET prompt = '...' WHERE id = '...'` (`/pg/query`, service role key)
- **Scale:** 6 cards total have "Prompts in ALT" placeholder; only 2 have images. #04509 is now fixed; the other (display_number 3297, FLUX product images) remains.
- **Note:** Site shows #04509 but DB display_number is 4605 — the on-site card number is computed after client-side filtering/sorting in `getAllPrompts()`, so it can differ from the raw `display_number`.

**Applied by:** Claude Code (via `/pg/query`)
**Status:** Completed ✅

---

## [2026-06-13] Schema Fix: `approved` Column Added (CRITICAL)

**Summary:**
- Added missing `approved` boolean column to `banana_prompts` table.
- All 4,602 existing prompts set to `approved = true` (remain published).
- Fixed critical bug: live site (`aitasvir.com`) showed empty homepage — no products.

**Details:**
- **Root Cause:** `getAllPrompts()` in `src/data/prompts.ts` selected the `approved` column, but the column did not exist in the DB → Supabase query error (code `42703: column banana_prompts.approved does not exist`) → function returned `[]` → empty homepage. DB itself was healthy (4,602 rows, connection fine).
- **Fix Applied** via Supabase `pg-meta` endpoint (`POST /pg/query`) using the service role key:
  - `ALTER TABLE public.banana_prompts ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;`
  - `UPDATE public.banana_prompts SET approved = true;` (backfill all 4,602 rows so they stay published)
- **Column Definition:** `boolean`, `NOT NULL`, `DEFAULT false` (matches `AITASVİR_V2/nanobotv2/src/data/schema.sql` design — new prompts default to pending/unapproved).
- **RLS Note:** RLS is enabled on the table, but the SELECT policy is `USING true` (all rows visible to anon; NOT gated on `approved`). The `USING (approved = true)` policy from `schema.sql` was never applied to the live DB. If admin-approval gating is wanted later, update the policy to `USING (approved = true)` — then `approved = false` prompts auto-hide.
- **Verification:** App query (anon key) now returns data; live site renders **4,477 prompts** after client-side filters (excluded IDs, Korean/Chinese removal, etc.).
- **No code change / no deploy required** — fix was DB-only; ISR (`revalidate = 60`) picked it up automatically.
- **Shared DB:** Same `supabase.turklawai.com` DB is used by the side-project `AITASVİR_V2/nanobotv2` — this migration fixes both sites.

**Applied by:** Claude Code (via `/pg/query`, service role key)
**Status:** Completed ✅

---

## [2026-06-07] Bulk Prompt Import

**Summary:** 
- Import of 250 new prompts from `twitter_prompts`.
- Total count updated.

**Details:**
- **Import:** 250 prompts imported from `twitter_prompts` to `banana_prompts` (#04357 - #04606).
- **Cleanup:** `twitter_prompts` table cleared.

**Applied by:** Antigravity AI
**Status:** Completed ✅

---

## [2026-04-29] Bulk Prompt Import

**Summary:** 
- Import of 43 new prompts from `twitter_prompts`.
- Total count updated to 3,715.

**Details:**
- **Import:** 43 prompts imported from `twitter_prompts` to `banana_prompts` (#03673 - #03715).
- **Cleanup:** `twitter_prompts` table cleared.
- **Total Prompt Count:** 3,715.

**Applied by:** Antigravity AI
**Status:** Completed ✅

---

## [2026-04-26] Bulk Prompt Import

**Summary:** 
- Import of 132 new prompts from staging.
- Verification of database integrity.

**Details:**
- **Import:** 132 prompts imported from `twitter_prompts` to `banana_prompts` (#03541 - #03672).
- **Cleanup:** `twitter_prompts` table cleared.
- **Total Prompt Count:** 3,672.

**Applied by:** Antigravity AI
**Status:** Completed ✅

---

## [2026-01-11] Prompt Sync & Numbering Fix

**Summary:** 
- Massive re-numbering of existing prompts.
- Import of Twitter prompts.
- Verification of Christmas prompts.

**Details:**
- **Re-numbering:** 3,128 prompts in `banana_prompts` were updated with sequential `display_number` based on `created_at`.
- **Twitter Import:** 74 prompts imported from `twitter_prompts` to `banana_prompts` (#03129 - #03202).
- **Cleanup:** All 74 records deleted from `twitter_prompts` after successful import.
- **Christmas Check:** 140 prompts in `extract-data.json` verified. All were already present in DB.
- **Total Prompt Count:** 3,202.

**Applied by:** Antigravity AI
**Status:** Completed ✅

---

## [2026-01-10] Security Patch

**Summary:** 
- Removed hardcoded Supabase Service Role Key from scripts.
- Implemented `.env.local` usage for all backend scripts.

---

## [2026-01-08] AI Evaluator v2.0

**Summary:** 
- Batch processing for prompt scoring implemented.
- Automatic sync for high-scoring prompts to `banana_top_prompts`.
