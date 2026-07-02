import { describe, expect, it } from 'vitest';
import type { SegmentSequence, SegmentSyllable, SoundCandidate } from './soundGenerator';
import type { NameIdentity } from './types';
import { createAuditionPhonology, renderAuditionCue, renderBrowserAuditionCue, renderIdentityAuditionPhrase } from './audition';

function fixtureSyllable(syllable: Omit<SegmentSyllable, 'stress' | 'stressSource'>): SegmentSyllable {
  return {
    ...syllable,
    stress: 'unspecified',
    stressSource: 'unspecified',
  };
}

function fixtureSequence(): SegmentSequence {
  return {
    contract: 'SegmentSequence',
    version: 1,
    id: 'segment-sequence:test:aw-r-eh-l-i-ow-n',
    profileId: 'sound-profile:test',
    segments: ['aw', 'r', 'eh', 'l', 'i', 'ow', 'n'],
    syllables: [
      fixtureSyllable({
        start: 0,
        end: 2,
        onset: [],
        nucleus: [0],
        coda: [1],
        shape: 'CVL',
        weight: 'heavy',
        sonorityProfile: 'falling',
      }),
      fixtureSyllable({
        start: 2,
        end: 4,
        onset: [],
        nucleus: [2],
        coda: [3],
        shape: 'CVL',
        weight: 'heavy',
        sonorityProfile: 'falling',
      }),
      fixtureSyllable({
        start: 4,
        end: 7,
        onset: [],
        nucleus: [4],
        coda: [6],
        shape: 'CVC',
        weight: 'heavy',
        sonorityProfile: 'complex',
      }),
    ],
  };
}

function fixturePlaceSequence(): SegmentSequence {
  return {
    contract: 'SegmentSequence',
    version: 1,
    id: 'segment-sequence:test:r-eh-l-m-a-r',
    profileId: 'sound-profile:test',
    segments: ['r', 'eh', 'l', 'm', 'a', 'r'],
    syllables: [
      fixtureSyllable({
        start: 0,
        end: 3,
        onset: [0],
        nucleus: [1],
        coda: [2],
        shape: 'CVL',
        weight: 'heavy',
        sonorityProfile: 'rise-fall',
      }),
      fixtureSyllable({
        start: 3,
        end: 6,
        onset: [3],
        nucleus: [4],
        coda: [5],
        shape: 'CVC',
        weight: 'heavy',
        sonorityProfile: 'rise-fall',
      }),
    ],
  };
}

function fixtureSound(id: string, name: string, sequence: SegmentSequence): SoundCandidate {
  return {
    contract: 'SoundCandidate',
    version: 1,
    id,
    profileId: sequence.profileId,
    cadence: 'balanced',
    sequence,
    transcription: `/${name.toLowerCase()}/`,
  };
}

function fixtureIdentity(): NameIdentity {
  return {
    displayName: 'Aurelion the Ashen of Relmar',
    format: {
      id: 'format:epithet-place',
      kind: 'epithet-place',
      label: 'Epithet/place-style name',
    },
    parts: [
      { id: 'given-name:given', role: 'given', value: 'Aurelion', sourceNameId: 'given-name', sourceName: 'Aurelion' },
      { id: 'given-name:epithet', role: 'epithet', value: 'the Ashen', sourceNameId: 'given-name', sourceName: 'Aurelion' },
      { id: 'place-name:place', role: 'place', value: 'Relmar', sourceNameId: 'place-name', sourceName: 'Relmar' },
    ],
    phraseParts: [
      { kind: 'part', partId: 'given-name:given', role: 'given' },
      { kind: 'part', partId: 'given-name:epithet', role: 'epithet' },
      { kind: 'literal', value: 'of' },
      { kind: 'part', partId: 'place-name:place', role: 'place' },
    ],
  };
}

