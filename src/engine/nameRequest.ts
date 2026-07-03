import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';

export type NameRequestVersion = 1;
export type RandomizationAlgorithm = 'name-forge-v1';
export type NameDiagnosticSeverity = 'info' | 'warning';
export type NameDiagnosticKind = 'unsupported-criteria' | 'partially-implemented-criteria';

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

export interface ResolvedNameRequest {
  readonly version: NameRequestVersion;
  readonly criteria: NameCriteria;
  readonly mode?: string;
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
  readonly kind: NameDiagnosticKind;
  readonly severity: NameDiagnosticSeverity;
  readonly message: string;
  readonly clauseIds?: readonly string[];
}
