# awesome-gpt-image-2 Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract ~750 prompts and images from `temp_awesome_gpt/README_tr-TR.md` and integrate them into NANO PROMPT STÜDYO V2.

**Architecture:** 
1. Create a Node.js utility script `scripts/extract_prompts.js`.
2. Parse `temp_awesome_gpt/README_tr-TR.md` to extract prompt metadata (title, description, content, images).
3. Download images from `cms-assets.youmind.com` to `public/assets/gpt_image_2/`.
4. Generate `src/data/gpt_image_2_prompts.json` with local image paths.
5. Integrate the JSON into the application logic.

**Tech Stack:** Node.js, `fs`, `path`, native `fetch`.

---

### Task 1: Setup Infrastructure

**Files:**
- Create: `public/assets/gpt_image_2/`
- Create: `src/data/` (if not exists)

**Step 1: Create directories**
Run: `mkdir -p public/assets/gpt_image_2 src/data`

---

### Task 2: Implement Extraction Script

**Files:**
- Create: `scripts/extract_prompts.js`

**Step 1: Write extraction logic**
Create `scripts/extract_prompts.js` with:
- `fs.readFileSync` for the README.
- Regex/Loop to find `### No.` blocks.
- Extraction of title, description, prompt, and image URLs.
- Download logic using `fetch`.
- JSON generation.

**Step 2: Run the script**
Run: `node scripts/extract_prompts.js`

---

### Task 3: Application Integration

**Files:**
- Modify: `src/app/page.tsx` (or appropriate component)

**Step 1: Import the generated JSON**
Import `gpt_image_2_prompts.json` and display it in a new section/category.

---

### Task 4: Cleanup

**Step 1: Remove temporary repository**
Run: `rm -rf temp_awesome_gpt`

---

## ✅ Final Checklist

- [ ] All ~750 prompts extracted
- [ ] Images downloaded locally
- [ ] UI updated to show new prompts
- [ ] Temporary files removed