function fixtureRepeatedIdentity(): NameIdentity {
  return {
    displayName: 'Aurelion, Aurelion of Relmar',
    format: {
      id: 'format:duplicate-given-place',
      kind: 'epithet-place',
      label: 'Duplicate given + place test',
    },
    parts: [
      { id: 'given-name:given', role: 'given', value: 'Aurelion', sourceNameId: 'given-name', sourceName: 'Aurelion' },
      { id: 'place-name:place', role: 'place', value: 'Relmar', sourceNameId: 'place-name', sourceName: 'Relmar' },
    ],
    phraseParts: [
      { kind: 'part', partId: 'given-name:given', role: 'given' },
      { kind: 'literal', value: ',' },
      { kind: 'part', partId: 'given-name:given', role: 'given' },
      { kind: 'literal', value: 'of' },
      { kind: 'part', partId: 'place-name:place', role: 'place' },
    ],
  };
}

describe('audition cue rendering', () => {
  it('builds audition phonology from a segment sequence before renderer projection', () => {
    const phonology = createAuditionPhonology(fixtureSequence());

    expect(phonology.contract).toBe('AuditionPhonology');
    expect(phonology.version).toBe(1);
    expect(phonology.source).toBe('sound-sequence');
    expect(phonology.sequenceId).toBe('segment-sequence:test:aw-r-eh-l-i-ow-n');
    expect(phonology.profileId).toBe('sound-profile:test');
    expect(phonology.syllables).toHaveLength(3);
    expect(phonology.syllables.map((syllable) => syllable.stress)).toEqual(['unstressed', 'primary', 'unstressed']);
    expect(phonology.syllables.map((syllable) => syllable.stressSource)).toEqual(['fallback', 'fallback', 'fallback']);
    expect(phonology.syllables.map((syllable) => syllable.weight)).toEqual(['heavy', 'heavy', 'heavy']);
    expect(phonology.syllables.map((syllable) => syllable.sonorityProfile)).toEqual(['falling', 'falling', 'complex']);
    expect(phonology.syllables.map((syllable) => syllable.segments)).toEqual([
      ['aw', 'r'],
      ['eh', 'l'],
      ['i', 'ow', 'n'],
    ]);
    expect(phonology.syllables[0]?.nucleus).toEqual(['aw']);
    expect(phonology.syllables[0]?.coda).toEqual(['r']);
  });

  it('preserves modeled stress instead of applying fallback stress', () => {
    const sequence = fixtureSequence();
    const firstSyllable = sequence.syllables[0];
    expect(firstSyllable).toBeDefined();
    if (!firstSyllable) throw new Error('Expected first fixture syllable.');

    const modeledSyllable: SegmentSyllable = {
      ...firstSyllable,
      stress: 'primary',
      stressSource: 'sequence',
    };
    const phonology = createAuditionPhonology({
      ...sequence,
      syllables: [modeledSyllable, ...sequence.syllables.slice(1)],
    });

    expect(phonology.syllables[0]).toMatchObject({
      stress: 'primary',
      stressSource: 'sequence',
    });
    expect(phonology.syllables[1]).toMatchObject({
      stress: 'primary',
      stressSource: 'fallback',
    });
  });

  it('renders separate browser speech and human guide text from audition phonology', () => {
    const phonology = createAuditionPhonology(fixtureSequence());
    const cue = renderBrowserAuditionCue(phonology);

    expect(cue.contract).toBe('BrowserAuditionCue');
    expect(cue.version).toBe(1);
    expect(cue.source).toBe('sound-sequence');
    expect(cue.sequenceId).toBe('segment-sequence:test:aw-r-eh-l-i-ow-n');
    expect(cue.profileId).toBe('sound-profile:test');
    expect(cue.syllableText).toEqual(['owr', 'ehl', 'eeohn']);
    expect(cue.guideSyllables).toEqual(['owr', 'EHL', 'ee-oh-n']);
    expect(cue.speechText).toBe('owr ehl eeohn');
    expect(cue.displayText).toBe('owr · EHL · ee-oh-n');
  });

  it('renders a composed name audition cue from a segment sequence', () => {
    const cue = renderAuditionCue(fixtureSequence());

    expect(cue.contract).toBe('NameAuditionCue');
    expect(cue.phonology.contract).toBe('AuditionPhonology');
    expect(cue.syllableText).toEqual(['owr', 'ehl', 'eeohn']);
    expect(cue.guideSyllables).toEqual(['owr', 'EHL', 'ee-oh-n']);
    expect(cue.speechText).toBe('owr ehl eeohn');
    expect(cue.displayText).toBe('owr · EHL · ee-oh-n');
  });

  it('renders phrase-level audition from materialized identity phrase parts without inventing lexical sound', () => {
    const phrase = renderIdentityAuditionPhrase(fixtureIdentity(), [
      { id: 'given-name', name: 'Aurelion', sound: fixtureSound('sound-candidate:given', 'Aurelion', fixtureSequence()) },
      { id: 'place-name', name: 'Relmar', sound: fixtureSound('sound-candidate:place', 'Relmar', fixturePlaceSequence()) },
    ]);

    expect(phrase).toMatchObject({
      contract: 'IdentityAuditionPhrase',
      version: 1,
      source: 'name-identity',
      formatId: 'format:epithet-place',
      formatKind: 'epithet-place',
      identityText: 'Aurelion the Ashen of Relmar',
      speechText: 'owr ehl eeohn the Ashen of rehl mahr',
      displayText: 'owr · EHL · ee-oh-n the Ashen of REHL · mahr',
    });
    expect(phrase.parts.map((part) => [part.kind, part.role, part.value, part.speechSource, part.displaySource])).toEqual([
      ['sound', 'given', 'Aurelion', 'generated-sound', 'generated-sound'],
      ['text', 'epithet', 'the Ashen', 'identity-text', 'identity-text'],
      ['literal', 'literal', 'of', 'format-literal', 'format-literal'],
      ['sound', 'place', 'Relmar', 'generated-sound', 'generated-sound'],
    ]);
    expect(phrase.parts[0]).toMatchObject({
      kind: 'sound',
      sourceNameId: 'given-name',
      sourceName: 'Aurelion',
    });
    expect(phrase.parts[1]).toMatchObject({
      kind: 'text',
      sourceNameId: 'given-name',
      sourceName: 'Aurelion',
    });
  });

  it('uses materialized punctuation and repeated phrase references without parsing format patterns', () => {
    const phrase = renderIdentityAuditionPhrase(fixtureRepeatedIdentity(), [
      { id: 'given-name', name: 'Aurelion', sound: fixtureSound('sound-candidate:given', 'Aurelion', fixtureSequence()) },
      { id: 'place-name', name: 'Relmar', sound: fixtureSound('sound-candidate:place', 'Relmar', fixturePlaceSequence()) },
    ]);

    expect(phrase.speechText).toBe('owr ehl eeohn, owr ehl eeohn of rehl mahr');
    expect(phrase.displayText).toBe('owr · EHL · ee-oh-n, owr · EHL · ee-oh-n of REHL · mahr');
    expect(phrase.parts.map((part) => [part.kind, part.role, part.value])).toEqual([
      ['sound', 'given', 'Aurelion'],
      ['literal', 'literal', ','],
      ['sound', 'given', 'Aurelion'],
      ['literal', 'literal', 'of'],
      ['sound', 'place', 'Relmar'],
    ]);
  });

  it('does not require displayed spelling or GeneratedName data', () => {
    const sequence = fixtureSequence();
    const cue = renderAuditionCue(sequence);

    expect(Object.keys(cue).sort()).toEqual([
      'contract',
      'displayText',
      'guideSyllables',
      'phonology',
      'profileId',
      'sequenceId',
      'source',
      'speechText',
      'syllableText',
      'version',
    ]);
  });
});
