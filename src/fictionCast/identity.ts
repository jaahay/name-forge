import { selectFromOptions } from '../engine/deterministicSelection';
import type { GeneratedName } from '../engine/types';
import {
  componentMaterializationSeed,
  type FictionCastIdentityMaterializationContext,
} from './identityDeterminism';
import type { MaterializedNameFormatKind } from './identityFormat';
import {
  fictionCastEpithetLexemes,
  fictionCastTitleLexemes,
  type FictionCastIdentityLexeme,
} from './identityLexicon';
import type {
  FictionCastDerivedIdentityComponent,
  FictionCastGeneratedIdentityComponent,
  FictionCastGeneratedIdentityRole,
  FictionCastIdentityComponent,
  FictionCastIdentityPhrasePart,
  FictionCastIdentityStructure,
  FictionCastLexicalIdentityComponent,
  FictionCastLexicalIdentityRole,
  FictionCastMaterializedIdentity,
} from './identityTypes';

const TITLE_INVENTORY_ID = 'fiction-cast:titles:v1';
const EPITHET_INVENTORY_ID = 'fiction-cast:epithets:v1';

const formatRules: Record<MaterializedNameFormatKind, FictionCastIdentityStructure> = {
  'given-only': { id: 'format:given-only', version: 1, kind: 'given-only', label: 'Given name only' },
  'given-family': { id: 'format:given-family', version: 1, kind: 'given-family', label: 'Given + family name' },
  'given-additional-family': { id: 'format:given-additional-family', version: 1, kind: 'given-additional-family', label: 'Given + additional name + family' },
  'initials-family': { id: 'format:initials-family', version: 1, kind: 'initials-family', label: 'Initials + family name' },
  'title-name': { id: 'format:title-name', version: 1, kind: 'title-name', label: 'Title + name' },
  'epithet-place': { id: 'format:epithet-place', version: 1, kind: 'epithet-place', label: 'Epithet/place-style name' },
};

export interface FictionCastIdentityGeneratedInputs {
  readonly primaryPersonal: GeneratedName;
  readonly additionalPersonal?: readonly GeneratedName[];
  readonly family?: GeneratedName;
  readonly place?: GeneratedName;
}

export function identityStructureForFormat(format: MaterializedNameFormatKind): FictionCastIdentityStructure {
  return formatRules[format];
}

export function requiresSupportingName(format: MaterializedNameFormatKind): boolean {
  return format === 'given-family'
    || format === 'given-additional-family'
    || format === 'initials-family'
    || format === 'epithet-place';
}

function createGeneratedComponent(
  id: string,
  role: FictionCastGeneratedIdentityRole,
  generatedName: GeneratedName,
): FictionCastGeneratedIdentityComponent {
  return {
    id,
    kind: 'generated',
    role,
    value: generatedName.name,
    generatedName,
  };
}

function createLexicalComponent(
  id: string,
  role: FictionCastLexicalIdentityRole,
  lexeme: FictionCastIdentityLexeme,
  inventoryId: string,
): FictionCastLexicalIdentityComponent {
  return {
    id,
    kind: 'lexical',
    role,
    value: lexeme.text,
    lexemeId: lexeme.id,
    inventoryId,
  };
}

function createInitialComponent(
  source: FictionCastGeneratedIdentityComponent,
): FictionCastDerivedIdentityComponent {
  return {
    id: 'component:given:0:initials',
    kind: 'derived',
    role: 'given',
    value: initialsFor(source.value),
    derivation: {
      ruleId: 'initials',
      sourceComponentIds: [source.id],
    },
  };
}

function phrasePart(component: FictionCastIdentityComponent): FictionCastIdentityPhrasePart {
  return { kind: 'component', componentId: component.id };
}

function literalPart(value: string): FictionCastIdentityPhrasePart {
  return { kind: 'literal', value };
}

function createIdentity(
  displayName: string,
  format: FictionCastIdentityStructure,
  components: FictionCastIdentityComponent[],
  phraseParts: FictionCastIdentityPhrasePart[],
): FictionCastMaterializedIdentity {
  return {
    displayName,
    format,
    components,
    phraseParts,
  };
}

