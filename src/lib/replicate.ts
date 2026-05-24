import Replicate from 'replicate';
import { MODELS } from './models';
import type { ModelKey } from './models';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export { MODELS };
export type { ModelKey };

export interface GenerateParams {
  prompt: string;
  model: string;
  width: number;
  height: number;
  negativePrompt?: string;
  seed?: number;
}

export interface GenerateResult {
  imageUrl: string;
  enhancedPrompt: string;
}

export async function generateImage(params: GenerateParams): Promise<GenerateResult> {
  const modelConfig = MODELS[params.model as ModelKey];
  if (!modelConfig) {
    throw new Error(`Unknown model: ${params.model}`);
  }

  const enhancedPrompt = buildEnhancedPrompt(params.prompt, params.negativePrompt);

  const input: Record<string, unknown> = {
    prompt: enhancedPrompt,
    width: params.width,
    height: params.height,
  };

  if (params.model === 'flux-schnell' || params.model === 'flux-pro') {
    input.num_outputs = 1;
    input.go_fast = params.model === 'flux-schnell';
    if (params.seed) input.seed = params.seed;
  }

  if (params.model === 'sdxl') {
    input.num_inference_steps = 30;
    input.guidance_scale = 7.5;
    if (params.negativePrompt) input.negative_prompt = params.negativePrompt;
  }

  const modelIdentifier = modelConfig.version
    ? `${modelConfig.id}:${modelConfig.version}`
    : modelConfig.id;

  const output = await replicate.run(modelIdentifier as `${string}/${string}`, { input });

  const imageUrl = extractImageUrl(output);

  return { imageUrl, enhancedPrompt };
}

function extractImageUrl(output: unknown): string {
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) {
    const first = output[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'url' in first) return (first as { url: string }).url;
  }
  if (output && typeof output === 'object' && 'url' in output) {
    return (output as { url: string }).url;
  }
  throw new Error('Unexpected output format from Replicate');
}

function buildEnhancedPrompt(prompt: string, negativePrompt?: string): string {
  const qualitySuffix = ', high quality, detailed, professional';
  return prompt + qualitySuffix;
}
