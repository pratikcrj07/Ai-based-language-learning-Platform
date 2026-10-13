# Polli Design System

**Version:** 1.0  
**Platform:** Expo / React Native / NativeWind  
**Visual direction:** Calm, encouraging, clear, and study-focused.

Polli uses solid color, generous spacing, and direct feedback to reduce cognitive load during practice. Gradients are not part of this system: do not use `LinearGradient`, multi-stop fills, or color fades for surfaces, controls, charts, illustrations, or state feedback.

## Principles

1. **Keep the learner oriented.** Every learning screen shows where the learner is, what they need to do, and how to continue.
2. **Make feedback unmistakable.** Correct, retry, and error states combine a semantic color, clear text, and an icon or label; color alone is never the signal.
3. **Use one visual priority per screen.** The primary action is indigo. Supporting actions use outline or text treatment.
4. **Prefer quiet surfaces.** White and slate surfaces let learning content and answer choices carry attention.
5. **Make controls easy to tap.** Interactive targets are at least 44 × 44 points.

## Foundations

### Color

All token values are solid colors. NativeWind names are available in `tailwind.config.js`; TypeScript values are in `constants/theme.ts`.

| Token | Hex | Use |
| --- | --- | --- |
| `brand` / `primary` | `#5E5CE6` | Primary actions, selected controls, progress |
| `brand-strong` | `#4947C8` | Pressed primary controls, high-emphasis links |
| `brand-soft` | `#EEEDFF` | Selected-option and informational surfaces |
| `brand-subtle` | `#F7F7FF` | Low-emphasis brand backgrounds |
| `surface-canvas` | `#F8FAFC` | App background |
| `surface` | `#FFFFFF` | Cards, sheets, inputs, dialogs |
| `surface-muted` | `#F1F5F9` | Secondary panels and disabled backgrounds |
| `ink-strong` | `#172033` | Page headings and critical text |
| `ink` | `#334155` | Body text and icons |
| `ink-muted` | `#64748B` | Supporting text and inactive icons |
| `ink-disabled` | `#94A3B8` | Disabled text and icons |
| `line` | `#CBD5E1` | Default borders and dividers |
| `line-subtle` | `#E2E8F0` | Quiet separators |
| `line-strong` | `#94A3B8` | Active neutral boundaries |
| `success` | `#15803D` | Correct answers and completed state |
| `success-soft` | `#DCFCE7` | Correct-answer background |
| `warning` | `#B45309` | Retry-required feedback |
| `warning-soft` | `#FEF3C7` | Retry-required background |
| `danger` | `#DC2626` | Errors, destructive actions, incorrect final state |
| `danger-soft` | `#FEE2E2` | Error background |
| `info` | `#2563EB` | Neutral learning tips |
| `info-soft` | `#DBEAFE` | Tip background |

Use `text-ink-strong`, `bg-surface`, and `border-line` for new work instead of introducing raw hex values. `bg-primary` remains supported for existing components.

### Typography

Nunito is Polli's only UI typeface. Use the named font families already registered in the root layout.

| Role | NativeWind example | Size / line height | Weight | Use |
| --- | --- | --- | --- | --- |
| Display | `text-3xl font-nunito-extrabold` | 30 / 36 | 800 | Completion moments only |
| Screen title | `text-2xl font-nunito-bold` | 24 / 32 | 700 | Tab and exercise titles |
| Section title | `text-xl font-nunito-bold` | 20 / 28 | 700 | Card groups and sections |
| Card title | `text-lg font-nunito-bold` | 18 / 26 | 700 | Lesson and setting cards |
| Body | `text-base font-nunito` | 16 / 24 | 400 | Instructions and content |
| Label | `text-sm font-nunito-semibold` | 14 / 20 | 600 | Inputs, metadata, buttons |
| Caption | `text-xs font-nunito-medium` | 12 / 16 | 500 | Supporting metadata only |

Use sentence case. Keep button labels action-led: “Start lesson”, “Check answer”, and “Continue”.

### Spacing, shape, and elevation

Use the four-point rhythm. Prefer existing NativeWind increments such as `p-4`, `gap-2`, and `mt-6`.

| Token | Value | Use |
| --- | --- | --- |
| Screen inset | 16 | Horizontal page padding (`px-4`) |
| Inline gap | 8 | Icon + label, compact controls (`gap-2`) |
| Control padding | 12 | Buttons and inputs (`p-3`) |
| Card padding | 16 | Cards and answer choices (`p-4`) |
| Section gap | 24 | Major vertical groups (`mt-6`) |
| Control radius | 12 | Inputs, buttons, answer choices (`rounded-xl`) |
| Card radius | 16 | Lesson and metric cards (`rounded-2xl`) |
| Modal radius | 20 | Bottom sheets and dialogs |
| Pill radius | 999 | Status chips and compact counters (`rounded-full`) |

