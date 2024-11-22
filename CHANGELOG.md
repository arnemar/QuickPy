# Change Log

All notable changes to the "QuickPy" extension will be documented in this file.

This project adheres to [Keep a Changelog](http://keepachangelog.com/).

## [1.0.0] 2024-11_23
### Added
- Live Python code execution that evaluates up to the current line in a file.
- Automatic debounce delay configuration for live execution (default: 300ms).
- Inline output display for Python code execution, including:
  - `outputColor` to customize inline output text color (default: grey).
  - `errorColor` to customize error highlight text color (default: red).
- Smart detection for code lines to evaluate, excluding constructs like `def`, `for`, `while`, etc.
- Inline error highlighting and concise error messages displayed after execution errors.
- Automatic detection and usage of `.venv/bin/python` if present in the project directory.
- Fallback to default Python interpreter if a virtual environment is unavailable.
- Temporary file-based execution for error handling and cleanup.
- Comprehensive error display, including:
  - Inline error annotations for the relevant lines.
  - Full error details in a popup for context.
- Persistent decorations for output and error lines.

### Changed
- Enhanced error handling to provide concise inline error messages and popup notifications.
- Output now includes the last line of results or `<No Output>` for empty results.

### Fixed
- Resolved issues with non-existent virtual environments causing execution failures.
- Ensured cleanup of temporary files after each execution.

---
