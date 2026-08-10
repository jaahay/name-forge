export type FictionCastIdentityLexemeKind = 'title' | 'epithet';

export interface FictionCastIdentityLexeme {
  readonly id: string;
  readonly kind: FictionCastIdentityLexemeKind;
  readonly text: string;
}

export const fictionCastTitleLexemes: readonly FictionCastIdentityLexeme[] = [
  { id: 'title:archivist', kind: 'title', text: 'Archivist' },
  { id: 'title:captain', kind: 'title', text: 'Captain' },
  { id: 'title:chronicler', kind: 'title', text: 'Chronicler' },
  { id: 'title:doctor', kind: 'title', text: 'Doctor' },
  { id: 'title:keeper', kind: 'title', text: 'Keeper' },
  { id: 'title:marshal', kind: 'title', text: 'Marshal' },
  { id: 'title:professor', kind: 'title', text: 'Professor' },
  { id: 'title:warden', kind: 'title', text: 'Warden' },
];

export const fictionCastEpithetLexemes: readonly FictionCastIdentityLexeme[] = [
  { id: 'epithet:the-ashen', kind: 'epithet', text: 'the Ashen' },
  { id: 'epithet:the-bright', kind: 'epithet', text: 'the Bright' },
  { id: 'epithet:the-far', kind: 'epithet', text: 'the Far' },
  { id: 'epithet:the-kindled', kind: 'epithet', text: 'the Kindled' },
  { id: 'epithet:the-riverwise', kind: 'epithet', text: 'the Riverwise' },
  { id: 'epithet:the-silver', kind: 'epithet', text: 'the Silver' },
  { id: 'epithet:the-starlit', kind: 'epithet', text: 'the Starlit' },
  { id: 'epithet:the-wry', kind: 'epithet', text: 'the Wry' },
];
