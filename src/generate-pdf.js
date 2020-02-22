const puppeteer = require("puppeteer");
const yargs = require("yargs");
const fs = require('fs')

DEFAULT_PRINT_OPTIONS = {
  format: "Letter",
  margin: {
    top: "0.5in",
    bottom: "0.5in",
    right: "0.5in",
    left: "0.5in"
  }
}

GOTO_PDF_OPTIONS = {
  waitUntil: "networkidle2"
}

VALIDATION_ERRORS = {
  mustHaveWritepathOrRaw:
    "At least one of the parameters { '--writePath <path>', '--raw' } must be supplied",
  errorParsingJson:
    "Error parsing option overrides as JSON: ",
  urlIsMissing:
    "The parameter '--url <url>' must be provided"
}

async function getUrlPdf(browser, url, writePath, optionOverrides) {
  let pdfOptions = optionOverrides || DEFAULT_PRINT_OPTIONS;

  pdfOptions.path = writePath;

  const page = await browser.newPage();
  await page.goto(url, GOTO_PDF_OPTIONS)
  return await page.pdf(pdfOptions)
}

function parseJsonFile(pathToFile) {
  try {
    const data = fs.readFileSync(pathToFile);
    
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}

function validatePdfCliArgs(argv) {
  let validationErrors = []; 

  if (!argv.writePath && !argv.raw) {
    validationErrors.push(VALIDATION_ERRORS.mustHaveWritepathOrRaw)
  }

  try {
    argv.optionOverrides && parseJsonFile(argv.optionOverrides);
  } catch(exception) {
    validationErrors.push(VALIDATION_ERRORS.errorParsingJson + exception.message);
  }

  if (!argv.url) {
    validationErrors.push(VALIDATION_ERRORS.urlIsMissing);
  }

  if(validationErrors.length > 0) {
    throw Error(validationErrors.join('\n'))
  }

  return true;
}

async function getUrlPdfCli() {
  const argv = yargs
    .option("url", {
      alias: "u",
      describe: "URL to generate PDF from"
    })
    .option("writePath", {
      alias: "w",
      describe: "path to filesystem location where generated PDF file should be created, if parameter is supplied"
    })
    .option("raw", {
      alias: "r",
      type: "boolean",
      describe: "if present, contents of the PDF will be written to standard out"
    })
    .option("optionOverridesFile", {
      alias: "o",
      describe: "path to json file containing overrides to default pdf print parameters"
    })
    .check(validatePdfCliArgs)
    .help().argv;

  try {
    const browser = await puppeteer.launch();
    var pdfContents = await getUrlPdf(
      browser,
      argv.url,
      argv.writePath,
      argv.optionOverrides && parseJsonFile(argv.optionOverrides)
    )
    if (argv.raw) {
      process.stdout.write(pdfContents);
    }
    await browser.close();
    process.exit(0);
  } catch(exception) {
    process.stderr.write(exception.message + '\n');
    process.exit(1);
  }
}

module.exports = {GOTO_PDF_OPTIONS, DEFAULT_PRINT_OPTIONS, getUrlPdf, getUrlPdfCli, validatePdfCliArgs};
