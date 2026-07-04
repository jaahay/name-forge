import { compileNameCriteriaToGenerationSettings } from './nameCriteriaCompiler';
import { diagnosticsForNameCriteria } from './nameCriteriaDiagnostics';
import { generateNameFromSilhouette } from './generator';
import { toNameArtifact } from './nameArtifact';
import { resolveNameRequest } from './nameRequest';
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
