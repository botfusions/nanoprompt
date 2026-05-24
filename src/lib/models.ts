export type ModelKey = 'flux-schnell' | 'flux-pro' | 'sdxl';

interface ModelConfig {
  id: string;
  version: string | null;
  name: string;
  description: string;
  creditCost: number;
  estimatedTime: string;
}

export const MODELS: Record<ModelKey, ModelConfig> = {
  'flux-schnell': {
    id: 'black-forest-labs/flux-schnell',
    version: null,
    name: 'Flux Schnell',
    description: 'Hızlı ve ekonomik',
    creditCost: 1,
    estimatedTime: '5-10s',
  },
  'flux-pro': {
    id: 'black-forest-labs/flux-1.1-pro',
    version: null,
    name: 'Flux Pro',
    description: 'Yüksek kalite, detaylı',
    creditCost: 3,
    estimatedTime: '15-30s',
  },
  'sdxl': {
    id: 'stability-ai/sdxl',
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    name: 'SDXL',
    description: 'Dengeli kalite ve hız',
    creditCost: 2,
    estimatedTime: '10-20s',
  },
};
