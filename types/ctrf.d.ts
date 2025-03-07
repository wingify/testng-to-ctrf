/**
 * MIT License
 *
 * Copyright (c) 2025 Wingify Software Pvt. Ltd.
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

/** Common Test Report Format (CTRF) report containing test execution results */
export interface CtrfReport {
  results: Results;
}

/** Container for all test execution data */
export interface Results {
  /** Information about the testing tool/framework used */
  tool: Tool;
  /** Aggregated test execution statistics */
  summary: Summary;
  /** List of individual test results */
  tests: CtrfTest[];
  /** Environment details where tests were executed */
  environment?: CtrfEnvironment;
  /** Additional custom data */
  extra?: Record<string, any>;
}

/** Statistical summary of test execution */
export interface Summary {
  /** Total number of tests executed */
  tests: number;
  /** Number of passing tests */
  passed: number;
  /** Number of failing tests */
  failed: number;
  /** Number of skipped tests */
  skipped: number;
  /** Number of pending tests */
  pending: number;
  /** Number of tests in other states */
  other: number;
  /** Number of test suites (optional) */
  suites?: number;
  /** Timestamp when test execution started */
  start: number;
  /** Timestamp when test execution completed */
  stop: number;
  /** Additional summary information */
  extra?: Record<string, any>;
}

/** Individual test case result */
export interface CtrfTest {
  /** Name of the test */
  name: string;
  /** Final status of the test execution */
  status: CtrfTestState;
  /** Test execution time in milliseconds */
  duration: number;
  /** Timestamp when test started */
  start?: number;
  /** Timestamp when test completed */
  stop?: number;
  /** Test suite or group name */
  suite?: string;
  /** Failure or error message */
  message?: string;
  /** Stack trace for failures */
  trace?: string;
  /** Source code line information */
  line?: string;
  /** Original status string from test framework */
  rawStatus?: string;
  /** Test case labels/tags */
  tags?: string[];
  /** Type of test (e.g., unit, integration) */
  type?: string;
  /** Path to test file */
  filePath?: string;
  /** Number of retry attempts */
  retries?: number;
  /** Indicates if test is marked as flaky */
  flaky?: boolean;
  /** Results from previous retry attempts */
  attempts?: CtrfTest[];
  /** Browser used for test execution */
  browser?: string;
  /** Device used for test execution */
  device?: string;
  /** Path or URL to failure screenshot */
  screenshot?: string;
  /** Test parameters or input data */
  parameters?: Record<string, any>;
  /** Test execution steps */
  steps?: Step[];
  /** Additional test-specific data */
  extra?: Record<string, any>;
}

/** Test execution environment details */
export interface CtrfEnvironment {
  /** Name of the application under test */
  appName?: string;
  /** Version of the application under test */
  appVersion?: string;
  /** Operating system platform */
  osPlatform?: string;
  /** Operating system release */
  osRelease?: string;
  /** Operating system version */
  osVersion?: string;
  /** CI/CD build name */
  buildName?: string;
  /** CI/CD build number */
  buildNumber?: string;
  /** CI/CD build URL */
  buildUrl?: string;
  /** Source code repository name */
  repositoryName?: string;
  /** Source code repository URL */
  repositoryUrl?: string;
  /** Git branch name */
  branchName?: string;
  /** Test environment name (e.g., staging, production) */
  testEnvironment?: string;
  /** Additional environment information */
  extra?: Record<string, any>;
}

/** Testing tool/framework information */
export interface Tool {
  /** Name of the testing tool */
  name: string;
  /** Version of the testing tool */
  version?: string;
  /** Additional tool-specific information */
  extra?: Record<string, any>;
}

/** Individual test step result */
export interface Step {
  /** Name of the test step */
  name: string;
  /** Status of the test step */
  status: CtrfTestState;
}

/** Possible test execution states */
export type CtrfTestState =
  | "passed"
  | "failed"
  | "skipped"
  | "pending"
  | "other";
