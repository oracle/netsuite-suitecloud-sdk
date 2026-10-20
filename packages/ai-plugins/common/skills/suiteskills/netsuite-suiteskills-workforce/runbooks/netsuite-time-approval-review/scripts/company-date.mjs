import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';

const OFFSET_TIMESTAMP =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const DATE_LOCALE = 'en-US-u-ca-gregory-nu-latn';
const NUMERIC_OFFSET_TIME_ZONE = /^[+-]\d{2}:\d{2}$/u;

const ERROR_MESSAGES = Object.freeze({
  CLI_ARGUMENTS_INVALID: 'Expected exactly --time-zone <IANA timezone>.',
  COMPANY_TIMEZONE_REQUIRED: 'Company timezone is required.',
  COMPANY_TIMEZONE_INVALID: 'Company timezone is invalid.',
  SOURCE_INSTANT_FORMAT: 'Source instant must be an ISO timestamp with a timezone offset.',
  SOURCE_INSTANT_INVALID: 'Source instant is invalid.',
  COMPANY_DATE_DERIVATION_FAILED: 'Company-local date could not be derived.',
  CLOCK_INVALID: 'Clock must return a valid Date.',
});

class CompanyDateError extends Error {
  constructor(code) {
    super(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.COMPANY_DATE_DERIVATION_FAILED);
    this.name = 'CompanyDateError';
    this.code = code;
  }
}

function createFormatter(companyTimeZone) {
  try {
    const formatter = new Intl.DateTimeFormat(DATE_LOCALE, {
      timeZone: companyTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const resolvedTimeZone = formatter.resolvedOptions().timeZone;
    if (typeof resolvedTimeZone !== 'string' || NUMERIC_OFFSET_TIME_ZONE.test(resolvedTimeZone)) {
      throw new CompanyDateError('COMPANY_TIMEZONE_INVALID');
    }
    return formatter;
  } catch {
    throw new CompanyDateError('COMPANY_TIMEZONE_INVALID');
  }
}

function isGregorianDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export function deriveCompanyLocalDate(companyTimeZone, sourceInstant) {
  if (typeof companyTimeZone !== 'string' || companyTimeZone.trim() === '') {
    throw new CompanyDateError('COMPANY_TIMEZONE_REQUIRED');
  }
  const timestampMatch = typeof sourceInstant === 'string'
    ? OFFSET_TIMESTAMP.exec(sourceInstant)
    : null;
  if (!timestampMatch) {
    throw new CompanyDateError('SOURCE_INSTANT_FORMAT');
  }

  const { year, month, day } = timestampMatch.groups;
  if (!isGregorianDate(Number(year), Number(month), Number(day))) {
    throw new CompanyDateError('SOURCE_INSTANT_INVALID');
  }

  const instant = new Date(sourceInstant);
  if (Number.isNaN(instant.getTime())) {
    throw new CompanyDateError('SOURCE_INSTANT_INVALID');
  }

  const formatter = createFormatter(companyTimeZone);
  try {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(instant)
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value]),
    );
    if (!parts.year || !parts.month || !parts.day) {
      throw new CompanyDateError('COMPANY_DATE_DERIVATION_FAILED');
    }
    const companyLocalDate = [parts.year, parts.month, parts.day]
      .map((part, index) => part.padStart(index === 0 ? 4 : 2, '0'))
      .join('-');

    return {
      sourceInstant,
      companyTimeZone,
      companyLocalDate,
    };
  } catch (error) {
    if (error instanceof CompanyDateError) throw error;
    throw new CompanyDateError('COMPANY_DATE_DERIVATION_FAILED');
  }
}

export function captureCompanyLocalDate(companyTimeZone, now = () => new Date()) {
  if (typeof now !== 'function') {
    throw new CompanyDateError('CLOCK_INVALID');
  }
  const captured = now();
  if (!(captured instanceof Date) || Number.isNaN(captured.getTime())) {
    throw new CompanyDateError('CLOCK_INVALID');
  }
  const sourceInstant = captured.toISOString();
  return deriveCompanyLocalDate(companyTimeZone, sourceInstant);
}

function parseCliArguments(argumentsList) {
  if (argumentsList.length !== 2 || argumentsList[0] !== '--time-zone') {
    throw new CompanyDateError('CLI_ARGUMENTS_INVALID');
  }
  return argumentsList[1];
}

function runCli() {
  try {
    const companyTimeZone = parseCliArguments(process.argv.slice(2));
    const evidence = captureCompanyLocalDate(companyTimeZone);
    process.stdout.write(`${JSON.stringify(evidence)}\n`);
  } catch (error) {
    const code = error instanceof CompanyDateError ? error.code : 'COMPANY_DATE_DERIVATION_FAILED';
    const message = error instanceof CompanyDateError
      ? error.message
      : ERROR_MESSAGES.COMPANY_DATE_DERIVATION_FAILED;
    process.stderr.write(`${code}: ${message}\n`);
    process.exitCode = 1;
  }
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMainModule()) {
  runCli();
}
