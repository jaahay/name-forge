import type { NameCriteria, NameCriteriaClause, NameCriteriaFamily } from './nameCriteria';
import type { NameDiagnostic, NameDiagnosticCode } from './nameRequest';

export type CriteriaSupportStatus = 'supported' | 'partially-supported' | 'unsupported';

const PARTIALLY_SUPPORTED_FAMILIES = new Set<NameCriteriaFamily>([
  'sound',
  'shape',
  'spelling',
]);

const SUPPORTED_SINGULAR_TARGETS = new Set([
  'single-name',
  'singular-name',
  'one-name',
  'one-artifact',
  'names.length:1',
]);

const SUPPORTED_SOUND_TARGETS = new Set([
  'soft',
  'crisp',
  'flowing',
]);

const SUPPORTED_SPELLING_TARGETS = new Set([
  'plain',
  'distinctive',
]);

const SUPPORTED_PRACTICAL_TARGETS = new Set([
  'easy-to-spell',
]);

function normalizedTarget(target: string): string {
  return target.trim().toLowerCase();
}

function stableClauseId(clause: NameCriteriaClause, index: number): string {
  return clause.id.trim() || `${clause.family}-${index + 1}`;
}

function diagnosticId(code: NameDiagnosticCode, clauseId: string): string {
  return `${code}:${clauseId}`;
}

function clauseLabel(clause: NameCriteriaClause): string {
  return `${clause.family}:${clause.polarity}:${clause.target}`;
}

function isSupportedCriteriaClause(clause: NameCriteriaClause): boolean {
  if (clause.polarity === 'avoid') {
    return false;
  }

  const target = normalizedTarget(clause.target);

  if (clause.family === 'sound') {
    return SUPPORTED_SOUND_TARGETS.has(target);
  }

  if (clause.family === 'spelling') {
    return SUPPORTED_SPELLING_TARGETS.has(target);
  }

  if (clause.family === 'practical') {
    return (
      SUPPORTED_PRACTICAL_TARGETS.has(target)
      || (clause.polarity === 'require' && SUPPORTED_SINGULAR_TARGETS.has(target))
    );
  }

  return false;
}

function classifyCriteriaClause(clause: NameCriteriaClause): CriteriaSupportStatus {
  if (isSupportedCriteriaClause(clause)) {
    return 'supported';
  }

  if (PARTIALLY_SUPPORTED_FAMILIES.has(clause.family)) {
    return 'partially-supported';
  }

  return 'unsupported';
}

function partiallyImplementedDiagnostic(clause: NameCriteriaClause, index: number): NameDiagnostic {
  const clauseId = stableClauseId(clause, index);

  return {
    id: diagnosticId('criteria_partially_implemented', clauseId),
    code: 'criteria_partially_implemented',
    kind: 'partially-implemented-criteria',
    severity: 'warning',
    message: `Criterion ${clauseId} (${clauseLabel(clause)}) is accepted, but target-specific ${clause.family} criteria mapping is not implemented yet. The v1 adapter keeps using neutral current-generator settings for this family.`,
    clauseIds: [clauseId],
  };
}

function unsupportedDiagnostic(clause: NameCriteriaClause, index: number): NameDiagnostic {
  const clauseId = stableClauseId(clause, index);

  return {
    id: diagnosticId('criteria_not_implemented', clauseId),
    code: 'criteria_not_implemented',
    kind: 'unsupported-criteria',
    severity: 'warning',
    message: `Criterion ${clauseId} (${clauseLabel(clause)}) is accepted but is not implemented by the v1 adapter yet. Generation continues with neutral best-effort fallback settings.`,
    clauseIds: [clauseId],
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
  const criteriaDiagnostics: NameDiagnostic[] = [];

  criteria.clauses.forEach((clause, index) => {
    const status = classifyCriteriaClause(clause);

    if (status === 'partially-supported') {
      criteriaDiagnostics.push(partiallyImplementedDiagnostic(clause, index));
      return;
    }

    if (status === 'unsupported') {
      criteriaDiagnostics.push(unsupportedDiagnostic(clause, index));
    }
  });

  if (criteriaDiagnostics.length === 0) {
    return [];
  }

  const diagnosticClauseIds = criteriaDiagnostics.flatMap((diagnostic) => diagnostic.clauseIds ?? []);
  return [...criteriaDiagnostics, fallbackDiagnostic(diagnosticClauseIds)];
}
