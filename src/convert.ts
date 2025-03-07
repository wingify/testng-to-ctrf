/**
 * MIT License
 *
 * Copyright (c) 2024 Wingify Software Pvt. Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import fs from "fs-extra";
import path from "path";
import { parseString } from "xml2js";
import { CtrfReport, CtrfTest, CtrfTestState, Tool } from "../types/ctrf";

/**
 * Configuration options for XML parsing and report generation.
 * These values can be adjusted based on specific TestNG report formats.
 */
const CONFIG = {
  DATE_FORMATS: ["yyyy-MM-dd HH:mm:ss z", "yyyy-MM-dd"], // Supported date formats
  DEFAULT_TOOL_NAME: "TestNG",
  DEFAULT_OUTPUT_PATH: "ctrf/ctrf-report.json",
};

// Interface representing a single test case from TestNG XML report
interface TestNGTestCase {
  name: string; // Name of the test case (format: "TestClassName: MethodName")
  status: string; // Test status (pass/fail/skip)
  duration: number; // Test duration in milliseconds (from duration-ms attribute)
  startTime: number; // Unix timestamp of test start
  endTime: number; // Unix timestamp of test end
  message?: string; // Error message (only present for failed tests)
  trace?: string; // Stack trace (only present for failed tests)
}

// Interface representing overall TestNG test suite results
interface TestNGResults {
  total: number; // Total number of tests executed
  passed: number; // Tests that completed successfully
  failed: number; // Tests that threw exceptions or failed assertions
  skipped: number; // Tests marked with @Test(enabled=false) or dependent on failed tests
  ignored: number; // Tests explicitly ignored using @Ignore annotation
  startTime: number; // Suite start time (from beforeSuite or suite attributes)
  endTime: number; // Suite end time (from suite attributes)
  suiteName: string; // Name of the test suite from suite attributes
}

/**
 * Parses a date string and returns the corresponding timestamp.
 * @param {string} dateString - The date string to parse.
 * @returns {number} The timestamp in milliseconds, or 0 if parsing fails.
 */
function parseDate(dateString: string): number {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    } else {
      // Try parsing without the timezone
      const withoutTZ = dateString.split(" ")[0];
      const dateWithoutTZ = new Date(withoutTZ);
      if (!isNaN(dateWithoutTZ.getTime())) {
        return dateWithoutTZ.getTime();
      } else {
        console.error(`Failed to parse date: ${dateString}`);
        return 0;
      }
    }
  } catch (error) {
    console.error(`Error parsing date ${dateString}:`, error);
    return 0;
  }
}

/**
 * Safely processes environment properties from command line arguments.
 * @param envProps - Array of strings in "key=value" format
 * @returns Processed environment properties object
 */
function processEnvironmentProperties(
  envProps?: string[],
): Record<string, any> {
  if (!envProps) return {};

  const result: Record<string, any> = {};

  for (const prop of envProps) {
    const [key, ...valueParts] = prop.split("=");
    const value = valueParts.join("="); // Handle values that might contain '='
    if (key && value) {
      result[key] = value;
    } else {
      console.warn(`Skipping invalid environment property: ${prop}`);
    }
  }

  return result;
}

/**
 * Parses a TestNG XML report file and extracts test cases and results.
 * @param {string} filePath - The path to the TestNG XML report file.
 * @returns {Promise<{ testCases: TestNGTestCase[]; results: TestNGResults }>} A promise that resolves to an object containing test cases and overall results.
 */
