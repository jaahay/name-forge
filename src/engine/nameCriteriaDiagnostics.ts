import type { NameCriteria, NameCriteriaClause, NameCriteriaFamily } from './nameCriteria';
import type { NameDiagnostic, NameDiagnosticCode } from './nameRequest';

export type CriteriaSupportStatus = 'supported' | 'partially-supported' | 'unsupported';

interface CriteriaSupportClassification {
  readonly clause: NameCriteriaClause;
  readonly status: CriteriaSupportStatus;
}

const PARTIALLY_SUPPORTED_FAMILIES = new Set<NameCriteriaFamily>([
  'sound',
  'shape',
  'register',
  'spelling',
]);

const SUPPORTED_SINGULAR_TARGETS = new Set([
  'single-name',
  'singular-name',
  'one-name',
  'one-artifact',
  'names.length:1',
]);

function normalizedTarget(target: string): string {
  return target.trim().toLowerCase();
}

function diagnosticId(code: NameDiagnosticCode, clause: NameCriteriaClause, index: number): string {
  const stableClauseId = clause.id.trim() || `${clause.family}-${index + 1}`;
  return `${code}:${stableClauseId}`;
}

function clauseLabel(clause: NameCriteriaClause): string {
  return `${clause.family}:${clause.polarity}:${clause.target}`;
}

function classifyCriteriaClause(clause: NameCriteriaClause): CriteriaSupportClassification {
  if (
    clause.family === 'practical'
    && clause.polarity === 'require'
    && SUPPORTED_SINGULAR_TARGETS.has(normalizedTarget(clause.target))
  ) {
    return { clause, status: 'supported' };
  }

  if (PARTIALLY_SUPPORTED_FAMILIES.has(clause.family)) {
    return { clause, status: 'partially-supported' };
  }

  return { clause, status: 'unsupported' };
}

function partiallyImplementedDiagnostic(clause: NameCriteriaClause, index: number): NameDiagnostic {
  return {
    id: diagnosticId('criteria_partially_implemented', clause, index),
    code: 'criteria_partially_implemented',
    kind: 'partially-implemented-criteria',
    severity: 'warning',
    message: `Criterion ${clause.id} (${clauseLabel(clause)}) is accepted, but target-specific ${clause.family} criteria mapping is not implemented yet. The v1 adapter keeps using neutral current-generator settings for this family.`,
    clauseIds: [clause.id],
  };
}

function unsupportedDiagnostic(clause: NameCriteriaClause, index: number): NameDiagnostic {
  return {
    id: diagnosticId('criteria_not_implemented', clause, index),
    code: 'criteria_not_implemented',
    kind: 'unsupported-criteria',
    severity: 'warning',
    message: `Criterion ${clause.id} (${clauseLabel(clause)}) is accepted but is not implemented by the v1 adapter yet. Generation continues with neutral best-effort fallback settings.`,
    clauseIds: [clause.id],
  };
}

function fallbackDiagnostic(clauseIds: readonly string[]): NameDiagnostic {
  return {
    id: 'fallback_used:criteria',
    code: 'fallback_used',
    kind: 'fallback-used',
    severity: 'info',
    message: 'One or more criteria are diagnostic-only in the v1 adapter, so generation used neutral best-effort settings and still returned one artifact.',
    clauseIds,
  };
}

export function diagnosticsForNameCriteria(criteria: NameCriteria): readonly NameDiagnostic[] {
  const criteriaDiagnostics = criteria.clauses.flatMap((clause, index): readonly NameDiagnostic[] => {
    const classification = classifyCriteriaClause(clause);

    if (classification.status === 'supported') {
      return [];
    }

    if (classification.status === 'partially-supported') {
      return [partiallyImplementedDiagnostic(clause, index)];
    }

    return [unsupportedDiagnostic(clause, index)];
  });

  if (criteriaDiagnostics.length === 0) {
    return [];
  }

  const diagnosticClauseIds = criteriaDiagnostics.flatMap((diagnostic) => diagnostic.clauseIds ?? []);
  return [...criteriaDiagnostics, fallbackDiagnostic(diagnosticClauseIds)];
}
