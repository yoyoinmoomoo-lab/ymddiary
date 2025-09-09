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
