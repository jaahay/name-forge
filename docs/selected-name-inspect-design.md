# Selected-name Inspect surface design

This document records the current UI/UX direction for the Fiction cast selected-name surface. It is a design contract for upcoming implementation slices, not a record of current shipped behavior.

The core product framing is:

```text
The names are the product artifacts.
Name Forge is the service/workbench that creates, compares, inspects, preserves, and exports them.
```

The selected-name Inspect surface should therefore feel like a product-detail artifact view, not like an incidental diagnostics panel or an AI explanation feed.

## Surface hierarchy

The primary surfaces are:

```text
Configure tray
  upstream generation controls

Name card / name rail / name selector
  browsing and selection

Inspect
  selected-name artifact surface

Export
  handoff artifact
```

Cards and name selectors should help the user choose a name. Inspect should help the user understand, keep, and export the selected name.

## Configure placement and persistence

Configure belongs above the product surfaces, not as a permanent peer column. It is upstream of the names rather than equivalent to them.

Recommended behavior:

```text
First visit with no generated names:
  Configure is expanded.

After generation:
  Configure collapses into a compact run summary.

Refresh / reload / revisit with generated names present:
  Configuration values persist.
  Generated names may persist according to the app's storage policy.
  Configure remains collapsed because the names are now the primary task.

Refresh / reload / revisit with no generated names present:
  Configure opens because generation is the primary task.

Manual expansion:
  The user may reopen Configure to tune settings.
  A new generation collapses Configure again.
```

Prefer deriving default Configure openness from whether generated names exist rather than blindly persisting an `open` / `closed` flag forever.

## Wide layout

On wide screens, use a compact Configure summary over a narrow name-selection surface and a dominant Inspect artifact surface.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Name Forge                                                [About]    │
├──────────────────────────────────────────────────────────────────────┤
│ British literary fantasy · 8 names · Mixed · Classic ensemble        │
│ [Tune settings]                                      [Regenerate]   │
├───────────────────┬──────────────────────────────────────────────────┤
│ Names             │ Inspect                                          │
│                   │                                                  │
│ ┌───────────────┐ │ Edrin Vale                              [Lock]   │
│ │ Edrin Vale    │ │                                                  │
│ └───────────────┘ │ ───────────────────────────────────────────────  │
│                   │                                                  │
│ ┌───────────────┐ │ Sound                                            │
│ │ Marrow Venn   │ │ /ed.rin vayl/                         playback  │
│ └───────────────┘ │                                                  │
│                   │ ───────────────────────────────────────────────  │
│ ┌───────────────┐ │                                                  │
│ │ Osta Rel      │ │ Spelling                                         │
│ └───────────────┘ │ Edrin Vale                                       │
│                   │ Selected spelling                                │
│ ┌───────────────┐ │                                                  │
│ │ Caldrin Moss  │ │ ───────────────────────────────────────────────  │
│ └───────────────┘ │                                                  │
│                   │ Cast context                                     │
│ ┌───────────────┐ │ Mentor                                           │
│ │ Brava Holt    │ │ Light role influence                             │
│ └───────────────┘ │                                                  │
│                   │ ───────────────────────────────────────────────  │
│ ┌───────────────┐ │                                                  │
│ │ Iven Tor      │ │ Usability                                        │
│ └───────────────┘ │ Clean read                                       │
│                   │                                                  │
│                   │ ───────────────────────────────────────────────  │
│                   │                                                  │
│                   │ Actions                                          │
│                   │ [Copy name] [Copy details] [Export]              │
└───────────────────┴──────────────────────────────────────────────────┘
```

The name list is a selection rail, not a peer detail panel. Inspect should receive the majority of horizontal space because it is the selected-name artifact surface.

Recommended approximate allocation:

```text
Name rail: 220-280px
Inspect:   remaining width
```

## Narrow and mobile layout

On narrow screens, replace the rail with a name selector. Do not use a horizontal row of names.

The compact run summary and selected-name control can merge gracefully so the top of the page stays small:

```text
┌────────────────────────────────────┐
│ Name Forge                          │
├────────────────────────────────────┤
│ British literary fantasy · 8 names  │
│ Mixed · Classic ensemble            │
│ [Tune settings]        [Regenerate] │
├────────────────────────────────────┤
│ [ Edrin Vale                    ▾ ] │
│ [Previous]                  [Next]  │
├────────────────────────────────────┤
│ Inspect                             │
│                                    │
│ Edrin Vale                  [Lock] │
│                                    │
│ Sound                              │
│ /ed.rin vayl/                      │
│ playback soon                      │
│                                    │
│ Spelling                           │
│ Edrin Vale                         │
│ Selected spelling                  │
│                                    │
│ Cast context                       │
│ Mentor                             │
│ Light role influence               │
│                                    │
│ Usability                          │
│ Clean read                         │
│                                    │
│ Name notes                         │
│ Compact cadence with a clear final │
│ edge.                              │
│                                    │
│ Spelling notes                     │
│ Selected spelling keeps the sound  │
│ readable while preserving texture. │
│                                    │
│ Actions                            │
│ [Copy name]                        │
│ [Copy details]                     │
│ [Export]                           │
└────────────────────────────────────┘
```

Mobile should assume the user wants the full Inspect artifact document for the selected name. Do not add an extra `More about this name` disclosure on mobile as the default design. Vertical scrolling is expected.

## Name selector behavior

The narrow/mobile selector should include an explicit way back to the full roster view, but that option must not be modeled as a fake generated name.

Recommended visible options:

```text
All names
Edrin Vale
Marrow Venn
Osta Rel
Caldrin Moss
Brava Holt
Iven Tor
```

Recommended state model:

```ts
type NameSelectorValue =
  | { kind: 'all-names' }
  | { kind: 'name'; nameId: string };