function pickLexeme(
  options: readonly FictionCastIdentityLexeme[],
  seed: string,
  role: FictionCastIdentityLexeme['kind'],
): FictionCastIdentityLexeme {
  const matchingOptions = options.filter((option) => option.kind === role);

  if (matchingOptions.length === 0) {
    throw new Error(`Fiction Cast has no ${role} lexemes available for identity construction.`);
  }

  return selectFromOptions(matchingOptions, seed);
}

function initialsFor(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}.`)
    .join(' ');
}

export function createNameIdentity(
  inputs: FictionCastIdentityGeneratedInputs,
  format: MaterializedNameFormatKind,
  materializationContext: FictionCastIdentityMaterializationContext,
): FictionCastMaterializedIdentity {
  const rule = identityStructureForFormat(format);
  const givenComponent = createGeneratedComponent('component:given:0', 'given', inputs.primaryPersonal);
  const additionalPersonalComponents = (inputs.additionalPersonal ?? []).map((generatedName, index) => (
    createGeneratedComponent(`component:additional-personal:${index}`, 'additional-personal', generatedName)
  ));
  const familyComponent = inputs.family
    ? createGeneratedComponent('component:family:0', 'family', inputs.family)
    : undefined;
  const initialComponent = createInitialComponent(givenComponent);

  if (format === 'given-only') {
    return createIdentity(givenComponent.value, rule, [givenComponent], [phrasePart(givenComponent)]);
  }

  if (format === 'title-name') {
    const titleLexeme = pickLexeme(
      fictionCastTitleLexemes,
      componentMaterializationSeed(materializationContext, rule, 'component:title:0'),
      'title',
    );
    const titleComponent = createLexicalComponent('component:title:0', 'title', titleLexeme, TITLE_INVENTORY_ID);
    return createIdentity(
      `${titleComponent.value} ${givenComponent.value}`,
      rule,
      [titleComponent, givenComponent],
      [phrasePart(titleComponent), phrasePart(givenComponent)],
    );
  }

  if (format === 'epithet-place') {
    const epithetLexeme = pickLexeme(
      fictionCastEpithetLexemes,
      componentMaterializationSeed(materializationContext, rule, 'component:epithet:0'),
      'epithet',
    );
    const epithetComponent = createLexicalComponent('component:epithet:0', 'epithet', epithetLexeme, EPITHET_INVENTORY_ID);
    const placeSource = inputs.place ?? inputs.primaryPersonal;
    const placeComponent = createGeneratedComponent('component:place:0', 'place', placeSource);
    return createIdentity(
      `${givenComponent.value} ${epithetComponent.value} of ${placeComponent.value}`,
      rule,
      [givenComponent, epithetComponent, placeComponent],
      [phrasePart(givenComponent), phrasePart(epithetComponent), literalPart('of'), phrasePart(placeComponent)],
    );
  }

  const safeFamilyComponent = familyComponent ?? createGeneratedComponent('component:family:0', 'family', inputs.primaryPersonal);

  if (format === 'given-additional-family') {
    if (additionalPersonalComponents.length !== 1) {
      throw new Error('Given + additional name + family requires exactly one additional personal name.');
    }
    const [additionalPersonalComponent] = additionalPersonalComponents;
    if (!additionalPersonalComponent) throw new Error('Expected one additional personal component.');
    return createIdentity(
      `${givenComponent.value} ${additionalPersonalComponent.value} ${safeFamilyComponent.value}`,
      rule,
      [givenComponent, additionalPersonalComponent, safeFamilyComponent],
      [phrasePart(givenComponent), phrasePart(additionalPersonalComponent), phrasePart(safeFamilyComponent)],
    );
  }

  if (format === 'initials-family') {
    return createIdentity(
      `${initialComponent.value} ${safeFamilyComponent.value}`,
      rule,
      [givenComponent, initialComponent, safeFamilyComponent],
      [phrasePart(initialComponent), phrasePart(safeFamilyComponent)],
    );
  }

  return createIdentity(
    `${givenComponent.value} ${safeFamilyComponent.value}`,
    rule,
    [givenComponent, safeFamilyComponent],
    [phrasePart(givenComponent), phrasePart(safeFamilyComponent)],
  );
}
