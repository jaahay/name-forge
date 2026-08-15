import type { GeneratedName } from '../engine/types';
import {
  generateSemanticName,
  type SemanticNameOptions,
  type SemanticNamePreferences,
} from './semanticName';

export type FamilyNamePreferences = SemanticNamePreferences;
export type GenerateFamilyNameOptions = SemanticNameOptions<FamilyNamePreferences>;

/**
 * Generates one family name through the shared singular name-generation primitive.
 *
 * Family-name semantics are first-class at the callback boundary even while the
 * current generation mechanics remain behavior-equivalent to generic naming.
 */
export function generateFamilyName(options: GenerateFamilyNameOptions): GeneratedName {
  return generateSemanticName(options);
}
