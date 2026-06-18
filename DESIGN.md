---
name: Telemetry Court
description: AI names the pattern. Humans test the evidence.
colors:
  ink: "#32302f"
  canvas: "#f4f2ee"
  surface: "#fbfaf7"
  surface-muted: "#efede7"
  panel-strong: "#e4e1d8"
  accent: "#5f6f52"
  accent-strong: "#48563d"
  supported: "#3f7d55"
  weak: "#9a6a2f"
  contradicted: "#9b3d35"
  unsupported: "#6f625c"
  insufficient: "#6b6f7a"
  arena-bg: "#111723"
  arena-bg-soft: "#182130"
  arena-ink: "#f7f3ea"
  arena-cyan: "#93c5d7"
  arena-blue: "#8fa8d5"
  arena-green: "#82b28b"
  arena-amber: "#d5ad63"
  arena-red: "#d18a7e"
  atlas-ink: "#2e302d"
  atlas-surface: "#fbfaf6"
  atlas-surface-muted: "#eef1ec"
typography:
  display:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 760
    lineHeight: 1.12
    letterSpacing: "0"
  headline:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 760
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 740
    lineHeight: 1.28
    letterSpacing: "0"
  body:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.48
    letterSpacing: "0"
  label:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0"
  mono:
    fontFamily: "Geist Mono, Geist Mono Fallback, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.25
rounded:
  sm: "12px"
  md: "18px"
  lg: "24px"
  shell: "28px"
  xl: "32px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary-dark-surface:
    backgroundColor: "{colors.arena-ink}"
    textColor: "#141a25"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "46px"
  button-primary-light-surface:
    backgroundColor: "{colors.atlas-ink}"
    textColor: "{colors.surface}"
    rounded: "999px"
    padding: "0 18px"
    height: "44px"
  chip-status-supported:
    backgroundColor: "{colors.supported}"
    textColor: "{colors.arena-ink}"
    rounded: "999px"
    padding: "0 11px"
    height: "30px"
  card-dark-panel:
    backgroundColor: "{colors.arena-bg-soft}"
    textColor: "{colors.arena-ink}"
    rounded: "{rounded.lg}"
    padding: "18px"
  card-light-dossier:
    backgroundColor: "{colors.atlas-surface}"
    textColor: "{colors.atlas-ink}"
    rounded: "{rounded.shell}"
    padding: "22px"
---

# Design System: Telemetry Court

## 1. Overview

**Creative North Star: "The Evidence Dossier Arena"**

Telemetry Court combines a calm high-trust product shell with a spatial investigation arena. The system should feel like a scientific review instrument: restrained, precise, and quiet enough for careful judgment, while still making the telemetry landscape feel alive and interactive.

The design has two coordinated surface modes. The global product context uses warm neutral canvas, soft surfaces, muted borders, and system sans typography. The Evidence Arena uses a darker spatial cockpit for staged review work, while the Explore / Galaxy mode can return to a lighter semantic atlas when readability and evidence inspection need priority.

It rejects threat-wall drama, fake terminal styling, neon cyber aesthetics, generic AI decoration, and dense dashboard grids. Semantic color exists to clarify evidence status, uncertainty, contradiction, impurity, and overclaim risk.

**Key Characteristics:**

- Restrained neutral product UI with semantic color used sparingly.
- Spatial evidence maps that behave as primary interaction, not wallpaper.
- Structured-choice controls with clear selected, hover, disabled, and focus states.
- Claim, evidence, score, and verdict hierarchy before ornament.
- Plainspoken copy that names uncertainty and missing evidence directly.

## 2. Colors

The palette is warm-neutral and evidence-first, with a darker arena layer for the staged investigation cockpit and a lighter atlas layer for semantic map readability.

### Primary