async function parseTestNGReport(
  filePath: string,
): Promise<{ testCases: TestNGTestCase[]; results: TestNGResults }> {
  console.log("Reading TestNG report file:", filePath);
  const xml = await fs.readFile(filePath, "utf-8");

  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        console.error("Failed to parse XML:", err);
        reject(new Error(`Failed to parse TestNG XML: ${err.message}`));
        return;
      }

      try {
        const testCases: TestNGTestCase[] = [];
        const testngResults = result["testng-results"];

        if (!testngResults) {
          console.error(
            "Invalid XML structure: Missing testng-results element",
          );
          reject(
            new Error("Invalid TestNG report format: missing testng-results"),
          );
          return;
        }

        // Find and validate the test suite element
        const suite = testngResults?.suite?.[0];

        if (!suite) {
          console.error(
            "Invalid XML structure: Missing or empty suite element",
          );
          reject(new Error("Invalid TestNG report format: missing suite"));
          return;
        }

        // Extract timestamps from suite or beforeSuite method
        let startedAt = suite.$?.["started-at"];
        const finishedAt = suite.$?.["finished-at"];

        if (!startedAt || !finishedAt) {
          console.warn("Missing timestamp attributes in suite:", {
            startedAt: startedAt || "MISSING",
            finishedAt: finishedAt || "MISSING",
          });
        }

        if (suite.test && Array.isArray(suite.test)) {
          try {
            const beforeSuiteMethod = suite.test
              .flatMap((test: any) => {
                if (!test.class) {
                  console.warn(
                    `Test missing class element: ${test.$?.name || "unnamed test"}`,
                  );
                  return [];
                }
                return test.class || [];
              })
              .flatMap((classItem: any) => {
                if (!classItem["test-method"]) {
                  console.warn(
                    `Class missing test-method element: ${classItem.$?.name || "unnamed class"}`,
                  );
                  return [];
                }
                return classItem["test-method"] || [];
              })
              .find(
                (method: any) => method.$ && method.$.name === "beforeSuite",
              );

            if (beforeSuiteMethod) {
              startedAt = beforeSuiteMethod.$["started-at"];
              console.log("Using beforeSuite method start time:", startedAt);
            }
          } catch (error) {
            console.error("Error processing beforeSuite method:", error);
          }
        } else {
          console.error(
            "Invalid XML structure: Missing or invalid test array in suite",
          );
          reject(
            new Error(
              "Invalid TestNG report format: missing or invalid test array",
            ),
          );
          return;
        }

        // Extract test result counts and suite information
        const results: TestNGResults = {
          total: parseInt(testngResults.$["total"], 10) || 0,
          passed: parseInt(testngResults.$["passed"], 10) || 0,
          failed: parseInt(testngResults.$["failed"], 10) || 0,
          skipped: parseInt(testngResults.$["skipped"], 10) || 0,
          ignored: parseInt(testngResults.$["ignored"], 10) || 0,
          startTime: parseDate(startedAt),
          endTime: parseDate(finishedAt),
          suiteName: suite.$?.["name"] || "Unknown Suite",
        };

        console.log("Parsed test results:", {
          total: results.total,
          passed: results.passed,
          failed: results.failed,
          skipped: results.skipped,
          ignored: results.ignored,
        });

        // Process test cases hierarchically: suite -> test -> class -> test-method
        if (Array.isArray(suite.test)) {
          suite.test.forEach((test: any, testIndex: number) => {
            if (!test.class || !Array.isArray(test.class)) {
              console.warn(
                `Invalid test structure at index ${testIndex}: missing or invalid class array`,
              );
              return;
            }

            test.class.forEach((classObj: any, classIndex: number) => {
              if (
                !classObj["test-method"] ||
                !Array.isArray(classObj["test-method"])
              ) {
                console.warn(
                  `Invalid class structure at test ${testIndex}, class ${classIndex}: missing or invalid test-method array`,
                );
                return;
              }

              classObj["test-method"].forEach(
                (method: any, methodIndex: number) => {
                  try {
                    if (!method.$ || method.$.is_config === "true") {
                      return;
                    }

                    const testCase: TestNGTestCase = {
                      name: `${test.$.name || "Unknown Test"}: ${method.$.name || "Unknown Method"}`,
                      status: (method.$.status || "other").toLowerCase(),
                      duration: parseInt(method.$["duration-ms"], 10) || 0,
                      startTime: parseDate(method.$["started-at"]),
                      endTime: parseDate(method.$["finished-at"]),
                    };

                    if (method.exception?.[0]) {
                      if (method.exception[0].message?.[0]) {
                        testCase.message = method.exception[0].message[0];
                      }
                      if (method.exception[0]["full-stacktrace"]?.[0]) {
                        testCase.trace =
                          method.exception[0]["full-stacktrace"][0];
                      }
                    }

                    testCases.push(testCase);
                  } catch (error) {
                    console.error(
                      `Error processing test method at test ${testIndex}, class ${classIndex}, method ${methodIndex}:`,
                      error,
                    );
                    console.error(
                      "Method data:",
                      JSON.stringify(method, null, 2),
                    );
                  }
                },
              );
            });
          });
        } else {
          throw new Error("Invalid suite.test structure: not an array");
        }

        console.log(`Successfully parsed ${testCases.length} test cases`);
        resolve({ testCases, results });
      } catch (error) {
        console.error("Error parsing TestNG report:", error);
        console.error("Partial parsed data:", JSON.stringify(result, null, 2));
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        reject(new Error(`Failed to parse TestNG report: ${errorMessage}`));
      }
    });
  });
}

