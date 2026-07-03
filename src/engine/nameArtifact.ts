import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
import type { RankedSpellingCandidate } from './spellingGenerator';

export interface NameArtifact {
  readonly id: string;
  readonly displayText: string;
  readonly soundProfile?: SoundProfile;
  readonly sound?: SoundCandidate;
  readonly spelling?: RankedSpellingCandidate;
  readonly spellingCandidates?: readonly RankedSpellingCandidate[];
}
