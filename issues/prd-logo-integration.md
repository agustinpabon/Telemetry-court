# PRD: Project Logo & Favicon Integration

Status: complete

## Problem Statement

Telemetry Court needs a consistent, high-trust project logo and favicon across local development, Vercel production builds, and GitHub metadata files to align with the TutteInstitute project identity guidelines, replacing the default Next.js branding assets without introducing text or redesigning the logo.

## Solution

Save the official logo transparent file under `public/telemetry-court-logo.png`, generate multi-resolution favicon and touch icon variants (`app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`, etc.) using a lightweight Python compiler script, integrate them into Next.js App Router layout metadata, configure standard 1280x640 social preview image for GitHub, update README and package description, and update GitHub repository metadata.

## User Stories

1. As a reviewer, I want to see the Telemetry Court logo in my browser tab when using the application locally or in production, so that I trust the site identity.
2. As an open-source contributor, I want to see the official logo and description in the GitHub README and repository metadata, so that the project identity is clear.
3. As a developer, I want all icon assets to be generated using existing system tools without unnecessary external npm dependencies, to keep the repository clean.

## Implementation Decisions

- Save the raw transparent logo as `public/telemetry-court-logo.png`.
- Resize using macOS built-in `sips` tool for standard resolutions (32x32, 180x180, 192x192, 512x512).
- Write a dependency-free Python script `scripts/generate-ico.py` to package PNGs into a multi-resolution `.ico` format.
- Let Next.js file-based App Router conventions pick up `/app/favicon.ico`, `/app/icon.png`, and `/app/apple-icon.png` automatically.
- Generate a 1280x640 padded social preview image `docs/assets/github-social-preview.png`.
- Centered the logo at the top of the README.md and updated repository metadata using `gh repo edit`.

## Testing Decisions

- Verify that `npm run build` succeeds and registers `/icon.png` and `/apple-icon.png` as static assets.
- Verify that tests (`npm test`) and linting (`npm run lint`) pass.
- Verify using `curl` that both `/favicon.ico` and `/icon.png` return 200 OK with correct content types and generated timestamps.

## Out of Scope

- Redesigning the logo or adding text onto it.
- Setting up a database or cloud storage for assets.
- Adding third-party NPM image dependencies (e.g. `sharp`).
