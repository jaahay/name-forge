import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
import type { RankedSpellingCandidate } from './spellingGenerator';
import type {
  CastRoleAssignment,
  GeneratedName,
  NameIdentity,
  NameScores,
  NameSilhouette,
  NameVariant,
  ReadabilityDiagnostic,
  RoleInfluenceMetadata,
} from './types';

export interface NameArtifact {
  readonly id: string;
  readonly displayText: string;
  readonly soundProfile?: SoundProfile;
  readonly sound?: SoundCandidate;
  readonly spelling?: RankedSpellingCandidate;
  readonly spellingCandidates?: readonly RankedSpellingCandidate[];
  readonly silhouette?: NameSilhouette;
  readonly scores?: NameScores;
  readonly variants?: readonly NameVariant[];
  readonly readabilityDiagnostics?: readonly ReadabilityDiagnostic[];
  readonly identity?: NameIdentity;
  readonly role?: CastRoleAssignment;
  readonly roleInfluence?: RoleInfluenceMetadata;
}

export function toNameArtifact(generatedName: GeneratedName): NameArtifact {
  return {
    id: generatedName.id,
    displayText: generatedName.identity?.displayName ?? generatedName.name,
    soundProfile: generatedName.soundProfile,
    sound: generatedName.sound,
    spelling: generatedName.spelling,
    spellingCandidates: generatedName.spellingCandidates,
    silhouette: generatedName.silhouette,
    scores: generatedName.scores,
    variants: generatedName.variants,
    readabilityDiagnostics: generatedName.readabilityDiagnostics,
    ...(generatedName.identity === undefined ? {} : { identity: generatedName.identity }),
    ...(generatedName.role === undefined ? {} : { role: generatedName.role }),
    ...(generatedName.roleInfluence === undefined ? {} : { roleInfluence: generatedName.roleInfluence }),
  };
}