Use borders for structure. Cards use `bg-surface border border-line-subtle`; avoid shadows unless a floating modal needs a subtle elevation cue.

### Icons and motion

- Use Lucide icons at 20–24 points for normal controls and 28 points for primary navigation.
- Use `ink-muted` for neutral icons, `brand` for selected controls, and semantic state colors only for feedback.
- Use a 1.5–2 px stroke weight consistently.
- Motion explains a change: page transition, feedback dialog, or selection. Use 150–250 ms, respect reduced-motion preferences when available, and never use decorative loops.

## Component standards

### Buttons

| Variant | Recipe | States |
| --- | --- | --- |
| Primary | `bg-primary rounded-xl px-4 py-3` with white semibold label | Pressed: `bg-brand-strong`; disabled: `bg-surface-muted` and `text-ink-disabled` |
| Secondary | `bg-surface border border-line rounded-xl px-4 py-3` with `text-ink` | Pressed: `bg-surface-muted`; disabled: muted surface/text |
| Text | No filled surface; `text-primary font-nunito-semibold` | Pressed: reduced opacity; keep a 44-point target |
| Destructive | `bg-danger rounded-xl px-4 py-3` with white label | Reserve for irreversible account actions |
| Icon | 44 × 44 target, `rounded-full`, neutral or brand surface | Add `accessibilityLabel` |

Buttons include a verb and are disabled only when the next action is impossible. Do not use gradient buttons.

### Inputs

- Default: `bg-surface border border-line rounded-xl px-4 py-3 text-ink`.
- Focus: `border-brand` with a 2 px solid focus outline or clearly visible brand boundary.
- Error: `border-danger`, `text-danger` helper text, and an error icon/label.
- Inputs always have a persistent visible label; placeholders are examples, never labels.

### Cards and list rows

- Standard card: `bg-surface border border-line-subtle rounded-2xl p-4`.
- Tappable card: include `active:opacity-70`, an accessible label, and enough padding for a 44-point minimum target.
- Selected answer: `border-brand bg-brand-soft`; add a checkmark or “Selected” label when the state could be ambiguous.
- Completed lesson: use `success-soft` with a success label/icon; do not rely only on a green outline.

### Exercise feedback

| Outcome | Surface | Text and border | Required message |
| --- | --- | --- | --- |
| Correct | `bg-success-soft` | `text-success`, `border-success-line` | Confirmation plus the next action |
| Retry | `bg-warning-soft` | `text-warning`, `border-warning-line` | What to change and retry action |
| Final incorrect | `bg-danger-soft` | `text-danger`, `border-danger-line` | Correct answer and continue action |
| Tip | `bg-info-soft` | `text-info`, `border-info-line` | Helpful context, optional dismiss |

Feedback should appear after explicit answer submission. Preserve the learner's selected answer until the message is acknowledged.

### Progress and charts

- Use a solid `brand` line and solid, low-emphasis bars/areas; do not fade fills or use gradients.
- Pair every chart with a text summary and accessible values for the time period.
- Use `success` only for achieved goals or completed streaks, not for the primary chart series.

### Navigation

- Bottom tab background: `surface-canvas`; active icon/label: `brand`; inactive icon/label: `ink-disabled`.
- Keep four tabs: Home, Learn, Progress, and Settings.
- Every pushed screen has a labeled back action and retains a 16-point horizontal inset.

## Accessibility checklist

- Body text and controls meet a 4.5:1 contrast ratio; large headings meet 3:1.
- Every icon-only button has an `accessibilityLabel`.
- Touchable controls are at least 44 × 44 points and have a visible pressed/selected state.
- Status uses text and iconography in addition to color.
- Content remains readable at increased system text sizes without truncating essential actions.
- Do not encode answer correctness through red/green alone.

## Implementation guidance

```tsx
// A standard selected answer card
<Pressable
  className="rounded-xl border border-brand bg-brand-soft p-4 active:opacity-70"
  accessibilityLabel="Bonjour selected"
>
  <Text className="font-nunito-semibold text-ink-strong">Bonjour</Text>
</Pressable>
```

```tsx
// Use the JS tokens for style props that NativeWind does not cover.
import { theme } from "@/constants/theme";

<Icon color={theme.color.inkMuted} size={24} />
```

### Rules for new UI

1. Start with semantic tokens, not a raw hex value.
2. Use one primary action per screen section.
3. Use `rounded-xl` for controls and `rounded-2xl` for cards.
4. Apply semantic success, warning, danger, and info tokens only to their matching meaning.
5. Do not introduce gradients, decorative color fades, or non-token colors.
