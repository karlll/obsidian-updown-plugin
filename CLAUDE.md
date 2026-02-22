# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

**obsidian-updown-plugin** is an Obsidian community plugin that lets users open the current note as an updown slideshow in the browser. It is a companion to the [updown](https://github.com/karlll/updown) markdown-to-slideshow server.

## Tech Stack

- **Language**: TypeScript (strict)
- **Build**: Vite (library mode, CJS output → `main.js`)
- **Tests**: Vitest
- **Runtime target**: Obsidian desktop (Electron)

## Commands

- `npm install` — install dependencies
- `npm run dev` — watch mode (rebuilds on change)
- `npm run build` — type-check + production build
- `npm test` — run tests

## Architecture

- `src/main.ts` — plugin entry point; extends `Plugin` from `obsidian`
- `manifest.json` — Obsidian plugin metadata (id, version, minAppVersion)
- `versions.json` — maps plugin versions to minimum Obsidian versions
- `styles.css` — plugin CSS (loaded automatically by Obsidian)

## Build Output

Vite outputs `main.js` at the repo root (CJS format, inline sourcemaps). Obsidian loads `main.js` + `manifest.json` + `styles.css` from the plugin directory.

## Obsidian Plugin Rules

- `isDesktopOnly: true` — this plugin spawns a local updown server process
- Follow all guidelines at https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Never bundle the `obsidian` package — it is always external
- Use Obsidian's built-in UI primitives (Notice, Modal, etc.) rather than raw DOM manipulation where possible
- Clean up all resources in `onunload()`

## Conventions

- Conventional Commits format for git messages
- TypeScript strict mode — no `any`, no implicit returns
