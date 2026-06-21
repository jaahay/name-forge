import type { BriefInfluenceMetadata, GenerationSettings, NamingBrief } from './types';
import { clamp } from './random';

const listKeys: Array<keyof Pick<NamingBrief, 'toneWords' | 'desiredAssociations' | 'avoidList' | 'hardConstraints' | 'anchorExamples'>> = [
  'toneWords',
  'desiredAssociations',
  'avoidList',
  'hardConstraints',
  'anchorExamples',
];

function normalizeText(value: string | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeList(values: string[] | undefined): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values ?? []) {
    const clean = normalizeText(value);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(clean);
  }
  return normalized;
}

function termKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function termFragments(value: string): string[] {
  return termKey(value).split(/\s+/).filter((part) => part.length >= 3);
}

function nameText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function nameLetters(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function hasNearMatch(name: string, term: string): boolean {
  const normalizedName = nameText(name);
  const compactName = nameLetters(name);
  const fragments = termFragments(term);
  if (fragments.length === 0) return false;

  return fragments.some((fragment) => {
    const compactFragment = fragment.replace(/[^a-z0-9]+/g, '');
    if (normalizedName.includes(fragment) || compactName.includes(compactFragment)) return true;
    if (compactFragment.length < 4) return false;
    return compactName.startsWith(compactFragment.slice(0, 4)) || compactName.endsWith(compactFragment.slice(-4));
  });
}

function hasAnchorEcho(name: string, anchor: string): boolean {
  const compactName = nameLetters(name);
  const compactAnchor = nameLetters(anchor);
  if (compactAnchor.length < 3) return false;
  return compactName.startsWith(compactAnchor.slice(0, 2))
    || compactName.endsWith(compactAnchor.slice(-3))
    || compactName.includes(compactAnchor.slice(0, Math.min(4, compactAnchor.length)));
}

export function normalizeNamingBrief(brief: NamingBrief | undefined): NamingBrief | undefined {
  if (!brief) return undefined;

  const normalized: NamingBrief = {
    useContext: normalizeText(brief.useContext),
    notes: normalizeText(brief.notes),
  };

  for (const key of listKeys) {
    const values = normalizeList(brief[key]);
    if (values.length > 0) normalized[key] = values;
  }

  if (!normalized.useContext) delete normalized.useContext;
  if (!normalized.notes) delete normalized.notes;

  return hasNamingBriefContent(normalized) ? normalized : undefined;
}

export function hasNamingBriefContent(brief: NamingBrief | undefined): boolean {
  if (!brief) return false;
  if (normalizeText(brief.useContext) || normalizeText(brief.notes)) return true;
  return listKeys.some((key) => normalizeList(brief[key]).length > 0);
}

export function namingBriefSummary(brief: NamingBrief | undefined): string | undefined {
  const normalized = normalizeNamingBrief(brief);
  if (!normalized) return undefined;

  const parts: string[] = [];
  if (normalized.useContext) parts.push(`Context: ${normalized.useContext}`);
  if (normalized.toneWords?.length) parts.push(`Tone: ${normalized.toneWords.join(', ')}`);
  if (normalized.desiredAssociations?.length) parts.push(`Associations: ${normalized.desiredAssociations.join(', ')}`);
  if (normalized.avoidList?.length) parts.push(`Avoid: ${normalized.avoidList.join(', ')}`);
  if (normalized.hardConstraints?.length) parts.push(`Constraints: ${normalized.hardConstraints.join(', ')}`);
  if (normalized.anchorExamples?.length) parts.push(`Anchors: ${normalized.anchorExamples.join(', ')}`);
  if (normalized.notes) parts.push(`Notes: ${normalized.notes}`);
  return parts.join(' | ');
}

export function evaluateBriefInfluence(name: string, settings: GenerationSettings): BriefInfluenceMetadata | undefined {
  const brief = normalizeNamingBrief(settings.brief);
  if (!brief) return undefined;

  const matches: string[] = [];
  const penalties: string[] = [];
  const effects: string[] = [];

  for (const term of [...(brief.toneWords ?? []), ...(brief.desiredAssociations ?? []), ...(brief.hardConstraints ?? [])]) {
    if (hasNearMatch(name, term)) matches.push(term);
  }

  for (const anchor of brief.anchorExamples ?? []) {
    if (hasAnchorEcho(name, anchor)) matches.push(`anchor echo: ${anchor}`);
  }

  for (const term of brief.avoidList ?? []) {
    if (hasNearMatch(name, term)) penalties.push(term);
  }

  if (brief.useContext) effects.push(`Brief context: ${brief.useContext}`);
  if (matches.length > 0) effects.push(`Matches brief signal: ${matches.join(', ')}`);
  if (penalties.length > 0) effects.push(`Avoid-list friction: ${penalties.join(', ')}`);
  if (matches.length === 0 && penalties.length === 0) effects.push('Brief preserved as reproducible naming context; no direct token match in this name.');

  const summary = penalties.length > 0
    ? 'Conflicts with part of the brief.'
    : matches.length > 0
      ? 'Reflects part of the brief.'
      : 'Carries the brief as generation context.';

  return { summary, effects, matches, penalties };
}

export function briefFitScore(name: string, settings: GenerationSettings): number {
  const influence = evaluateBriefInfluence(name, settings);
  if (!influence) return 0.72;

  const matchBonus = Math.min(0.22, influence.matches.length * 0.07);
  const penalty = Math.min(0.42, influence.penalties.length * 0.24);
  const contextBonus = settings.brief?.useContext ? 0.03 : 0;
  return clamp(0.66 + matchBonus + contextBonus - penalty);
}
