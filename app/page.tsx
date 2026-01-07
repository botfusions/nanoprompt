import { getAllPrompts } from "@/src/data/prompts";
import HomeClient from "./HomeClient";

// Force dynamic rendering to avoid ISR page size limit
export const dynamic = 'force-dynamic';

// This is a Server Component by default
export default async function Home() {
  const prompts = await getAllPrompts();

  return <HomeClient initialPrompts={prompts} />;
}
