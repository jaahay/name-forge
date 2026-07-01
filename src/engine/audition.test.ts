import { describe, expect, it } from 'vitest';
import type { SegmentSequence } from './soundGenerator';
import { createAuditionPhonology, renderAuditionCue, renderBrowserAuditionCue } from './audition';

function fixtureSequence(): SegmentSequence {
  return {
    contract: 'SegmentSequence',
    version: 1,
    id: 'segment-sequence:test:aw-r-eh-l-i-ow-n',
    profileId: 'sound-profile:test',
    segments: ['aw', 'r', 'eh', 'l', 'i', 'ow', 'n'],
    syllables: [
      { start: 0, end: 2, onset: [], nucleus: [0], coda: [1], shape: 'CVL' },
      { start: 2, end: 4, onset: [], nucleus: [2], coda: [3], shape: 'CVL' },
      { start: 4, end: 7, onset: [], nucleus: [4], coda: [6], shape: 'CVC' },
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
    expect(phonology.syllables.map((syllable) => syllable.segments)).toEqual([
      ['aw', 'r'],
      ['eh', 'l'],
      ['i', 'ow', 'n'],
    ]);
    expect(phonology.syllables[0]?.nucleus).toEqual(['aw']);
    expect(phonology.syllables[0]?.coda).toEqual(['r']);
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
