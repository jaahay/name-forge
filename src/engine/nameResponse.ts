import { compileNameCriteriaToGenerationSettings } from './nameCriteriaCompiler';
import { diagnosticsForNameCriteria } from './nameCriteriaDiagnostics';
import { generateNameFromSilhouette } from '../naming/generator';
import { toNameArtifact } from './nameArtifact';
import { deriveNameChildSeed, resolveNameRequest } from './nameRequest';
import type { NameRequest, NameResponse } from './nameRequest';
import { createSeededRandom } from './random';
import { createDefaultRegistry, type SourceRegistry } from './registry';
import { createNameSilhouette } from './silhouettes';

const DEFAULT_STYLE_PACK_ID = 'british-literary-fantasy';

export interface NameResponseAdapterOptions {
  readonly registry?: SourceRegistry;
  readonly stylePackId?: string;
}

function resolveStylePackId(registry: SourceRegistry, requestedStylePackId: string | undefined): string {
  return requestedStylePackId ?? registry.listStylePacks()[0]?.id ?? DEFAULT_STYLE_PACK_ID;
}

export function generateNameResponse(request: NameRequest, options: NameResponseAdapterOptions = {}): NameResponse {
  const resolution = resolveNameRequest(request);
  const diagnostics = diagnosticsForNameCriteria(resolution.request.criteria);
  const registry = options.registry ?? createDefaultRegistry();
  const settings = compileNameCriteriaToGenerationSettings(
    resolution.request.criteria,
    {
      seed: resolution.random.seed,
      stylePackId: resolveStylePackId(registry, options.stylePackId),
    },
  );
  const pack = registry.getStylePack(settings.stylePackId);
  const childSeeds = Array.from(
    { length: resolution.request.quantity.value },
    (_, index) => deriveNameChildSeed(resolution.random.seed, index),
  );
  const names = childSeeds.map((childSeed, artifactIndex) => {
    const childSettings = { ...settings, seed: childSeed };
    const silhouette = createNameSilhouette(
      childSettings,
      pack,
      createSeededRandom(`${childSeed}:name-request-v1:silhouette:0`),
      artifactIndex,
    );
    const generatedName = generateNameFromSilhouette(
      silhouette,
      pack,
      childSettings,
      createSeededRandom(`${childSeed}:name-request-v1:name:0`),
      artifactIndex,
    );

    return toNameArtifact(generatedName);
  });

  return {
    version: 1,
    request: resolution.request,
    names,
    grouping: {
      kind: resolution.request.grouping.kind,
      quantity: resolution.request.quantity.value,
      parentSeed: resolution.random.seed,
      childSeeds,
    },
    random: resolution.random,
    ...(diagnostics.length === 0 ? {} : { diagnostics }),
  };
}
