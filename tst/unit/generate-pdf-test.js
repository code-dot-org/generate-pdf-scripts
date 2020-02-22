const sinon = require('sinon')
const assert = require('assert')
const {
  DEFAULT_PRINT_OPTIONS,
  GOTO_PDF_OPTIONS,
  getUrlPdf,
  getUrlPdfCli,
  validatePdfCliArgs
} = require('../../src/generate-pdf.js')

const TEST_URL = 'https://www.wikipedia.org/';
const TEST_PATH = './out.pdf';

function browserExpectingUrlAndOptions(url, options) {
  let page = {
    goto: function() {},
    pdf: function() {}
  }
  let browser = {
    newPage: function () {
      return page;
    }
  };
  let mock = sinon.mock(page);

  mock.expects("goto").withArgs(url, GOTO_PDF_OPTIONS);
  mock.expects("pdf").withArgs(options);
  return browser;
}

describe('getUrlPdf', function() {
  it('should get pdf with no write path if none provided', function() {
    let mockBrowser = browserExpectingUrlAndOptions(TEST_URL, DEFAULT_PRINT_OPTIONS);
    getUrlPdf(mockBrowser, TEST_URL);
  });

  it('should get pdf with write path if one is provided', function() {
    let expectedOptions = Object.assign({}, DEFAULT_PRINT_OPTIONS, {path: TEST_PATH});
    let mockBrowser = browserExpectingUrlAndOptions(TEST_URL, expectedOptions);
    getUrlPdf(mockBrowser, TEST_URL, TEST_PATH)
  });

  it('should get pdf with overriden options if they are provided', function() {
    let optionOverrides = { "options": "overrRidden" };
    let mockBrowser = browserExpectingUrlAndOptions(TEST_URL, optionOverrides);
    getUrlPdf(mockBrowser, TEST_URL, undefined, optionOverrides);
  });

});

describe('validatePdfCliArgs', function() {
  it('contains reports of all validation errors on failure', function() {
    try {
      validatePdfCliArgs({ optionOverrides: `${__dirname}/test_fixtures/invalid_json.json`}) 
    } catch(error) {
      assert(error.message.includes(VALIDATION_ERRORS.mustHaveWritepathOrRaw));
      assert(error.message.includes(VALIDATION_ERRORS.errorParsingJson));
      assert(error.message.includes(VALIDATION_ERRORS.urlIsMissing));
    }
  });

  it('doesnt throw an error if input is valid', function() {
    validatePdfCliArgs({
      optionOverrides: `${__dirname}/test_fixtures/valid_json.json`,
      url: TEST_URL,
      writePath: './out.pdf',
      raw: true,
    });
  });
  
});
