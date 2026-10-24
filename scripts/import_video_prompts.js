/**
 * Video prompt archive -> banana_prompts import.
 *
 * Reads one markdown file per prompt (YAML frontmatter + "## Prompt" fenced block),
 * rehosts covers that sit on the archive CDN into the public Supabase bucket `image`,
 * and inserts rows tagged with the `video` category. Author and source are Botfusions;
 * the archive origin never reaches the database.
 *
 * Usage: node scripts/import_video_prompts.js <archive-md-dir> [--dry-run] [--limit N]
 * Re-running skips prompts already present (same title + prompt start).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const args = process.argv.slice(2);
const mdDir = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const limitArg = args.indexOf('--limit');
const limit = limitArg > -1 ? Number(args[limitArg + 1]) : Infinity;

if (!mdDir || !fs.existsSync(mdDir)) {
    console.error('Usage: node scripts/import_video_prompts.js <archive-md-dir> [--dry-run] [--limit N]');
    process.exit(1);
}

const BUCKET = 'image';
const BUCKET_DIR = 'video-prompts';
const REHOST_HOST = 'cms-assets.youmind.com';
const CJK = /[ㄱ-힝一-鿿]/; // getAllPrompts hides these rows, so do not import them
const BRAND = 'Botfusions';

const env = {};
for (const p of ['.env', '.env.local']) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        const t = line.trim();
        const i = t.indexOf('=');
        if (t && !t.startsWith('#') && i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

function scrub(text) {
    return (text || '').replace(/youmind/gi, BRAND).trim();
}

function parseMd(file) {
    const raw = fs.readFileSync(file, 'utf8');
    const [, fm, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) || [];
    if (!fm) return null;
    const meta = {};
    for (const line of fm.split('\n')) {
        const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
        if (m) meta[m[1]] = m[2];
    }
    const prompt = (body.match(/## Prompt\n\n```\n([\s\S]*?)\n```\s*$/) || [])[1] || '';
    const summary = (body.match(/^# .*\n\n([\s\S]*?)\n\n## Prompt/m) || [])[1] || '';
    return {
        prompt_id: Number(meta.prompt_id),
        title: scrub(meta.title),
        model: meta.model,
        published: meta.published,
        thumbnail: meta.thumbnail,
        summary: scrub(summary),
        prompt: scrub(prompt)
    };
}

async function rehost(rec) {
    const url = rec.thumbnail;
    if (!url.includes(REHOST_HOST)) return url;
    const objectPath = `${BUCKET_DIR}/${rec.prompt_id}${path.extname(new URL(url).pathname) || '.jpg'}`;
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    if (dryRun) return pub.publicUrl;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`cover download ${res.status} for ${rec.prompt_id}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buf, {
        contentType: res.headers.get('content-type') || 'image/jpeg',
        upsert: true
    });
    if (error) throw new Error(`cover upload ${rec.prompt_id}: ${error.message}`);
    return pub.publicUrl;
}

async function main() {
    const files = fs.readdirSync(mdDir).filter(f => f.endsWith('.md')).map(f => path.join(mdDir, f));
    const records = files.map(parseMd).filter(Boolean)
        .sort((a, b) => new Date(a.published) - new Date(b.published));

    const skipped = { cjk: [], noPrompt: [], noCover: [], exists: [] };
    const { data: existing, error: exErr } = await supabase
        .from('banana_prompts').select('title, prompt').contains('categories', ['video']);
    if (exErr) throw exErr;
    const seen = new Set((existing || []).map(r => `${r.title}|${(r.prompt || '').slice(0, 100)}`));

    const todo = [];
    for (const r of records) {
        if (!r.prompt) skipped.noPrompt.push(r.prompt_id);
        else if (CJK.test(r.prompt)) skipped.cjk.push(r.prompt_id);
        else if (!r.thumbnail) skipped.noCover.push(r.prompt_id);
        else if (seen.has(`${r.title}|${r.prompt.slice(0, 100)}`)) skipped.exists.push(r.prompt_id);
        else todo.push(r);
    }
    const batchTodo = todo.slice(0, limit);

    const { data: maxRow, error: maxErr } = await supabase
        .from('banana_prompts').select('display_number')
        .not('display_number', 'is', null).order('display_number', { ascending: false }).limit(1);
    if (maxErr) throw maxErr;
    let next = (maxRow?.[0]?.display_number || 0) + 1;

    console.log(`files ${files.length}, already in db ${seen.size}, to import ${batchTodo.length}, first number #${next}`);
    console.log(`skipped: cjk ${skipped.cjk.length}, no prompt ${skipped.noPrompt.length}, no cover ${skipped.noCover.length}, exists ${skipped.exists.length}`);
    if (dryRun) {
        const rehostCount = batchTodo.filter(r => r.thumbnail.includes(REHOST_HOST)).length;
        console.log(`dry run: ${rehostCount} covers would be rehosted to ${BUCKET}/${BUCKET_DIR}`);
        console.log('sample row:', JSON.stringify({ ...batchTodo[0], images: [await rehost(batchTodo[0])] }, null, 1).slice(0, 900));
        return;
    }

    let ok = 0, failed = [];
    for (let i = 0; i < batchTodo.length; i += 50) {
        const rows = [];
        for (const r of batchTodo.slice(i, i + 50)) {
            try {
                rows.push({
                    id: crypto.randomUUID(),
                    title: r.title,
                    prompt: r.prompt,
                    summary: r.summary || null,
                    images: [await rehost(r)],
                    author: BRAND,
                    source: BRAND.toLowerCase(),
                    categories: ['video'],
                    featured: false,
                    approved: true,
                    model: r.model,
                    display_number: next++,
                    created_at: r.published || new Date().toISOString()
                });
            } catch (e) {
                failed.push({ prompt_id: r.prompt_id, error: e.message });
                console.log(`   ⚠️ ${r.prompt_id}: ${e.message}`);
            }
        }
        if (!rows.length) continue;
        const { error } = await supabase.from('banana_prompts').insert(rows);
        if (error) {
            failed.push(...rows.map(x => ({ title: x.title, error: error.message })));
            console.log(`   ❌ batch ${i / 50 + 1}: ${error.message}`);
        } else {
            ok += rows.length;
            console.log(`   ✅ ${ok}/${batchTodo.length} (#${rows[0].display_number}–#${rows[rows.length - 1].display_number})`);
        }
    }
    const report = { imported: ok, failed, skipped };
    fs.writeFileSync('video_import_report.json', JSON.stringify(report, null, 2));
    console.log(`done: imported ${ok}, failed ${failed.length}; report -> video_import_report.json`);
}

main().catch(err => { console.error('fatal:', err.message); process.exit(1); });
