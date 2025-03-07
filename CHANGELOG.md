# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-03-07

### Added

- First release of TestNG Report to CTRF JSON converter
- Command-line interface with the following options:
  - `-o, --output`: Specify output directory and filename
  - `-t, --tool`: Include tool name in CTRF report
  - `-e, --env`: Include environment properties in CTRF report
- Support for converting TestNG results XML to CTRF JSON format
- Default output to ctrf/ctrf-report.json when no output path specified

```javascript
  npx testng-to-ctrf path/to/testng-results.xml
```
