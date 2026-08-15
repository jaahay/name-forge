import type { GeneratedName } from '../engine/types';
import {
  generateSemanticName,
  type SemanticNameOptions,
  type SemanticNamePreferences,
} from './semanticName';

export type PlaceNamePreferences = SemanticNamePreferences;
export type GeneratePlaceNameOptions = SemanticNameOptions<PlaceNamePreferences>;

/**
 * Generates one place name through the shared singular name-generation primitive.
 *
 * Place-name semantics are first-class at the callback boundary even while the
 * current generation mechanics remain behavior-equivalent to generic naming.
 */
export function generatePlaceName(options: GeneratePlaceNameOptions): GeneratedName {
  return generateSemanticName(options);
}
