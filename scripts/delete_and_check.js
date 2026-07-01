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

async function main() {
    // Delete record #4706 from banana_prompts
    console.log("🗑️ Deleting record #4706 from banana_prompts...");
    const { data, error } = await supabase
        .from('banana_prompts')
        .delete()
        .eq('display_number', 4706)
        .select();

    if (error) {
        console.error("❌ Delete error:", error.message);
    } else {
        console.log(`✅ Deleted ${data ? data.length : 0} record(s) with display_number = 4706.`);
    }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
