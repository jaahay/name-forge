import { diagnosticsForNameCriteria } from './nameCriteriaDiagnostics';
import { generateNameFromSilhouette } from './generator';
import { toNameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';
import { resolveNameRequest } from './nameRequest';
import type { NameRequest, NameResponse } from './nameRequest';
import { createSeededRandom } from './random';
import { createDefaultRegistry, type SourceRegistry } from './registry';
import { createNameSilhouette } from './silhouettes';
import type { GenerationSettings } from './types';

const DEFAULT_STYLE_PACK_ID = 'british-literary-fantasy';

export interface NameResponseAdapterOptions {
  readonly registry?: SourceRegistry;
  readonly stylePackId?: string;
}

function resolveStylePackId(registry: SourceRegistry, requestedStylePackId: string | undefined): string {
  return requestedStylePackId ?? registry.listStylePacks()[0]?.id ?? DEFAULT_STYLE_PACK_ID;
}

function bridgeCriteriaToGenerationSettings(criteria: NameCriteria, seed: string, stylePackId: string): GenerationSettings {
  // Slice 4 established this seam without making criteria behavior-affecting yet.
  // Slice 5 reports diagnostic-only criteria; Slice 6 adds functional criteria-to-current-control mapping.
  void criteria;

  return {
    castSize: 1,
    novelty: 0.48,
    pronounceability: 0.72,
    memorability: 0.65,
    culturalAnchoring: 0.62,
    orthographicWeirdness: 0.28,
    stylePackId,
    seed,
    nameFormat: 'given-only',
    rarityDistribution: 'style-pack',
    rolePreset: 'none',
    roleInfluence: 'off',
    slotRoleOverrides: {},
  };
}

export function generateNameResponse(request: NameRequest, options: NameResponseAdapterOptions = {}): NameResponse {
  const resolution = resolveNameRequest(request);
  const diagnostics = diagnosticsForNameCriteria(resolution.request.criteria);
  const registry = options.registry ?? createDefaultRegistry();
  const settings = bridgeCriteriaToGenerationSettings(
    resolution.request.criteria,
    resolution.random.seed,
    resolveStylePackId(registry, options.stylePackId),
  );
  const pack = registry.getStylePack(settings.stylePackId);
  const silhouette = createNameSilhouette(
    settings,
    pack,
    createSeededRandom(`${resolution.random.seed}:name-request-v1:silhouette:0`),
    0,
  );
  const generatedName = generateNameFromSilhouette(
    silhouette,
    pack,
    settings,
    createSeededRandom(`${resolution.random.seed}:name-request-v1:name:0`),
    0,
  );
  const artifact = toNameArtifact(generatedName);

  return {
    version: 1,
    request: resolution.request,
    names: [artifact],
    random: resolution.random,
    ...(diagnostics.length === 0 ? {} : { diagnostics }),
  };
}
