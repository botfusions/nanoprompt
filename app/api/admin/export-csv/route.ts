import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/src/lib/auth';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
    try {
        // 0. Authorization Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        // Fetch top tier prompts from the new dedicated table or filter main table
        // Using main table for now to be safe until trigger populates the new table
        const { data: prompts, error } = await supabase
            .from('banana_prompts')
            .select('id, title, prompt, use_case, visual_style, conversion_score, short_reason')
            .not('conversion_score', 'is', null)
            .order('conversion_score', { ascending: false });

        if (error) throw error;

        if (!prompts || prompts.length === 0) {
            return NextResponse.json({ error: 'No top prompts found' }, { status: 404 });
        }

        // Convert to CSV
        const headers = ['ID', 'Title', 'Prompt', 'Use Case', 'Visual Style', 'Score', 'Reason'];
        const csvRows = [headers.join(',')];

        for (const p of prompts) {
            // CSV Injection Prevention: Prefix with ' if it starts with risky characters
            const sanitize = (val: any) => {
                const text = String(val || '');
                if (['=', '+', '-', '@'].some(char => text.startsWith(char))) {
                    return `'${text}`;
                }
                return text;
            };

            const row = [
                p.id,
                `"${sanitize(p.title).replace(/"/g, '""')}"`,
                `"${sanitize(p.prompt).replace(/"/g, '""')}"`,
                sanitize(p.use_case),
                sanitize(p.visual_style),
                p.conversion_score,
                `"${sanitize(p.short_reason).replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        }

        const csvContent = csvRows.join('\n');

        // Return as CSV file download
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="top_prompts_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error: any) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
