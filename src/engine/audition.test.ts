import { describe, expect, it } from 'vitest';
import type { SegmentSequence } from './soundGenerator';
import { renderAuditionCue } from './audition';

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
  it('renders a browser speech cue from a segment sequence', () => {
    const cue = renderAuditionCue(fixtureSequence());

    expect(cue.contract).toBe('NameAuditionCue');
    expect(cue.version).toBe(1);
    expect(cue.source).toBe('sound-sequence');
    expect(cue.sequenceId).toBe('segment-sequence:test:aw-r-eh-l-i-ow-n');
    expect(cue.profileId).toBe('sound-profile:test');
    expect(cue.syllableText).toEqual(['owr', 'ehl', 'eeohn']);
    expect(cue.speechText).toBe('owr ehl eeohn');
    expect(cue.displayText).toBe('owr ehl eeohn');
  });

  it('does not require displayed spelling or GeneratedName data', () => {
    const sequence = fixtureSequence();
    const cue = renderAuditionCue(sequence);

    expect(Object.keys(cue).sort()).toEqual([
      'contract',
      'displayText',
      'profileId',
      'sequenceId',
      'source',
      'speechText',
      'syllableText',
      'version',
    ]);
  });
});
