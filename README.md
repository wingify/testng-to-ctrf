# Convert TestNG Results XML to CTRF JSON
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Convert TestNG results XML to (CTRF reports)[https://ctrf.io/docs/intro]

This package is useful if there isn't a CTRF reporter available for your test framework.

## Acknowledgments & Attribution

This project is a fork of [junit-to-ctrf](https://github.com/ctrf-io/junit-to-ctrf) by Matthew Thomas. The TestNG adaptation was developed by Sahil Goyal while maintaining the same high standards and principles of the original project.

For a complete list of third-party libraries and their licenses used in this project, please see our [Third Party Attributions](third-party-attributions.txt) file.

## Usage

```sh
npx testng-to-ctrf path/to/testng-results.xml
```

## Options

`-o`, `--output` <output>: Output directory and filename for the CTRF report. If not provided, defaults to ctrf/ctrf-report.json.

`-t`, `--tool` <toolName>: Tool name to include in the CTRF report.

`-e`, `--env` <envProperties>: Environment properties to include in the CTRF report. Accepts multiple properties in the format KEY=value.

## Examples

Convert a TestNG XML report to the default CTRF report location (ctrf/ctrf-report.json):

```sh
npx testng-to-ctrf path/to/testng-results.xml
```

### Specify Output File

Convert a Testng XML report to a specified output file:

```sh
npx testng-to-ctrf path/to/testng-results.xml -o path/to/output/ctrf-report.json
```

### Include Tool Name

Convert a Testng XML report and include a tool name in the CTRF report:

```sh
npx testng-to-ctrf path/to/testng-results.xml -t ExampleTool
```

### Include Environment Properties

Convert a Testng XML report and include environment properties in the CTRF report:

```sh
npx testng-to-ctrf path/to/testng-results.xml -e appName=MyApp buildName=MyBuild
```

See [CTRF schema](https://www.ctrf.io/docs/schema/environment) for possible environment properties

### Full Command

Combine all options in a single command:

```sh
testng-to-ctrf path/to/testng-results.xml -o path/to/output/ctrf-report.json -t ExampleTool -e appName=MyApp buildName=MyBuild
```

## What is CTRF?

CTRF is a universal JSON test report schema that addresses the lack of a standardized format for JSON test reports.

**Consistency Across Tools:** Different testing tools and frameworks often produce reports in varied formats. CTRF ensures a uniform structure, making it easier to understand and compare reports, regardless of the testing tool used.

**Language and Framework Agnostic:** It provides a universal reporting schema that works seamlessly with any programming language and testing framework.

**Facilitates Better Analysis:** With a standardized format, programatically analyzing test outcomes across multiple platforms becomes more straightforward.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `yarn install`
3. Build the project: `yarn build`

## Changelog

### v1.0.0
- Initial release
- Basic TestNG XML to CTRF JSON conversion
- Command-line interface with output and environment options

## Support

- Create a [GitHub Issue](../../issues) for bug reports and feature requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
