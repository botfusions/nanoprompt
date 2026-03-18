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
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// #02953 için tam prompt içeriği
const prompt02953Content = `{
  "subject": {
    "description": "A side-profile shot of an athletic Black male runner mid-stride, captured in a high-energy sports editorial poster style. The image features mixed media elements with neon lime green scribbles outlining his body.",
    "mirror_rules": "not_applicable",
    "age": "20-30 years old",
    "expression": {
      "eyes": {
        "look": "focused forward",
        "energy": "determined",
        "direction": "right"
      },
      "mouth": {
        "position": "slightly open breathing",
        "energy": "intense"
      },
      "overall": "in the zone, meditative flow state"
    },
    "face": {
      "preserve_original": true,
      "makeup": "natural sweat sheen"
    },
    "hair": {
      "color": "black",
      "style": "short cropped buzz cut",
      "effect": "clean"
    },
    "body": {
      "frame": "lean athletic build",
      "waist": "runner physique",
      "chest": "forward leaning",
      "legs": "muscular, high knee lift, mid-air flight phase",
      "skin": {
        "visible_areas": "legs, face, hands",
        "tone": "dark skin",
        "texture": "smooth with muscle definition",
        "lighting_effect": "high contrast sun highlights"
      }
    },
    "pose": {
      "position": "running profile view",
      "base": "mid-air stride",
      "overall": "dynamic motion moving from left to right"
    },
    "clothing": {
      "top": {
        "type": "hooded windbreaker jacket",
        "color": "grey",
        "details": "lightweight technical fabric, slightly wrinkled from motion",
        "effect": "windblown"
      },
      "bottom": {
        "type": "layered running shorts",
        "color": "black",
        "details": "compression layer visible"
      },
      "shoes": {
        "type": "performance running sneakers",
        "color": "white with orange accents",
        "brand_style": "On Running Cloud style"
      }
    }
  },
  "accessories": {
    "jewelry": "none",
    "device": "none",
    "prop": "neon green doodle outline around the body (graphic overlay)"
  },
  "photography": {
    "camera_style": "sports editorial mixed with graphic design poster",
    "angle": "eye-level tracking shot, side profile",
    "shot_type": "full body, wide shot",
    "aspect_ratio": "3:4 vertical poster",
    "texture": "sharp photographic subject vs grainy asphalt vs flat vector graphics",
    "lighting": "hard directional sunlight (golden hour), casting sharp long shadows on the ground",
    "depth_of_field": "deep focus"
  },
  "background": {
    "setting": "outdoor asphalt road",
    "wall_color": "dark grey pavement",
    "elements": [
      "shadow of the runner",
      "road texture",
      "large neon green typography 'EXERCISE'",
      "hand-drawn arrows and small text overlays"
    ],
    "atmosphere": "urban morning exercise",
    "lighting": "natural sunlight"
  },
  "the_vibe": {
    "energy": "kinetic and rhythmic",
    "mood": "disciplined, motivating, healing",
    "aesthetic": "modern sports zine, street style graphic design",
    "authenticity": "high",
    "intimacy": "solitary runner",
    "story": "The intersection of physical exertion and mental clarity, visualized through a trendy graphic overlay.",
    "caption_energy": "Micro-exercise healing plan"
  },
  "constraints": {
    "must_keep": [
      "neon lime green outline around the runner",
      "the text 'EXERCISE' in large font",
      "side profile running pose",
      "asphalt texture"
    ],
    "avoid": [
      "studio background",
      "static pose",
      "cluttered background"
    ]
  },
  "negative_prompt": [
    "stationary",
    "blurry",
    "low resolution",
    "distorted limbs",
    "bad typography",
    "night time",
    "indoor"
  ]
}`;

// #02953 için 2 resim URL'si
const images02953 = [
    'https://pbs.twimg.com/media/G853Mz4bEAANDNB?format=jpg&name=small',
    'https://pbs.twimg.com/media/G853MzvagAECxtt?format=jpg&name=small'
];

async function update02953() {
    console.log("=== #02953 Güncelleme ===\n");

    try {
        // Önce mevcut kaydı kontrol et
        console.log("1. Mevcut kayıt kontrol ediliyor...");

        const { data: current, error: getError } = await supabase
            .from('banana_prompts')
            .select('*')
            .eq('id', '02953')
            .single();

        if (getError) {
            console.error("  Hata:", getError);
            return;
        }

        console.log("  Mevcut title:", current.title);
        console.log("  Mevcut images:", JSON.stringify(current.images));
        console.log("  Mevcut prompt uzunluğu:", current.prompt?.length || 0);

        // Güncelle
        console.log("\n2. Kayıt güncelleniyor...");

        const updateData = {
            title: "Athletic Runner - Sports Editorial Poster",
            prompt: prompt02953Content,
            images: images02953,
            author: "@BotFusionsS",
            source: "BotsNANO",
            categories: ["photography", "portrait", "creative"]
        };

        const { error: updateError } = await supabase
            .from('banana_prompts')
            .update(updateData)
            .eq('id', '02953');

        if (updateError) {
            console.error("  Güncelleme hatası:", updateError);
            return;
        }

        console.log("  ✓ Güncelleme komutu gönderildi!");

        // Doğrula
        console.log("\n3. Doğrulama...");

        const { data: verify, error: verifyError } = await supabase
            .from('banana_prompts')
            .select('*')
            .eq('id', '02953')
            .single();

        if (verifyError) {
            console.error("  Doğrulama hatası:", verifyError);
            return;
        }

        console.log("  Yeni title:", verify.title);
        console.log("  Yeni images (" + (verify.images?.length || 0) + " adet):", JSON.stringify(verify.images));
        console.log("  Yeni prompt uzunluğu:", verify.prompt?.length || 0);
        console.log("  Yeni author:", verify.author);
        console.log("  Yeni source:", verify.source);

        if (verify.images?.length === 2) {
            console.log("\n✅ BAŞARILI: #02953 artık 2 resme sahip!");
        } else {
            console.log("\n⚠️ Resim sayısı hala 2 değil - RLS sorunu olabilir");
        }

        console.log("\n=== Tamamlandı ===");

    } catch (err) {
        console.error("Script hatası:", err);
    }
}

update02953();
