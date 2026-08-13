# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-14

### Added
- Initial release of `trix-icons` source-distribution CLI.
- `@trix/icons` React component library featuring 14 motion-story icons:
  - `BellIcon`, `CallIcon`, `CheckIcon`, `CopyIcon`, `DeleteIcon`, `DownloadIcon`, `HeartIcon`, `HomeIcon`, `LeetcodeIcon`, `MailIcon`, `MediumIcon`, `RefreshIcon`, `SearchIcon`, `UploadIcon`.
- `@trix/core` shared animation contracts and motion vocabulary tokens (`EASE_SETTLE`, `EASE_DRAW`, `EASE_BOUNCE`, `EASE_STANDARD`, `DURATION_MICRO`, `DURATION_NORMAL`, `DURATION_STORY`).
- `@trix/registry` schema, validation scripts, and generated icon metadata index.
- Single-command CLI installation (`npx trix add <icon-name>`).
