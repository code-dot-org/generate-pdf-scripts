const puppeteer = require("puppeteer");

DEFAULT_PRINT_OPTIONS = {
  format: "Letter",
  margin: {
    top: "0.5in",
    bottom: "0.5in",
    right: "0.5in",
    left: "0.5in"
  }
}

async function getUrlPdf(browser, url, outputPath, optionOverrides) {
  let pdfOptions = optionOverrides || DEFAULT_PRINT_OPTIONS;

  pdfOptions.path = outputPath;

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" })
  return await page.pdf(pdfOptions)
}

async function getUrlPdfCli() {
  function parseOptionOverridesParam(optionOverridesParam) {
    try {
      return optionOverridesParam && JSON.parse(optionOverridesParam);
    } catch(exception) {
      throw Error("Error parsing option ovverides as JSON: " + exception.message);
    }
  }
  const argv = require("yargs")
    .option("url", {
      alias: "u",
      describe: "URL to generate PDF from"
    })
    .option("writePath", {
      alias: "w",
      describe: "path where generated PDF file should be created, if parameter is supplied"
    })
    .option("optionOverrides", {
      alias: "o",
      describe: "json representing overrides to default pdf print parameters"
    })
    .demandOption(
      ["url" ],
      "Please provide required url argument "
    )
    .help().argv;

  try {
    const optionOverrides = parseOptionOverridesParam(argv.optionOverrides);
    const browser = await puppeteer.launch();
    var pdfContents = await getUrlPdf(browser, argv.url, argv.outputPath, argv.optionOverrides)
    process.stdout.write(pdfContents);
    await browser.close();
    process.exit(0);
  } catch(exception) {
    process.stderr.write(exception.message + '\n');
    process.exit(1);
  }
}

module.exports = {getUrlPdf, getUrlPdfCli}
