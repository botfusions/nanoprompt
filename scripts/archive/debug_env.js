
const fs = require('fs');
const path = require('path');

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

const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
if (url) {
    try {
        const hostname = new URL(url).hostname;
        console.log("Supabase Hostname:", hostname);
        if (!hostname.endsWith('.supabase.co')) {
            console.warn("WARNING: Hostname does not end with .supabase.co. This might be blocked by CSP!");
        } else {
            console.log("Hostname matches .supabase.co pattern.");
        }
    } catch (e) {
        console.error("Invalid URL format:", url);
    }
} else {
    console.log("NEXT_PUBLIC_SUPABASE_URL is missing.");
}
