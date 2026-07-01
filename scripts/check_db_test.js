const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env or .env.local
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local')
];

let envConfig = {};
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        content.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const eqIndex = trimmedLine.indexOf('=');
                if (eqIndex > 0) {
                    const key = trimmedLine.substring(0, eqIndex).trim();
                    const value = trimmedLine.substring(eqIndex + 1).trim();
                    envConfig[key] = value;
                }
            }
        });
    }
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || envConfig.VITE_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase configuration.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkImportedPrompts() {
    console.log("Checking recently imported prompts in banana_prompts table...");
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('*')
        .order('display_number', { ascending: false })
        .limit(3);

    if (error) {
        console.error("Error fetching data:", error.message);
        process.exit(1);
    }

    if (!data || data.length === 0) {
        console.log("No records found.");
        return;
    }

    console.log(`Found ${data.length} recently imported records:\n`);
    data.forEach((row, index) => {
        console.log(`[Record #${index + 1}]`);
        console.log(`Display Number: #${row.display_number}`);
        console.log(`Title: ${row.title || 'N/A'}`);
        console.log(`Prompt: ${row.prompt || 'MISSING'}`);
        console.log(`Images: ${JSON.stringify(row.images || 'MISSING')}`);
        console.log(`Source (X Link): ${row.source || 'MISSING'}`);
        console.log(`Author: ${row.author || 'N/A'}`);
        console.log("-".repeat(50));
    });
}

checkImportedPrompts()
  .then(() => process.exit(0))
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
