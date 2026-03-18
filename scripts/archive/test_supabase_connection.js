
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envConfig[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing Supabase Connection...");
    try {
        // Try to fetch a simple query that should always work if connected,
        // or at least return a specific error (not network error)
        const { data, error } = await supabase.from('botsnano_profiles').select('count').limit(1);

        if (error) {
            console.error("Supabase Error:", error.message, error.code);
            // PGRST116 means no rows, which is fine, connection worked.
            // But select('count') usually returns data.
        } else {
            console.log("Connection Successful!");
            console.log("Data:", data);
        }
    } catch (err) {
        console.error("Connection Failed (Exception):", err);
    }
}

testConnection();
