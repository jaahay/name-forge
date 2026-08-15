import type { GeneratedName } from '../engine/types';
import {
  generateSemanticName,
  type SemanticNameOptions,
  type SemanticNamePreferences,
} from './semanticName';

export type GivenNamePreferences = SemanticNamePreferences;
export type GenerateGivenNameOptions = SemanticNameOptions<GivenNamePreferences>;

/**
 * Generates one given name through the shared singular name-generation primitive.
 *
 * The semantic callback owns the given-name contract while the shared semantic
 * invocation boundary hides source resolution, random-stream construction, and
 * generic planning representation from callers.
 */
export function generateGivenName(options: GenerateGivenNameOptions): GeneratedName {
  return generateSemanticName(options);
}
