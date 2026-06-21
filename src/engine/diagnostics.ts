import type { GeneratedName, ReadabilityDiagnostic } from './types';

const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

function lettersOnly(value: string): string {
  return value.toLowerCase().replace(/[^a-z]+/g, '');
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function longestRun(value: string, predicate: (letter: string) => boolean): number {
  let current = 0;
  let longest = 0;
  for (const letter of lettersOnly(value)) {
    if (predicate(letter)) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

function repeatedLetterCount(value: string): number {
  const letters = lettersOnly(value);
  let count = 0;
  for (let index = 1; index < letters.length; index += 1) {
    if (letters[index] === letters[index - 1]) count += 1;
  }
  return count;
}

function hasVisualMisread(value: string): boolean {
  const compact = lettersOnly(value);
  return /rn|vv|ii|ll|mn|nm/.test(compact);
}

export function diagnoseNameReadability(name: string): ReadabilityDiagnostic[] {
  const diagnostics: ReadabilityDiagnostic[] = [];
  const compact = lettersOnly(name);
  const words = wordCount(name);
  const consonantRun = longestRun(name, (letter) => !vowels.has(letter));
  const vowelRun = longestRun(name, (letter) => vowels.has(letter));
  const repeats = repeatedLetterCount(name);

  if (compact.length > 28 || words > 4) {
    diagnostics.push({
      id: 'length-friction',
      scope: 'name',
      severity: compact.length > 36 || words > 5 ? 'warning' : 'notice',
      label: 'Long read',
      detail: 'This name is long enough that users may need a second pass to read it aloud.',
    });
  }

  if (consonantRun >= 4) {
    diagnostics.push({
      id: 'consonant-cluster',
      scope: 'name',
      severity: consonantRun >= 5 ? 'warning' : 'notice',
      label: 'Dense consonants',
      detail: `The longest consonant cluster is ${consonantRun} letters, which can slow table reading.`,
    });
  }

  if (vowelRun >= 4) {
    diagnostics.push({
      id: 'vowel-cluster',
      scope: 'name',
      severity: vowelRun >= 5 ? 'warning' : 'notice',
      label: 'Dense vowels',
      detail: `The longest vowel cluster is ${vowelRun} letters, which can invite multiple readings.`,
    });
  }

  if (repeats >= 2) {
    diagnostics.push({
      id: 'repeated-letters',
      scope: 'name',
      severity: repeats >= 4 ? 'warning' : 'notice',
      label: 'Repeated letters',
      detail: 'Repeated adjacent letters may make the spelling feel less immediate.',
    });
  }

  if (hasVisualMisread(name)) {
    diagnostics.push({
      id: 'visual-misread',
      scope: 'name',
      severity: 'notice',
      label: 'Possible visual misread',
      detail: 'Letter pairs such as rn, ll, ii, or vv can be mistaken at a glance.',
    });
  }

  return diagnostics;
}

export function castReadabilityDiagnostics(names: GeneratedName[]): ReadabilityDiagnostic[] {
  const issueCount = names.reduce((sum, name) => sum + name.readabilityDiagnostics.length, 0);
  const warningCount = names.reduce((sum, name) => sum + name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length, 0);
  const diagnostics: ReadabilityDiagnostic[] = [];

  if (warningCount > 0) {
    diagnostics.push({
      id: 'cast-readability-warnings',
      scope: 'cast',
      severity: 'warning',
      label: 'Readability warnings',
      detail: `${warningCount} high-friction read note${warningCount === 1 ? '' : 's'} appear across the cast.`,
    });
  } else if (issueCount > Math.max(2, Math.floor(names.length / 2))) {
    diagnostics.push({
      id: 'cast-readability-notices',
      scope: 'cast',
      severity: 'notice',
      label: 'Readability notes',
      detail: `${issueCount} light read note${issueCount === 1 ? '' : 's'} appear across the cast.`,
    });
  }

  return diagnostics;
}

export function readabilitySummary(names: GeneratedName[]): string {
  const issueCount = names.reduce((sum, name) => sum + name.readabilityDiagnostics.length, 0);
  const warningCount = names.reduce((sum, name) => sum + name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length, 0);

  if (warningCount > 0) return `${warningCount} high-friction readability note${warningCount === 1 ? '' : 's'} need review before table use.`;
  if (issueCount > 0) return `${issueCount} light readability note${issueCount === 1 ? '' : 's'} are present; no canonical pronunciation is implied.`;
  return 'The cast has no readability friction notes under the current deterministic checks.';
}
