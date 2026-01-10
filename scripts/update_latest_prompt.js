// Son eklenen promptu güncelle - başlık ve prompt içeriği
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateLatestPrompt() {
  // En son eklenen kaydı bul
  const { data: latestPrompt, error: findError } = await supabase
    .from("banana_prompts")
    .select("id, title, date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (findError) {
    console.error("Kayıt bulunamadı:", findError);
    return;
  }

  console.log("Bulundu:", latestPrompt);

  // Güncelle
  const { data, error } = await supabase
    .from("banana_prompts")
    .update({
      title: "Nano Banana Pro prompt",
      prompt: `Do this for a random famous Asian painting <instruction>

Input A is a Famous Painting (e.g., The Mona Lisa, The Scream). Analyze: The brushstroke technique, the 3D depth implied, and the hidden symbols. 
Goal: A "Paint Tube Squeeze." A giant, realistic oil paint tube sitting on a palette. 
Rules:

Action: The tube is being squeezed, and the paint coming out is not just a blob, but it forms the 3D landscape of the painting. The Mona Lisa's face is emerging in 3D relief from the 2D smear of paint. 

Texture: Viscous, thick oil paint texture (impasto).

Props: Paintbrushes, a dirty rag, a palette knife, plus culture appropriate tools and environment. 
 
Lighting: North-light studio lighting, true color representation. Output:
ONE image, 4:5, "artistic process" aesthetic. </instruction>`,
      display_number: 2954,
      date: "2025-12-29",
    })
    .eq("id", latestPrompt.id)
    .select();

  if (error) {
    console.error("Güncelleme hatası:", error);
  } else {
    console.log("✅ Güncellendi:", data);
  }
}

updateLatestPrompt();