/**
 * Converts a TestNG test case to a CTRF test format.
 * @param {TestNGTestCase} testCase - The TestNG test case to convert.
 * @returns {CtrfTest} The converted CTRF test object.
 */
function convertToCTRFTest(testCase: TestNGTestCase): CtrfTest {
  // Map TestNG status to CTRF status format
  let status: CtrfTestState;
  switch (testCase.status) {
    case "pass":
      status = "passed";
      break;
    case "fail":
      status = "failed";
      break;
    case "skip":
      status = "skipped";
      break;
    default:
      status = "other";
  }

  // Create base test object with required fields
  const ctrfTest: CtrfTest = {
    name: testCase.name,
    status: status,
    duration: testCase.duration,
  };

  // Add error details for failed tests only
  if (status === "failed") {
    if (testCase.message) {
      ctrfTest.message = testCase.message;
    }
    if (testCase.trace) {
      ctrfTest.trace = testCase.trace;
    }
  }

  return ctrfTest;
}

/**
 * Creates a CTRF report from TestNG test cases and results.
 * @param {TestNGTestCase[]} testCases - An array of TestNG test cases.
 * @param {TestNGResults} results - The overall TestNG results.
 * @param {string} [toolName] - The name of the testing tool (default: "TestNG").
 * @param {Record<string, any>} [envProps] - Additional environment properties.
 * @returns {CtrfReport} The created CTRF report object.
 */
function createCTRFReport(
  testCases: TestNGTestCase[],
  results: TestNGResults,
  toolName?: string,
  envProps?: Record<string, any>,
): CtrfReport {
  // Convert all test cases to CTRF format
  const ctrfTests = testCases.map(convertToCTRFTest);

  // Create summary object with test counts and timestamps
  const summary = {
    tests: results.total,
    passed: results.passed,
    failed: results.failed,
    pending: 0, // TestNG doesn't have a 'pending' status
    skipped: results.skipped,
    other: results.ignored,
    start: results.startTime,
    stop: results.endTime,
  };

  const tool: Tool = {
    name: toolName || "TestNG",
  };

  const environment = {
    ...envProps,
  };

  // Build final report structure
  const report: CtrfReport = {
    results: {
      tool,
      summary,
      tests: ctrfTests,
      environment,
    },
  };

  return report;
}

/**
 * Converts a TestNG XML report to a CTRF JSON report.
 * @param {string} testngPath - The path to the TestNG XML report file.
 * @param {string} [outputPath] - The path where the CTRF JSON report should be saved (default: "ctrf/ctrf-report.json").
 * @param {string} [toolName] - The name of the testing tool (default: "TestNG").
 * @param {string[]} [envProps] - Additional environment properties in the format "key=value".
 * @returns {Promise<void>} A promise that resolves when the conversion is complete.
 */
export async function convertTestngToCTRF(
  testngPath: string,
  outputPath?: string,
  toolName?: string,
  envProps?: string[],
): Promise<void> {
  // Parse input TestNG XML report
  const { testCases, results } = await parseTestNGReport(testngPath);

  // Process environment properties using the new helper function
  const envPropsObj = processEnvironmentProperties(envProps);

  // Generate CTRF report
  const ctrfReport = createCTRFReport(
    testCases,
    results,
    toolName || CONFIG.DEFAULT_TOOL_NAME,
    envPropsObj,
  );

  // Ensure output directory exists and write report
  const defaultOutputPath = CONFIG.DEFAULT_OUTPUT_PATH;
  const finalOutputPath = path.resolve(outputPath || defaultOutputPath);

  const outputDir = path.dirname(finalOutputPath);
  await fs.ensureDir(outputDir);

  console.log("Writing CTRF report to:", finalOutputPath);
  await fs.outputJson(finalOutputPath, ctrfReport, { spaces: 2 });
}
