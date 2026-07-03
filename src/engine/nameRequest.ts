import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';

export type NameRequestVersion = 1;
export type RandomizationAlgorithm = 'name-forge-v1';
export type NameDiagnosticSeverity = 'info' | 'warning';
export type NameDiagnosticCode = 'criteria_not_implemented' | 'criteria_partially_implemented' | 'fallback_used';
export type NameDiagnosticKind = 'unsupported-criteria' | 'partially-implemented-criteria' | 'fallback-used';

export const NAME_REQUEST_RANDOMIZATION_ALGORITHM: RandomizationAlgorithm = 'name-forge-v1';

export interface RandomizationRequest {
  readonly seed?: string;
}

export interface RandomizationResult {
  readonly seed: string;
  readonly algorithm: RandomizationAlgorithm;
}

export interface NameRequest {
  readonly version: NameRequestVersion;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly random?: RandomizationRequest;
}

export interface NameRequestInput {
  readonly version: NameRequestVersion;
  readonly criteria?: NameCriteria;
  readonly mode?: string;
  readonly random?: RandomizationRequest;
}

export interface ResolvedNameRequest {
  readonly version: NameRequestVersion;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly random: RandomizationResult;
}

export interface NameRequestResolution {
  readonly request: ResolvedNameRequest;
  readonly random: RandomizationResult;
}

export interface NameResponse {
  readonly version: NameRequestVersion;
  readonly request: ResolvedNameRequest;
  readonly names: readonly NameArtifact[];
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
}

export interface NameDiagnostic {
  readonly id: string;
  readonly code: NameDiagnosticCode;
  readonly kind: NameDiagnosticKind;
  readonly severity: NameDiagnosticSeverity;
  readonly message: string;
  readonly clauseIds?: readonly string[];
}

const EMPTY_NAME_CRITERIA: NameCriteria = { clauses: [] };

function createFreshSeed(): string {
  const values = new Uint32Array(4);
  globalThis.crypto?.getRandomValues(values);

  const randomParts = Array.from(values).filter((value) => value > 0);
  if (randomParts.length > 0) {
    return `name-forge-${randomParts.map((value) => value.toString(36)).join('-')}`;
  }

  return `name-forge-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeNameCriteria(criteria: NameCriteria | undefined): NameCriteria {
  if (!criteria || !Array.isArray(criteria.clauses) || criteria.clauses.length === 0) {
    return EMPTY_NAME_CRITERIA;
  }

  return { clauses: criteria.clauses };
}

function resolveRandomization(random?: RandomizationRequest): RandomizationResult {
  return {
    seed: random?.seed ?? createFreshSeed(),
    algorithm: NAME_REQUEST_RANDOMIZATION_ALGORITHM,
  };
}

export function resolveNameRequest(request: NameRequestInput): NameRequestResolution {
  const random = resolveRandomization(request.random);
  const resolvedRequest: ResolvedNameRequest = {
    version: 1,
    criteria: normalizeNameCriteria(request.criteria),
    ...(request.mode === undefined ? {} : { mode: request.mode }),
    random,
  };

  return { request: resolvedRequest, random };
}