- **Court Ink** (#32302f): Default text on warm product surfaces and the base identity color.
- **Focus Olive** (#5f6f52): Primary focus/accent token for selection, focus outlines, and rare primary emphasis.
- **Atlas Ink** (#2e302d): Strong action and text color on the lighter semantic atlas.

### Secondary

- **Arena Night** (#111723): Immersive investigation background for the staged cockpit.
- **Arena Slate** (#182130): Secondary dark panel layer used for tool surfaces and depth.
- **Arena Parchment Ink** (#f7f3ea): Text and primary buttons on the dark arena.

### Tertiary

- **Evidence Cyan** (#93c5d7): Relationship, reveal, and semantic map accent.
- **Neighbour Blue** (#8fa8d5): Contextual neighbour and broad-label state accent.
- **Supported Green** (#3f7d55): Supported evidence and positive support state.
- **Weak Amber** (#9a6a2f): Weak support, needs-context, and uncertainty state.
- **Contradiction Red** (#9b3d35): Contradicting evidence and overclaim warning state.

### Neutral

- **Canvas** (#f4f2ee): Product body background.
- **Surface** (#fbfaf7): Main light surface and dossier base.
- **Muted Surface** (#efede7): Secondary light panel background.
- **Panel Strong** (#e4e1d8): Stronger neutral panel or divider layer.
- **Unsupported Taupe** (#6f625c): Unsupported or unresolved state without alarm.
- **Insufficient Slate** (#6b6f7a): Insufficient evidence and needs-more-context state.

### Named Rules

**The Semantic Color Rule.** Status colors are reserved for evidence support, contradiction, uncertainty, impurity, and verdict meaning. They are not decorative accents.

**The Two Surface Rule.** Light atlas surfaces and dark investigation surfaces may coexist, but each screen must make one mode dominant so the product does not feel patched together.

## 3. Typography

**Display Font:** Geist, with ui-sans-serif and system-ui fallbacks  
**Body Font:** Geist, with ui-sans-serif and system-ui fallbacks  
**Label/Mono Font:** Geist Mono, with ui-monospace fallback

**Character:** The type system is utilitarian, direct, and product-native. Weight and spacing establish hierarchy; the product does not need decorative display fonts.

### Hierarchy

- **Display** (760, 30px, 1.12): Stage headings, drawer titles, and cockpit titles. Keep letter spacing at `0`.
- **Headline** (760, 24px, 1.2): Case-file and major panel headings.
- **Title** (740, 18px, 1.28): Selected-region claims, card titles, and important structured choices.
- **Body** (400, 15px, 1.48): Evidence summaries, explanations, and helper text. Cap prose line length near 65-75ch where layout allows.
- **Label** (800, 12px, 1.2): Chips, quiet metadata, and compact UI labels. Avoid default all-caps tracked eyebrows.
- **Mono Label** (800, 11px, 1.25): Metrics, IDs, JSON preview, and small instrument labels.

### Named Rules

**The No Drama Type Rule.** Product labels, buttons, metrics, and evidence summaries stay in Geist or Geist Mono. Do not introduce display fonts for functional UI.

## 4. Elevation

Telemetry Court primarily uses tonal layering, thin borders, and controlled shadows. Light surfaces should feel calm and flat. Dark investigation surfaces can use larger atmospheric shadows where they clarify shell depth, but individual cards should not pair heavy blur shadows with thin decorative borders.

### Shadow Vocabulary

- **Arena Shell Shadow** (`0 26px 70px rgba(0, 0, 0, 0.32)`): Large dark-mode stage shell only.
- **Drawer Shadow** (`-28px 0 80px rgba(0, 0, 0, 0.32)`): Review drawer separation over the arena.
- **Inset Dossier Highlight** (`inset 0 1px 0 rgba(255, 255, 255, 0.78)`): Light selected-region dossier highlight.
- **CTA Lift** (`0 14px 30px rgba(70, 61, 47, 0.13)`): Rare light-atlas primary action lift.

### Named Rules

**The Surface First Rule.** Use background tone, border, and spacing before shadow. Shadows are for shell depth, drawers, and active interaction feedback, not default card decoration.

## 5. Components

### Buttons

- **Shape:** Primary actions are softly rounded (`16px`) on dark surfaces and pill-shaped (`999px`) in the light atlas.
- **Primary:** On dark arena surfaces, use `#f7f3ea` with `#141a25` text. On light atlas surfaces, use `#2e302d` with `#fbfaf7` text.
- **Hover / Focus:** Hover may lift by `translateY(-1px)` over 180ms. Focus uses the global `3px solid #5f6f52` visible outline.
- **Disabled:** Use reduced opacity and remove transform.

### Chips

- **Style:** Compact pill chips with text plus semantic color. Minimum height is `30px`; padding is `0 11px`.
- **State:** Selected filter or verdict chips use a clear background and border shift, not color alone.
- **Evidence ratings:** Supports, weak support, irrelevant/noise, contradicts, and needs context must keep distinct labels.

### Cards / Containers

- **Corner Style:** Repeated cards use `18px`; panels use `22-24px`; shell-scale stage surfaces can use `28px`.
- **Background:** Dark arena panels use translucent parchment-on-night layers; light atlas dossiers use `#fbfaf6` or `#fbfaf7`.
- **Shadow Strategy:** Cards are mostly tonal. Large shadows belong to stage shells and drawers.
- **Border:** Use thin quiet borders from the current surface mode. Avoid colored side-stripe borders.
- **Internal Padding:** Use `15-18px` for cards, `22-24px` for dossiers and larger panels.

### Inputs / Fields

- **Style:** The current workflow avoids typed input for the main path. Future optional expert fields should use the same surface, border, radius, and focus vocabulary as cards and buttons.
- **Focus:** Always use visible focus outlines. Placeholder and helper text must meet contrast requirements.
- **Error / Disabled:** Error states must name the condition in text and avoid alarmist red unless evidence contradiction or blocking failure is real.

### Navigation

- **Style:** The stage rail is persistent and quiet, using compact buttons with index circles and text labels.
- **Active State:** Active stages use a subtle background, border-color shift, and text contrast change.
- **Completion State:** Complete stages may use supported green, but still include text or icon state.
- **Responsive:** Navigation may collapse or compress, but the active structured action must remain reachable.

### Telemetry Galaxy

The Galaxy is a signature component, not a decoration. Region position, size, brightness, halos, uncertainty rings, relationship lines, and selected-state details should map to existing fixture fields such as session count, model agreement, evidence strength, uncertainty, impurity, and nearest-neighbour relationships.

### Review Drawer

The drawer is the structured review and JSON surface. It overlays the arena with a dim scrim, preserves readable JSON formatting in Geist Mono, and should not dominate the main investigation stage until opened.

## 6. Do's and Don'ts

### Do:

- **Do** keep evidence hierarchy explicit: case context, AI claim reveal state, claims, evidence, support score, verdict, and risks.
- **Do** use structured choices for blind interpretation, evidence classification, label duel, impostor selection, failure modes, and verdict.
- **Do** use semantic status text with every color-coded status.
- **Do** preserve the warm neutral product shell (`#f4f2ee`, `#fbfaf7`) and the dark arena shell (`#111723`, `#f7f3ea`) as deliberate surface modes.
- **Do** keep motion subtle, state-driven, and compatible with `prefers-reduced-motion`.

### Don't:

- **Don't** make Telemetry Court look like a SIEM, SOC dashboard, threat-intelligence dashboard, chatbot, cyberpunk wall, fake terminal, or neon security tool.
- **Don't** use Matrix green, decorative cyber gradients, generic AI sparkle visuals, alarmist red, dense dashboard grids, or required free-text fields in the main workflow.
- **Don't** invent evidence, telemetry fields, Toponymy APIs, real incident claims, customer data, or restricted telemetry.
- **Don't** copy Wealthsimple, Apple, Linear, or any other brand's protected assets, slogans, exact layouts, icons, imagery, screenshots, or proprietary visual identity.
- **Don't** use color alone to communicate support, contradiction, uncertainty, impurity, or verdict state.
- **Don't** add decorative side-stripe borders, gradient text, glassmorphism by default, or repeated identical card grids.
