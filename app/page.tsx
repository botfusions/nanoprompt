import { getAllPrompts } from "@/src/data/prompts";
import HomeClient from "./HomeClient";

export const revalidate = 300;

// This is a Server Component by default
export default async function Home() {
  const prompts = await getAllPrompts();

  return <HomeClient initialPrompts={prompts} />;
}
