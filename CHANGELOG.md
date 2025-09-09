# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- N/A

### Changed
- N/A

### Fixed
- N/A

### Removed
- N/A

## [0.1.1] - 2025-01-27

### Added
- Korean natural language time parsing: `@ 오전/오후 HH시` and `@ 오늘/내일/모레`
- Todo checkbox toggle persistence with auto-save
- Editor default bullet (note) behavior with `[` input conversion to Todo
- Long Memo input rule unified to `>` only (removed `+` support)
- In-app help text for input rules

### Changed
- Event parsing now supports Korean time expressions
- Todo blocks maintain completion state across page reloads
- Editor starts with note bullets by default, converts to Todo on `[` input
- Long Memo blocks use `>` prefix exclusively

### Fixed
- Infinite re-rendering issue in DailyView component
- Todo parsing correctly strips `[ ]` prefix from display text
- Tag extraction working properly for all block types
- JSX syntax error with `>` character in help text

### Removed
- `+` prefix support for Long Memo blocks

## [0.1.0] - 2025-01-27

### Added
- Daily recording vertical slice (editor → parse → save → render)
- Block-based parser: `todo | note | important | event | long_memo`
- Parser rules for `- [ ]`, `- `, `! `, `@ HH:mm`, `+ ` (long memo)
- Inline `#tag` extraction → `DailyEntry.tags[]`
- Collapse/expand for Long Memo blocks
- React + TypeScript + Tailwind CSS project setup
- Vite development environment with hot reload
- Basic Daily View UI with block visualization

### Changed
- Folder structure aligned to Git workflow guidelines
- Long Memo saved as multi-line `body` with collapse functionality

### Fixed
- Event time parsing for `09:00` / `9:00` normalized to HH:mm format
- N/A

### Removed
- N/A
