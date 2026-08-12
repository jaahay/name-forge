import type { GenerationSettings, NameGenerationSettings } from '../engine/types';

export function toNameGenerationSettings(settings: GenerationSettings | NameGenerationSettings): NameGenerationSettings {
  return {
    novelty: settings.novelty,
    pronounceability: settings.pronounceability,
    memorability: settings.memorability,
    culturalAnchoring: settings.culturalAnchoring,
    orthographicWeirdness: settings.orthographicWeirdness,
    ...(settings.preferredTexture === undefined ? {} : { preferredTexture: settings.preferredTexture }),
    ...(settings.spellingSelectionPreference === undefined ? {} : { spellingSelectionPreference: settings.spellingSelectionPreference }),
  };
}
