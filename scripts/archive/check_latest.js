const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    const { data, error } = await supabase
        .from('banana_prompts')
        .select('id, title, author, date, prompt')
        .order('date', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Son 5 prompt:\n');
    data.forEach((p, i) => {
        console.log(`${i + 1}. ID: ${p.id}`);
        console.log(`   Title: ${p.title}`);
        console.log(`   Author: ${p.author}`);
        console.log(`   Date: ${p.date}`);
        console.log(`   Prompt: ${(p.prompt || '').substring(0, 80)}...`);
        console.log('');
    });
}

check();