```

Avoid:

```ts
selectedNameId = 'all-names';
```

`All names` is navigation state, not selected-name state. Inspect should never try to render `All names` as if it were a generated name.

## Previous and Next controls

Previous and Next controls are preferred on narrow/mobile layouts. They should be visible controls, not hidden gestures.

Their job is to preserve fast sequential review without requiring the user to reopen the selector for every candidate.

## Swipe gestures

Swipe left/right between names may be useful, but it should be a later progressive enhancement, not primary navigation.

Risks:

- browser back/forward gestures
- mobile OS edge gestures
- vertical scroll conflict
- text selection conflict
- interference with buttons, selects, links, and form controls
- accessibility ambiguity

If swipe is added later, constrain it:

```text
- ignore gestures that start near screen edges
- ignore gestures that start on interactive elements
- require clear horizontal intent
- do not prevent vertical scrolling until horizontal intent is obvious
- keep Previous / Next buttons and the selector as equivalent visible navigation
```

## Commentary and provenance

Default desktop Inspect should first present objective artifact information:

```text
Name
Sound
Spelling
Cast context
Usability
Actions
```

Interpretive commentary such as sound notes, spelling notes, or cast-fit notes belongs deeper than cards and quick selection surfaces.

Desktop may eventually use an optional provenance disclosure for commentary if the surface becomes too dense. Mobile should instead show the full Inspect artifact document for the selected name without requiring an additional expansion step.

Do not make cards or default selection controls explain the name back to the user. The name itself is the primary artifact.

## Implementation sequencing

Recommended slices:

1. **Documentation and design contract**: this document.
2. **Configure tray**: move Configure above the product surfaces and collapse to a run summary after generation.
3. **Selected-name layout**: introduce wide name rail plus dominant Inspect layout.
4. **Narrow/mobile selector**: replace the rail with a typed name selector, Previous / Next controls, and full-width Inspect.
5. **Optional provenance**: only after the fact-sheet Inspect surface is stable and the app can support honest commentary without overclaiming.

## Non-goals for the first implementation pass

- No audio/TTS implementation.
- No swipe gesture implementation.
- No canonical pronunciation claims.
- No generated prose in name cards.
- No fake `selectedNameId` value for `All names`.
- No desktop requirement that Configure remain permanently visible as a column.
