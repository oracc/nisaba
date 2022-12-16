# Change Log

All notable changes to the "atf" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.4.1] - 2022-12-16

### Added

- Glossary files (`*.glo`) have now a context menu for executing commands on the current project, when the file is open on the Oracc server.

### Fixed

- Lemmatisation and validation of files with Line Feed (LF) line ending, for example those typically created on Unix systems, now works on Windows without throwing errors.

## [1.3.0] - 2022-10-11

### Added

- Glossary files (`*.glo`) have now a searchable and clickable outline of letters and entries.
- Validation and lemmatisation of ATF files support files with multiple texts, as long as they share the same project code.

## [1.2.0] - 2022-06-28

### Added

- Basic syntax highlighting for glossary files (`*.glo`)

### Changed

- Low-level validation/lemmatisation log messages are no longer shown to the user whithin the console output in VS Code, but they are still saved to the log file.
- Word wrapping is enabled by default for ATF and glossary files
- Submitting an ATF file for validation/lemmatisation requires the file to have `*.atf` extension. This is consistent with the expectation of the server for the file to have this extension, and prevents users from accidentally forgetting to set the right extension
- More detailed logging messages are saved to the log file during server communication, for easier debugging
- More generous waiting time is set during server communications

### Security

- Some dependencies of Nisaba have been updated to address security vulnerabilities

## [1.0.0] - 2021-10-28

- Initial release
