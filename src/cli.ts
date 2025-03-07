#!/usr/bin/env node
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

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { convertTestngToCTRF } from "./convert";

/**
 * CLI application to convert TestNG XML reports to CTRF format
 * Uses yargs for command-line argument parsing
 */
yargs(hideBin(process.argv))
  .usage("Usage: $0 <testng-results.xml> [options]")
  .command(
    "$0 <path>",
    "Convert Testng XML report to CTRF",
    /**
     * Configure command options and arguments
     * @param {yargs.Argv} yargs - The yargs instance
     * @returns {yargs.Argv} Configured yargs instance
     */
    (yargs) => {
      return yargs
        .positional("path", {
          describe: "Path to the Testng XML file",
          type: "string",
          demandOption: true, // Makes this argument required
        })
        .option("output", {
          alias: "o",
          type: "string",
          description: "Output directory and filename for the CTRF report",
        })
        .option("tool", {
          alias: "t",
          type: "string",
          description: "Tool name",
        })
        .option("env", {
          alias: "e",
          type: "array",
          description: "Environment properties",
        });
    },
    /**
     * Handler function for the command
     * @param {Object} argv - Parsed command line arguments
     * @param {string} argv.path - Input TestNG XML file path
     * @param {string} [argv.output] - Output file path
     * @param {string} [argv.tool] - Tool name
     * @param {string[]} [argv.env] - Environment properties
     */
    async (argv) => {
      try {
        const { path, output, tool, env } = argv;
        // Convert TestNG XML to CTRF format
        await convertTestngToCTRF(
          path as string,
          output as string,
          tool as string,
          env as string[],
        );
        console.log("Conversion completed successfully.");
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    },
  )
  .help().argv;
