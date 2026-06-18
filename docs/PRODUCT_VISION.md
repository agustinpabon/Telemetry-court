# Product Vision

Telemetry Court is an interactive evidence arena where AI-generated interpretations of cyber telemetry clusters are treated as testable claims, and humans judge whether the evidence actually supports them.

Core product line:

```text
AI names the pattern. Humans test the evidence.
```

Core product question:

```text
Can AI prove what it claims?
```

Core evaluation workflow:

```text
Telemetry clusters
-> AI-generated interpretation
-> evidence-first investigation
-> structured human verdict
-> evaluation data for better prompts, labels, embeddings, and cluster quality
```

## Product Pivot

The previous framing of Telemetry Court as a simple approve/reject label validator is superseded.

Historical baseline:

```text
AI label -> evidence cards -> approve / reject
```

Current direction:

```text
Explore telemetry landscape
-> open behavioural region
-> inspect case evidence
-> make a blind interpretation
-> reveal the AI claim
-> classify evidence
-> compare candidate labels
-> identify outlier sessions
-> issue a structured verdict
-> export review data
```

## Interaction Model

The main workflow is structured-choice first. Do not require typed text for the happy path.

Primary interactions:

- Select between interpretation options.
- Classify evidence cards as supports, weak support, irrelevant/noise, contradicts, or needs context.
- Choose which candidate label is better supported.
- Select an impostor or outlier session.
- Choose reason and failure-mode chips.
- Issue a structured verdict.
- Export or view structured review JSON.

Free text may exist later as optional expert input, but it must not block the core review flow.

## Experience Model

The Evidence Arena should feel like entering a living telemetry map, opening a behavioural region as an investigation cockpit, interrogating evidence, and issuing a structured scientific verdict.

This is a UI/UX reboot of the existing Evidence Arena concept, not a product pivot or data-model rewrite. The current workflow remains:

```text
Telemetry landscape
-> behavioural region / case file
-> blind investigation
-> AI label reveal
-> evidence classification
-> label duel
-> impostor / outlier selection
-> structured verdict
-> review JSON export
```

The telemetry landscape should be the primary interaction, not a decorative section. Behavioural regions should communicate agreement, evidence strength, uncertainty, impurity, and overclaim risk. Opening a region should reveal a cockpit-like case context with dataset metadata, top features, risk flags, nearest neighbour, representative sessions, and the next structured action.

The investigation flow should present one active stage at a time, with compact progress navigation and review JSON available from a drawer or receipt rather than occupying the main vertical page.

## Product Flow

### 1. Telemetry Landscape

The user starts with a visual landscape of behavioural regions. Each region should communicate review status, model agreement, evidence strength, and uncertainty.

### 2. Case File

Opening a region creates an investigation file with cluster ID, dataset, session count, top features, risk flags, nearest neighbour, claims under test, and representative sessions.

### 3. Blind Investigation

Evidence appears before the AI label. The user answers: "Before seeing the AI label, what does the evidence suggest?" using selectable options including "not enough evidence" and "none of these."

### 4. AI Label Reveal

After the blind choice, the AI label is revealed and the UI shows whether the blind interpretation agrees or disagrees with it.

### 5. Evidence Board

Each evidence card is classifiable as:

- Supports label
- Weak support
- Irrelevant / noise
- Contradicts label
- Need more context

### 6. Label Duel

The user compares candidate labels from sources such as baseline AI, evidence-constrained AI, human-style labels, and uncertainty-preserving labels.

### 7. Find the Impostor

The user chooses which representative session least belongs in the cluster. Seeded synthetic metadata should explain feature overlap and outlier score.

### 8. Structured Verdict

Final verdict options:

- Supported
- Partially supported
- Unsupported / overclaimed
- Uncertain
- Cluster is impure
- Needs split
- Needs merge
- Needs better evidence

The review summary should include blind choice, AI label, label duel winner, evidence ratings, impostor choice, failure modes, final verdict, and export JSON.

## Non-Goals

Telemetry Court is not:

- a SIEM;
- a SOC dashboard;
- a generic chatbot;
- a threat-intelligence dashboard;
- an attack detector;
- a raw log explorer;
- a claim that AI labels are always wrong;
- a place to copy restricted telemetry into a public demo.

## Data Posture

Use local synthetic, toy, sanitized, or approved demo cases. The current MVP must run fully offline with sample fixture data.

Do not introduce real restricted telemetry, secrets, customer data, or incident claims.
