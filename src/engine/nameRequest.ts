import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';

export type NameRequestVersion = 1;
export type RandomizationAlgorithm = 'name-forge-v1';
export type NameDiagnosticSeverity = 'info' | 'warning';
export type NameDiagnosticCode = 'criteria_not_implemented' | 'criteria_partially_implemented' | 'fallback_used';
export type NameDiagnosticKind = 'unsupported-criteria' | 'partially-implemented-criteria' | 'fallback-used';
export type NameQuantityKind = 'exact';
export type NameGroupingKind = 'independent-set';

export const NAME_REQUEST_RANDOMIZATION_ALGORITHM: RandomizationAlgorithm = 'name-forge-v1';
export const MAX_EXACT_NAME_QUANTITY = 100;

export interface RandomizationRequest {
  readonly seed?: string;
}

export interface RandomizationResult {
  readonly seed: string;
  readonly algorithm: RandomizationAlgorithm;
}

export interface ExactNameQuantity {
  readonly kind: NameQuantityKind;
  readonly value: number;
}

export interface IndependentSetGrouping {
  readonly kind: NameGroupingKind;
}

export interface NameGroupMetadata extends IndependentSetGrouping {
  readonly quantity: number;
  readonly parentSeed: string;
  /** `childSeeds[index]` is the seed used to generate `names[index]`. */
  readonly childSeeds: readonly string[];
}

export interface NameRequest {
  readonly version: NameRequestVersion;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly quantity?: ExactNameQuantity;
  readonly grouping?: IndependentSetGrouping;
  readonly random?: RandomizationRequest;
}

export interface NameRequestInput {
  readonly version: NameRequestVersion;
  readonly criteria?: NameCriteria;
  readonly mode?: string;
  readonly quantity?: ExactNameQuantity;
  readonly grouping?: IndependentSetGrouping;
  readonly random?: RandomizationRequest;
}

export interface ResolvedNameRequest {
  readonly version: NameRequestVersion;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly quantity: ExactNameQuantity;
  readonly grouping: IndependentSetGrouping;
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
  readonly grouping: NameGroupMetadata;
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
const DEFAULT_EXACT_QUANTITY: ExactNameQuantity = { kind: 'exact', value: 1 };
const DEFAULT_INDEPENDENT_GROUPING: IndependentSetGrouping = { kind: 'independent-set' };

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

function resolveQuantity(quantity?: ExactNameQuantity): ExactNameQuantity {
  if (quantity === undefined) return DEFAULT_EXACT_QUANTITY;
  if (
    quantity.kind !== 'exact'
    || !Number.isSafeInteger(quantity.value)
    || quantity.value < 1
    || quantity.value > MAX_EXACT_NAME_QUANTITY
  ) {
    throw new RangeError(`Exact name quantity must be an integer from 1 to ${MAX_EXACT_NAME_QUANTITY}.`);
  }

  return { kind: 'exact', value: quantity.value };
}

function resolveGrouping(grouping?: IndependentSetGrouping): IndependentSetGrouping {
  if (grouping === undefined) return DEFAULT_INDEPENDENT_GROUPING;
  if (grouping.kind !== 'independent-set') {
    throw new RangeError('Name grouping must be an independent set.');
  }

  return DEFAULT_INDEPENDENT_GROUPING;
}

export function deriveNameChildSeed(parentSeed: string, index: number): string {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new RangeError('Name child-seed index must be a non-negative safe integer.');
  }

  return index === 0 ? parentSeed : `${parentSeed}:name-request-v1:child:${index}`;
}

export function resolveNameRequest(request: NameRequestInput): NameRequestResolution {
  const random = resolveRandomization(request.random);
  const resolvedRequest: ResolvedNameRequest = {
    version: 1,
    criteria: normalizeNameCriteria(request.criteria),
    ...(request.mode === undefined ? {} : { mode: request.mode }),
    quantity: resolveQuantity(request.quantity),
    grouping: resolveGrouping(request.grouping),
    random,
  };

  return { request: resolvedRequest, random };
}
