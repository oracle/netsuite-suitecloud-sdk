const SUPPORTED_SCHEMA_VERSION = '5.0';
const REQUIRED_METRIC_KEYS = new Set([
  'pendingEntries',
  'pendingHours',
  'entriesWithExceptions',
  'entriesWithReviewItems',
]);
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const OWNER_ID = /^-?[1-9][0-9]*$/;
const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const NATIVE_APPROVAL_LIMIT_COVERAGE_KEY = 'native-approval-limit-validation';
const NATIVE_APPROVAL_LIMIT_LABEL = 'Native approval limit validation';
const NATIVE_APPROVAL_LIMIT_SPECS = Object.freeze({
  disabled: Object.freeze({
    status: 'not-configured',
    warningPolicy: 'disabled-native-enforcement',
    summary: 'Native limit validation is not enforced during approval actions. This review still performs daily and weekly limit checks.',
  }),
  enabled: Object.freeze({
    status: 'complete',
    warningPolicy: 'none',
    summary: 'Native limit validation runs during Approve.',
  }),
  missing: Object.freeze({
    status: 'unavailable',
    warningPolicy: 'unknown-native-enforcement',
    summary: 'Native approval limit validation status is unavailable; this review still performs daily and weekly limit checks.',
  }),
  malformed: Object.freeze({
    status: 'unavailable',
    warningPolicy: 'unknown-native-enforcement',
    summary: 'Native approval limit validation status is unavailable; this review still performs daily and weekly limit checks.',
  }),
  unknown: Object.freeze({
    status: 'unavailable',
    warningPolicy: 'unknown-native-enforcement',
    summary: 'Native approval limit validation status is unavailable; this review still performs daily and weekly limit checks.',
  }),
});

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function schemaError(path, message) {
  throw new Error(`Dashboard model validation failed at ${path}: ${message}`);
}

function nativeApprovalLimitCoverageForState(preferenceState) {
  const spec = NATIVE_APPROVAL_LIMIT_SPECS[preferenceState];
  if (!spec) throw new Error(`Unsupported native approval limit preference state: ${preferenceState}`);
  return {
    key: NATIVE_APPROVAL_LIMIT_COVERAGE_KEY,
    label: NATIVE_APPROVAL_LIMIT_LABEL,
    ...spec,
    preferenceState,
    gatesReviewChecks: false,
  };
}

/**
 * Derive the dashboard coverage item from the raw CompanyPreference value.
 * Exact F/T values are the only known states; absent, malformed, and unknown
 * values never imply that native approval validation is disabled.
 */
export function deriveNativeApprovalLimitCoverage(preferenceValue) {
  let preferenceState;
  if (preferenceValue === undefined) {
    preferenceState = 'missing';
  } else if (typeof preferenceValue !== 'string' || preferenceValue.length === 0 || preferenceValue.trim() !== preferenceValue) {
    preferenceState = 'malformed';
  } else if (preferenceValue === 'F') {
    preferenceState = 'disabled';
  } else if (preferenceValue === 'T') {
    preferenceState = 'enabled';
  } else {
    preferenceState = 'unknown';
  }
  return nativeApprovalLimitCoverageForState(preferenceState);
}

function resolveReference(rootSchema, reference) {
  if (!reference.startsWith('#/')) {
    throw new Error(`Unsupported dashboard schema reference: ${reference}`);
  }
  return reference.slice(2).split('/').reduce((current, part) => {
    const key = part.replaceAll('~1', '/').replaceAll('~0', '~');
    return current?.[key];
  }, rootSchema);
}

function matchesType(value, type) {
  switch (type) {
    case 'null':
      return value === null;
    case 'object':
      return isObject(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    default:
      return false;
  }
}

function isValidDateOnly(value) {
  const match = DATE_ONLY.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidTimestamp(value) {
  return ISO_TIMESTAMP.test(value) && Number.isFinite(Date.parse(value));
}

function validateFormat(value, format, path) {
  if (format === 'date-only' && !isValidDateOnly(value)) {
    schemaError(path, 'must be a valid YYYY-MM-DD business date');
  }
  if (format === 'date-time' && !isValidTimestamp(value)) {
    schemaError(path, 'must be an ISO timestamp with a time-zone offset');
  }
}

function validateAgainstSchema(value, schema, rootSchema, path) {
  if (schema?.$ref) {
    const referencedSchema = resolveReference(rootSchema, schema.$ref);
    if (!referencedSchema) schemaError(path, `schema reference ${schema.$ref} was not found`);
    validateAgainstSchema(value, referencedSchema, rootSchema, path);
    return;
  }

  if (schema?.oneOf) {
    const matches = [];
    const failures = [];
    for (const option of schema.oneOf) {
      try {
        validateAgainstSchema(value, option, rootSchema, path);
        matches.push(option);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
    if (matches.length === 1) return;
    if (matches.length > 1) schemaError(path, 'must match exactly one schema (multiple schemas matched)');
    schemaError(path, `must match exactly one schema (${failures.join('; ')})`);
  }

  if (schema?.anyOf) {
    for (const option of schema.anyOf) {
      try {
        validateAgainstSchema(value, option, rootSchema, path);
        return;
      } catch {
        // Try the remaining alternatives.
      }
    }
    schemaError(path, 'must match at least one schema');
  }

  if (schema?.allOf) {
    for (const option of schema.allOf) validateAgainstSchema(value, option, rootSchema, path);
  }
  if (schema?.if) {
    let conditionMatched = true;
    try {
      validateAgainstSchema(value, schema.if, rootSchema, path);
    } catch {
      conditionMatched = false;
    }
    const conditionalSchema = conditionMatched ? schema.then : schema.else;
    if (conditionalSchema) validateAgainstSchema(value, conditionalSchema, rootSchema, path);
  }

  if (schema?.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(value, type))) {
      schemaError(path, `must be ${types.join(' or ')}`);
    }
  }
  if (Object.hasOwn(schema ?? {}, 'const') && !Object.is(value, schema.const)) {
    schemaError(path, `must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema?.enum && !schema.enum.some((candidate) => Object.is(candidate, value))) {
    schemaError(path, `must be one of ${schema.enum.join(', ')}`);
  }

  if (typeof value === 'string') {
    if (schema?.minLength !== undefined && value.length < schema.minLength) {
      schemaError(path, `must contain at least ${schema.minLength} characters`);
    }
    if (schema?.pattern && !(new RegExp(schema.pattern).test(value))) {
      schemaError(path, `must match ${schema.pattern}`);
    }
    if (schema?.format) validateFormat(value, schema.format, path);
  }

  if (typeof value === 'number' && schema?.minimum !== undefined && value < schema.minimum) {
    schemaError(path, `must be at least ${schema.minimum}`);
  }
  if (typeof value === 'number' && schema?.maximum !== undefined && value > schema.maximum) {
    schemaError(path, `must be at most ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema?.minItems !== undefined && value.length < schema.minItems) {
      schemaError(path, `must contain at least ${schema.minItems} items`);
    }
    if (schema?.items) {
      value.forEach((item, index) => validateAgainstSchema(item, schema.items, rootSchema, `${path}[${index}]`));
    }
  }

  if (isObject(value)) {
    for (const requiredProperty of schema?.required ?? []) {
      if (!Object.hasOwn(value, requiredProperty)) {
        schemaError(path, `is missing required property ${requiredProperty}`);
      }
    }
    const properties = schema?.properties ?? {};
    if (schema?.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) schemaError(`${path}.${key}`, 'is not supported');
      }
    }
    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        validateAgainstSchema(value[key], propertySchema, rootSchema, `${path}.${key}`);
      }
    }
  }
}

function canonicalToken(value, path, label) {
  const stringValue = String(value);
  const canonical = stringValue.trim();
  if (!canonical) schemaError(path, `${label} must not be empty`);
  if (stringValue !== canonical) schemaError(path, `${label} must not have leading or trailing whitespace`);
  return canonical;
}

function duplicate(set, value, path, message) {
  if (set.has(value)) schemaError(path, message);
  set.add(value);
}

function durationToMinutes(hours) {
  return Math.round(hours * 60);
}

function validateFindingShape(finding, path, { embeddedEntryId } = {}) {
  const findingId = canonicalToken(finding.id, `${path}.id`, 'finding id');
  if (finding.scope === 'owner' && (typeof finding.internalId !== 'string' || !OWNER_ID.test(finding.internalId))) {
    schemaError(`${path}.internalId`, 'must be a canonical nonzero signed base-10 string');
  }
  if (finding.scope === 'week') {
    if (embeddedEntryId !== undefined) {
      schemaError(path, 'week-scoped findings must be top-level; embedded entry findings must be record-backed');
    }
    canonicalToken(finding.reviewGroupKey, `${path}.reviewGroupKey`, 'reviewGroupKey');
  } else {
    const expectedRecordType = {
      entry: 'timebill',
      timesheet: 'timesheet',
      owner: 'owner',
    }[finding.scope];
    if (String(finding.recordType) !== expectedRecordType) {
      schemaError(path, 'record-backed finding recordType must match its scope');
    }
    const findingTargetId = canonicalToken(finding.internalId, `${path}.internalId`, 'finding internalId');
    if (embeddedEntryId !== undefined) {
      if (finding.scope !== 'entry') schemaError(path, 'embedded entry findings must have entry scope');
      if (findingTargetId !== embeddedEntryId) schemaError(path, 'entry finding internalId must match its entry');
    }
  }
  for (const [index, entryId] of (finding.affectedEntryIds ?? []).entries()) {
    canonicalToken(entryId, `${path}.affectedEntryIds[${index}]`, 'affected entry id');
  }
  return findingId;
}

const CALENDAR_WEEKDAYS = new Set(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
const DAILY_CALENDAR_CHECKS = new Set(['entry-minimum', 'working-day-minimum', 'working-day-maximum']);
const DAILY_POPULATION_CHECKS = new Set([...DAILY_CALENDAR_CHECKS, 'daily-over-24-hours']);
const WORKING_DAY_CHECKS = new Set(['working-day-minimum', 'working-day-maximum']);
const WEEKLY_CALENDAR_CHECKS = new Set(['weekly-minimum', 'weekly-maximum']);
const NON_THRESHOLD_CALENDAR_CHECKS = new Set(['daily-over-24-hours', 'missing-weekly-time', 'holiday-or-non-working-day']);
const POPULATION_ONLY_CHECKS = new Set(['daily-over-24-hours']);
const CALENDAR_DATE_CHECKS = new Set(['missing-weekly-time', 'holiday-or-non-working-day']);
const THRESHOLD_CALENDAR_CHECKS = new Set([...DAILY_CALENDAR_CHECKS, ...WEEKLY_CALENDAR_CHECKS]);
const CALENDAR_CHECK_IDS = new Set([...THRESHOLD_CALENDAR_CHECKS, ...NON_THRESHOLD_CALENDAR_CHECKS]);
const MAXIMUM_CHECKS = new Set(['working-day-maximum', 'weekly-maximum']);
const MINIMUM_CHECKS = new Set(['entry-minimum', 'working-day-minimum', 'weekly-minimum']);

const VENDOR_TIME_THRESHOLD_APPLICABILITY_KEY = 'vendor-time-threshold-applicability';
const VENDOR_TIME_CHECKS = new Set([
  ...THRESHOLD_CALENDAR_CHECKS,
  'daily-over-24-hours',
  'holiday-or-non-working-day',
]);

function validateVendorTimeThresholdApplicability(model) {
  const items = model.checkCoverage.filter((item) =>
    item.key === VENDOR_TIME_THRESHOLD_APPLICABILITY_KEY);
  const hasVerifiedVendors = model.owners.some((owner) =>
    owner.ownerKind === 'vendor' && owner.identityCoverage.status === 'complete');
  if (items.length > 1 || (hasVerifiedVendors && items.length !== 1)) {
    schemaError('$.checkCoverage',
      `must contain exactly one ${VENDOR_TIME_THRESHOLD_APPLICABILITY_KEY} item when verified vendors are present, and no duplicate items`);
  }
  if (items.length === 0) return null;
  const item = items[0];
  const expectedStatus = item.preferenceState === 'enabled' ? 'complete'
    : item.preferenceState === 'disabled' ? 'not-configured'
      : ['missing', 'malformed', 'unknown'].includes(item.preferenceState) ? 'unavailable'
        : null;
  if (expectedStatus === null) {
    schemaError(`$.checkCoverage.${VENDOR_TIME_THRESHOLD_APPLICABILITY_KEY}.preferenceState`,
      'must contain an explicit enabled, disabled, missing, malformed, or unknown preference state');
  }
  if (item.status !== expectedStatus) {
    schemaError(`$.checkCoverage.${VENDOR_TIME_THRESHOLD_APPLICABILITY_KEY}.status`,
      `must be ${expectedStatus} for the ${item.preferenceState} preference state`);
  }
  return item.preferenceState;
}

function vendorCheckClassification(ownerKind, preferenceState, checkId) {
  if (ownerKind !== 'vendor' || !VENDOR_TIME_CHECKS.has(checkId) || preferenceState === 'enabled') {
    return null;
  }
  return preferenceState === 'disabled' ? 'not-configured' : 'could-not-check';
}

function requireSafeReason(value, path, label) {
  if (typeof value !== 'string' || !value.trim()) schemaError(path, `${label} must be a nonblank safe reason`);
  canonicalToken(value, path, label);
}

function observedMinutesMentioned(text, minutes) {
  if (typeof text !== 'string' || minutes === null) return false;
  return new RegExp(`(?<![0-9])${String(minutes)}(?![0-9])`).test(text);
}

function dateInPeriod(date, period) {
  return date >= period.startDate && date <= period.endDate;
}

function validatePopulationEvidence(evidence, threshold, path) {
  if (evidence === null) return;
  const reviewGroupKey = evidence.reviewGroupKey ?? null;
  if (evidence.checkId !== threshold.checkId) schemaError(`${path}.checkId`, 'must match its registered calendar check');
  if (DAILY_POPULATION_CHECKS.has(threshold.checkId) && evidence.date === null) {
    schemaError(`${path}.date`, 'daily population evidence requires a business date');
  }
  if (!DAILY_POPULATION_CHECKS.has(threshold.checkId) && evidence.date !== null) {
    schemaError(`${path}.date`, 'weekly population evidence must not claim a daily business date');
  }
  if (DAILY_POPULATION_CHECKS.has(threshold.checkId) && reviewGroupKey !== null) {
    schemaError(`${path}.reviewGroupKey`, 'daily population evidence must not claim a review group key');
  }
  if (!DAILY_POPULATION_CHECKS.has(threshold.checkId) && !reviewGroupKey) {
    schemaError(`${path}.reviewGroupKey`, 'weekly population evidence requires a review group key');
  }
  if (evidence.populationCoverage === 'complete' && (evidence.basis !== 'exact' || evidence.observedMinutes === null)) {
    schemaError(path, 'complete population evidence requires exact basis and an observed value');
  }
  if (evidence.populationCoverage === 'partial' && (evidence.basis !== 'lower-bound' || evidence.observedMinutes === null)) {
    schemaError(path, 'partial population evidence requires lower-bound basis and an observed value');
  }
  if (evidence.populationCoverage === 'unavailable') {
    if (evidence.basis !== null || evidence.observedMinutes !== null || evidence.conclusion !== 'inconclusive') {
      schemaError(path, 'unavailable population evidence requires null basis/value and inconclusive conclusion');
    }
    requireSafeReason(evidence.reason, `${path}.reason`, 'population evidence reason');
    return;
  }
  if (evidence.basis === 'lower-bound' && evidence.populationCoverage !== 'partial') {
    schemaError(`${path}.populationCoverage`, 'lower-bound evidence requires partial population coverage');
  }
  let expectedConclusion = 'inconclusive';
  const exactCoverage = evidence.populationCoverage === 'complete';
  if (MAXIMUM_CHECKS.has(threshold.checkId)) {
    expectedConclusion = evidence.observedMinutes > threshold.minutes ? 'maximum-violation' : exactCoverage ? 'maximum-satisfied' : 'inconclusive';
  } else if (MINIMUM_CHECKS.has(threshold.checkId)) {
    expectedConclusion = evidence.observedMinutes >= threshold.minutes ? 'minimum-satisfied' : exactCoverage ? 'minimum-violation' : 'inconclusive';
  } else if (threshold.checkId === 'daily-over-24-hours') {
    expectedConclusion = evidence.observedMinutes > 1440 ? 'over-24-violation' : exactCoverage ? 'under-24-satisfied' : 'inconclusive';
  }
  if (evidence.conclusion !== expectedConclusion) schemaError(path, `conclusion must be derived as ${expectedConclusion}`);
  if (evidence.conclusion === 'inconclusive') requireSafeReason(evidence.reason, `${path}.reason`, 'inconclusive evidence reason');
  if (evidence.conclusion !== 'inconclusive' && evidence.reason !== null) {
    schemaError(`${path}.reason`, 'approved conclusions must not contain an inconclusive reason');
  }
}

function validateCalendarReview(calendarReview, path, ownerKind, vendorPreferenceState) {
  const hasCalendarEvidence = calendarReview.calendarCoverage !== 'unavailable';
  const hasHolidayEvidence = calendarReview.holidayCoverage !== 'unavailable';
  if (ownerKind === 'unknown' && (calendarReview.source !== null || calendarReview.calendarCoverage === 'complete')) {
    schemaError(path, 'unknown owners must not claim resolved assigned or default calendar facts');
  }
  const checkIds = new Set();
  for (const [index, checkId] of calendarReview.checkIds.entries()) {
    duplicate(checkIds, checkId, `${path}.checkIds`, `contains duplicate check ID ${checkId}`);
  }
  const aggregate = calendarReview.aggregateCoverage;
  if (aggregate.status === 'complete') {
    if (aggregate.reason !== null) schemaError(`${path}.aggregateCoverage.reason`, 'complete aggregate coverage must have a null reason');
  } else {
    requireSafeReason(aggregate.reason, `${path}.aggregateCoverage.reason`, 'aggregate coverage reason');
  }
  if ((hasCalendarEvidence || hasHolidayEvidence) && calendarReview.retrievedAt === null) {
    schemaError(`${path}.retrievedAt`, 'retrieved evidence requires a non-null timestamp');
  }
  if (calendarReview.calendarCoverage === 'unavailable') {
    if (calendarReview.source !== null || calendarReview.workHoursPerDay !== null || calendarReview.configuredWorkingWeekdays !== null || calendarReview.configuredWorkingWeekdayCount !== null) {
      schemaError(path, 'unavailable calendar evidence must not claim a resolved source or calendar values');
    }
  }
  if (calendarReview.calendarCoverage === 'complete') {
    if (calendarReview.source === null) schemaError(`${path}.source`, 'must identify assigned or default when calendar coverage is complete');
    if (calendarReview.workHoursPerDay === null) schemaError(`${path}.workHoursPerDay`, 'must be available when calendar coverage is complete');
    if (calendarReview.configuredWorkingWeekdays === null || calendarReview.configuredWorkingWeekdayCount === null) {
      schemaError(`${path}.configuredWorkingWeekdays`, 'must be available when calendar coverage is complete');
    }
  }
  if (calendarReview.holidayCoverage === 'complete' && calendarReview.calendarCoverage !== 'complete') {
    schemaError(`${path}.holidayCoverage`, 'complete holiday coverage requires complete calendar coverage');
  }

  const weekdays = calendarReview.configuredWorkingWeekdays;
  if (weekdays === null) {
    if (calendarReview.configuredWorkingWeekdayCount !== null) schemaError(`${path}.configuredWorkingWeekdayCount`, 'must be null when configured weekdays are unavailable');
  } else {
    const seenWeekdays = new Set();
    for (const [index, weekday] of weekdays.entries()) {
      if (!CALENDAR_WEEKDAYS.has(weekday)) schemaError(`${path}.configuredWorkingWeekdays[${index}]`, 'must be a supported weekday');
      duplicate(seenWeekdays, weekday, `${path}.configuredWorkingWeekdays`, `contains duplicate configured weekday ${weekday}`);
    }
    if (calendarReview.configuredWorkingWeekdayCount !== weekdays.length) {
      schemaError(`${path}.configuredWorkingWeekdayCount`, 'must equal configuredWorkingWeekdays.length');
    }
  }

  const factDates = new Set();
  for (const [index, fact] of calendarReview.dateFacts.entries()) {
    const factPath = `${path}.dateFacts[${index}]`;
    duplicate(factDates, fact.date, `${path}.dateFacts`, `contains duplicate date ${fact.date}`);
    if (fact.coverage === 'complete') {
      if (calendarReview.calendarCoverage !== 'complete' || calendarReview.holidayCoverage !== 'complete') {
        schemaError(factPath, 'complete date facts require complete calendar and holiday coverage');
      }
      if (fact.configuredWorkingWeekday === null || fact.holiday === null || fact.workingDay === null) {
        schemaError(factPath, 'complete date facts require configured weekday, holiday, and working-day values');
      }
      if (fact.reason !== null) schemaError(`${factPath}.reason`, 'complete date facts require a null reason');
      const expectedWorkingDay = fact.configuredWorkingWeekday && !fact.holiday;
      if (fact.workingDay !== expectedWorkingDay) schemaError(`${factPath}.workingDay`, 'must equal configuredWorkingWeekday AND NOT holiday');
    } else {
      if (fact.configuredWorkingWeekday !== null || fact.holiday !== null || fact.workingDay !== null) {
        schemaError(factPath, 'partial and unavailable date facts require null boolean values');
      }
      requireSafeReason(fact.reason, `${factPath}.reason`, 'date fact reason');
      if (fact.coverage === 'partial' && (calendarReview.calendarCoverage === 'unavailable' || calendarReview.holidayCoverage === 'unavailable')) {
        schemaError(factPath, 'partial date facts require available parent calendar and holiday coverage');
      }
      if (fact.coverage === 'unavailable' && calendarReview.calendarCoverage === 'complete' && calendarReview.holidayCoverage === 'complete') {
        schemaError(factPath, 'unavailable date facts conflict with complete parent coverage');
      }
    }
  }

  const thresholdIds = new Set();
  const dateFactsByDate = new Map(calendarReview.dateFacts.map((fact) => [fact.date, fact]));
  const minutesPerDay = calendarReview.workHoursPerDay === null ? null : Math.round(calendarReview.workHoursPerDay * 60);
  const configuredWeekdayCount = calendarReview.configuredWorkingWeekdayCount;
  for (const [index, threshold] of calendarReview.effectiveThresholds.entries()) {
    const thresholdPath = `${path}.effectiveThresholds[${index}]`;
    const sameCheck = calendarReview.effectiveThresholds.slice(0, index).filter(item => item.checkId === threshold.checkId);
    for (const prior of sameCheck) {
      if (prior.status !== threshold.status || prior.source !== threshold.source || prior.minutes !== threshold.minutes) schemaError(thresholdPath, 'repeated threshold definitions must agree');
      const identity = item => JSON.stringify([item.populationEvidence?.date ?? null, item.populationEvidence?.reviewGroupKey ?? null, item.populationEvidence?.entryId ?? null]);
      if (identity(prior) === identity(threshold)) schemaError(thresholdPath, 'duplicate threshold comparison identity');
    }
    thresholdIds.add(threshold.checkId);
    if (!checkIds.has(threshold.checkId)) schemaError(`${thresholdPath}.checkId`, 'must be listed in calendarReview.checkIds');
    if (!THRESHOLD_CALENDAR_CHECKS.has(threshold.checkId)) schemaError(`${thresholdPath}.checkId`, 'non-threshold calendar checks must not have effective thresholds');
    const vendorClassification = vendorCheckClassification(ownerKind, vendorPreferenceState, threshold.checkId);
    if (vendorClassification !== null) {
      const expectedStatus = vendorClassification === 'not-configured' ? 'not-configured' : 'unavailable';
      if (threshold.status !== expectedStatus) {
        schemaError(`${thresholdPath}.status`,
          `must be ${expectedStatus} for the vendor preference state`);
      }
    }
    if (threshold.status === 'available') {
      if (threshold.minutes === null || threshold.source === null) schemaError(thresholdPath, 'available thresholds require source and minutes');
      if (threshold.reason !== null) schemaError(`${thresholdPath}.reason`, 'available thresholds must not contain an unavailable reason');
      if (ownerKind === 'unknown') schemaError(thresholdPath, 'unknown owners cannot claim available thresholds');
      if (calendarReview.retrievedAt === null) schemaError(`${path}.retrievedAt`, 'available thresholds require a non-null retrieval timestamp');
      validatePopulationEvidence(threshold.populationEvidence, threshold, `${thresholdPath}.populationEvidence`);
      if (threshold.populationEvidence && WORKING_DAY_CHECKS.has(threshold.checkId) && threshold.populationEvidence.conclusion !== 'inconclusive') {
        const fact = dateFactsByDate.get(threshold.populationEvidence.date);
        const validDailyFact = fact && fact.coverage === 'complete' && (WORKING_DAY_CHECKS.has(threshold.checkId)
          ? fact.configuredWorkingWeekday === true && fact.holiday === false && fact.workingDay === true
          : fact.configuredWorkingWeekday !== null && fact.holiday !== null && fact.workingDay !== null);
        if (!validDailyFact) {
          schemaError(`${thresholdPath}.populationEvidence.date`, `must resolve to exactly one complete ${WORKING_DAY_CHECKS.has(threshold.checkId) ? 'working ' : ''}date fact`);
        }
      }
      if (threshold.populationEvidence && threshold.populationEvidence.populationCoverage !== 'complete' && calendarReview.aggregateCoverage.status === 'complete') {
        schemaError(`${path}.aggregateCoverage.status`, 'must preserve incomplete population evidence');
      }
      if (threshold.source === 'work-calendar') {
        if (calendarReview.calendarCoverage !== 'complete' || minutesPerDay === null || configuredWeekdayCount === null) {
          schemaError(thresholdPath, 'work-calendar thresholds require complete calendar evidence');
        }
        const expectedMinutes = DAILY_CALENDAR_CHECKS.has(threshold.checkId)
          ? minutesPerDay
          : WEEKLY_CALENDAR_CHECKS.has(threshold.checkId) ? minutesPerDay * configuredWeekdayCount : null;
        if (expectedMinutes === null || threshold.minutes !== expectedMinutes) {
          schemaError(`${thresholdPath}.minutes`, 'does not match the work-calendar threshold formula');
        }
      }
    } else {
      if (threshold.minutes !== null || threshold.source !== null || threshold.populationEvidence !== null) {
        schemaError(thresholdPath, 'not-configured and unavailable thresholds require null source, minutes, and population evidence');
      }
      requireSafeReason(threshold.reason, `${thresholdPath}.reason`, 'threshold reason');
    }
  }
  for (const [index, evidence] of calendarReview.populationEvidence.entries()) {
    const evidencePath = `${path}.populationEvidence[${index}]`;
    if (!POPULATION_ONLY_CHECKS.has(evidence.checkId)) schemaError(`${evidencePath}.checkId`, 'top-level population evidence must use a population-only calendar check ID');
    validatePopulationEvidence(evidence, { checkId: evidence.checkId, minutes: null }, evidencePath);
    // Daily duration arithmetic is independent of calendar completeness.
  }
  for (const checkId of checkIds) {
    if (THRESHOLD_CALENDAR_CHECKS.has(checkId) && !thresholdIds.has(checkId)) {
      schemaError(`${path}.effectiveThresholds`, `is missing structured threshold ${checkId}`);
    }
    // Missing calendar evidence is represented by inconclusive findings, not fabricated date facts.
  }
}

function validateModelSemantics(model) {
  const expectedGroupKind = model.scope.weeklyTimeMode === 'weekly-timesheets' ? 'timesheet' : 'week';
  const nativeApprovalLimitCoverage = model.checkCoverage.filter((check) => check.key === NATIVE_APPROVAL_LIMIT_COVERAGE_KEY);
  if (nativeApprovalLimitCoverage.length !== 1) {
    schemaError('$.checkCoverage', `must contain exactly one ${NATIVE_APPROVAL_LIMIT_COVERAGE_KEY} item after every preference retrieval attempt`);
  }
  const nativeCoverage = nativeApprovalLimitCoverage[0];
  const expectedNativeCoverage = nativeApprovalLimitCoverageForState(nativeCoverage.preferenceState);
  for (const field of ['label', 'status', 'warningPolicy', 'summary', 'gatesReviewChecks']) {
    if (!Object.is(nativeCoverage[field], expectedNativeCoverage[field])) {
      schemaError(`$.checkCoverage.${NATIVE_APPROVAL_LIMIT_COVERAGE_KEY}.${field}`, `must match the ${nativeCoverage.preferenceState} preference-state contract`);
    }
  }

  const vendorPreferenceState = validateVendorTimeThresholdApplicability(model);

  const metricKeys = new Set();
  for (const metric of model.metrics) {
    if (metricKeys.has(metric.key)) schemaError('$.metrics', `contains duplicate metric ${metric.key}`);
    metricKeys.add(metric.key);
    if (metric.status === 'unavailable' && metric.value !== null) {
      schemaError(`$.metrics.${metric.key}`, 'unavailable metrics must have a null value');
    }
    if (metric.status !== 'unavailable' && typeof metric.value !== 'number') {
      schemaError(`$.metrics.${metric.key}`, 'exact and partial metrics must have a numeric value');
    }
  }
  for (const requiredMetric of REQUIRED_METRIC_KEYS) {
    if (!metricKeys.has(requiredMetric)) schemaError('$.metrics', `is missing ${requiredMetric}`);
  }

  const ownerIds = new Set();
  const reviewGroupKeys = new Set();
  const timesheetIds = new Set();
  const entryIds = new Set();
  const findingIds = new Set();
  const weeklyFindingsById = new Map();
  const weeklyFindingOwners = new Map();
  for (const [index, finding] of model.weeklyFindings.entries()) {
    const findingId = validateFindingShape(finding, `$.weeklyFindings[${index}]`);
    duplicate(findingIds, findingId, '$.weeklyFindings', `contains duplicate finding id ${findingId}`);
    weeklyFindingsById.set(findingId, finding);
  }

  const timesheetGroups = [];
  const allEntries = [];
  for (const [ownerIndex, owner] of model.owners.entries()) {
    const ownerPath = `$.owners[${ownerIndex}]`;
    const ownerId = owner.internalId;
    if (typeof ownerId !== 'string' || !OWNER_ID.test(ownerId)) {
      schemaError(`${ownerPath}.internalId`, 'must be a canonical nonzero signed base-10 string');
    }
    duplicate(ownerIds, ownerId, '$.owners', `contains duplicate owner internalId ${ownerId}`);
    if (owner.ownerKind !== 'unknown' && owner.identityCoverage.status !== 'complete') {
      schemaError(`${ownerPath}.identityCoverage.status`, 'known owner kinds require complete identity coverage');
    }
    if (owner.ownerKind === 'unknown' && owner.identityCoverage.status === 'complete') {
      schemaError(`${ownerPath}.identityCoverage.status`, 'unknown owners must not claim complete identity coverage');
    }
    if (owner.ownerKind === 'unknown') {
      if (!owner.identityCoverage.reason) {
        schemaError(`${ownerPath}.identityCoverage.reason`, 'unknown owners require a safe identity coverage reason');
      }
      canonicalToken(owner.identityCoverage.reason, `${ownerPath}.identityCoverage.reason`, 'identity coverage reason');
    }
    const calendarReviewPath = `${ownerPath}.calendarReview`;
    if (owner.calendarReview) validateCalendarReview(owner.calendarReview, calendarReviewPath, owner.ownerKind, vendorPreferenceState);
    const ownerFindings = [];
    for (const [groupIndex, group] of owner.reviewGroups.entries()) {
      const groupPath = `${ownerPath}.reviewGroups[${groupIndex}]`;
      if (group.kind !== expectedGroupKind) {
        schemaError(`${groupPath}.kind`, `must be ${expectedGroupKind} when scope.weeklyTimeMode is ${model.scope.weeklyTimeMode}`);
      }
      const groupKey = canonicalToken(group.key, `${groupPath}.key`, 'review-group key');
      duplicate(reviewGroupKeys, groupKey, '$.owners', `contains duplicate review-group key ${groupKey}`);
      const startDate = group.period.startDate;
      const endDate = group.period.endDate;
      if (group.kind === 'timesheet') {
        const timesheetId = canonicalToken(group.internalId, `${groupPath}.internalId`, 'timesheet internalId');
        duplicate(timesheetIds, timesheetId, '$.owners', `contains duplicate timesheet internalId ${timesheetId}`);
        const expectedKey = `timesheet:${timesheetId}`;
        if (groupKey !== expectedKey) schemaError(`${groupPath}.key`, `must equal ${expectedKey}`);
        timesheetGroups.push(group);
      } else {
        const expectedKey = `week:${owner.ownerKind}:${ownerId}:${startDate}:${endDate}`;
        if (groupKey !== expectedKey) schemaError(`${groupPath}.key`, `must equal ${expectedKey}`);
      }

      const groupFindingIds = new Set();
      for (const [findingIndex, findingReference] of group.findingIds.entries()) {
        const findingId = canonicalToken(findingReference, `${groupPath}.findingIds[${findingIndex}]`, 'finding reference');
        duplicate(groupFindingIds, findingId, `${groupPath}.findingIds`, `contains duplicate finding reference ${findingId}`);
        const finding = weeklyFindingsById.get(findingId);
        if (!finding) schemaError(`${groupPath}.findingIds`, `${findingId} does not resolve to exactly one top-level weekly finding`);
        if (weeklyFindingOwners.has(findingId)) {
          schemaError(`${groupPath}.findingIds`, `weekly finding ${findingId} is referenced by multiple groups`);
        }
        weeklyFindingOwners.set(findingId, groupKey);
        for (const evidence of finding.evidence) {
          if (evidence.reviewGroupKey && evidence.reviewGroupKey !== groupKey) {
            schemaError(`${groupPath}.findingIds`, 'finding evidence reviewGroupKey must equal its containing review group');
          }
        }
        ownerFindings.push(finding);
        if (group.kind === 'timesheet') {
          if (finding.scope !== 'timesheet' && finding.scope !== 'owner') {
            schemaError(`${groupPath}.findingIds`, 'timesheet group must reference a timesheet-scoped finding');
          }
          const targetType = String(finding.recordType);
          const targetId = canonicalToken(finding.internalId, `${groupPath}.findingIds`, 'finding internalId');
          const expectedTargetType = finding.scope === 'owner' ? 'owner' : 'timesheet';
          const expectedTargetId = finding.scope === 'owner' ? ownerId : canonicalToken(group.internalId, `${groupPath}.internalId`, 'timesheet internalId');
          if (targetType !== expectedTargetType || targetId !== expectedTargetId) {
            schemaError(`${groupPath}.findingIds`, 'timesheet finding must target timesheet with matching canonical ID');
          }
        } else if (finding.scope === 'owner') {
          const targetId = canonicalToken(finding.internalId, `${groupPath}.findingIds`, 'finding internalId');
          if (finding.recordType !== 'owner' || targetId !== ownerId) {
            schemaError(`${groupPath}.findingIds`, 'owner finding must target its owning owner with matching canonical ID');
          }
        } else if (finding.scope !== 'week' || canonicalToken(finding.reviewGroupKey, `${groupPath}.findingIds`, 'reviewGroupKey') !== groupKey) {
          schemaError(`${groupPath}.findingIds`, 'week finding must target this week group by reviewGroupKey');
        }
      }

      for (const [entryIndex, entry] of group.entries.entries()) {
        const entryPath = `${groupPath}.entries[${entryIndex}]`;
        const entryId = canonicalToken(entry.internalId, `${entryPath}.internalId`, 'entry internalId');
        duplicate(entryIds, entryId, '$.owners', `contains duplicate entry internalId ${entryId}`);
        if (group.kind === 'timesheet') {
          if (!Object.hasOwn(entry, 'timesheetId')) schemaError(`${entryPath}.timesheetId`, 'is required for timesheet groups');
          const entryTimesheetId = canonicalToken(entry.timesheetId, `${entryPath}.timesheetId`, 'entry timesheetId');
          if (entryTimesheetId !== canonicalToken(group.internalId, `${groupPath}.internalId`, 'timesheet internalId')) {
            schemaError(`${entryPath}.timesheetId`, 'must match parent timesheet internalId');
          }
        } else if (Object.hasOwn(entry, 'timesheetId')) {
          schemaError(`${entryPath}.timesheetId`, 'must be omitted from week groups');
        }
        for (const [findingIndex, finding] of entry.findings.entries()) {
          const findingPath = `${entryPath}.findings[${findingIndex}]`;
          const findingId = validateFindingShape(finding, findingPath, { embeddedEntryId: entryId });
          duplicate(findingIds, findingId, '$.owners', `contains duplicate finding id ${findingId}`);
          for (const evidence of finding.evidence) {
            if (evidence.reviewGroupKey && evidence.reviewGroupKey !== groupKey) {
              schemaError(findingPath, 'finding evidence reviewGroupKey must equal its containing review group');
            }
          }
          if (finding.scope === 'entry' && (!finding.dates?.includes(entry.date) || finding.dates.length !== 1 || finding.dates[0] !== entry.date)) {
            schemaError(findingPath, 'entry finding dates must equal its containing entry date');
          }
          ownerFindings.push(finding);
        }
        allEntries.push(entry);
        if (!dateInPeriod(entry.date, group.period)) schemaError(`${entryPath}.date`, 'entry date must be within its containing review period');
      }
    }
    const structuredFindingCheckIds = new Set(ownerFindings.flatMap((finding) => finding.evidence.map((evidence) => evidence.checkId).filter(Boolean)));
    for (const checkId of structuredFindingCheckIds) {
      if (!CALENDAR_CHECK_IDS.has(checkId)) schemaError(ownerPath, `contains unsupported calendar check ID ${checkId}`);
    }
    if (structuredFindingCheckIds.size > 0 && !owner.calendarReview) {
      schemaError(ownerPath, 'calendarReview is required when calendar-dependent check IDs are evaluated');
    }
    if (owner.calendarReview) {
      const visibleMinutesByDate = new Map();
      const visibleEntryIdsByDate = new Map();
      for (const entry of owner.reviewGroups.flatMap((group) => group.entries)) {
        const minutes = durationToMinutes(entry.hours);
        visibleMinutesByDate.set(entry.date, (visibleMinutesByDate.get(entry.date) ?? 0) + minutes);
        if (!visibleEntryIdsByDate.has(entry.date)) visibleEntryIdsByDate.set(entry.date, new Set());
        visibleEntryIdsByDate.get(entry.date).add(String(entry.internalId));
      }
      for (const checkId of structuredFindingCheckIds) {
        if (!owner.calendarReview.checkIds.includes(checkId)) schemaError(calendarReviewPath, `must include finding check ID ${checkId}`);
      }
      // A complete individual check may pass while other checks are incomplete.
      // Overall resource readiness still derives from aggregateCoverage.
      for (const finding of ownerFindings) {
        for (const evidence of finding.evidence) {
          const vendorClassification = vendorCheckClassification(
            owner.ownerKind, vendorPreferenceState, evidence.checkId);
          if (vendorClassification !== null && finding.classification !== vendorClassification) {
            schemaError(`${ownerPath}.reviewGroups`,
              `finding ${evidence.checkId} must use ${vendorClassification} for the vendor preference state`);
          }
          const requiresDateFacts = vendorClassification === null && (CALENDAR_DATE_CHECKS.has(evidence.checkId) || WORKING_DAY_CHECKS.has(evidence.checkId)) && finding.classification !== 'could-not-check' && finding.classification !== 'not-configured';
          if (requiresDateFacts && evidence.checkId && CALENDAR_DATE_CHECKS.has(evidence.checkId) &&
              evidence.coverage === 'unavailable' && owner.calendarReview.calendarCoverage === 'complete' &&
              owner.calendarReview.holidayCoverage === 'complete') {
            schemaError(`${ownerPath}.reviewGroups`,
              'unavailable calendar-date finding conflicts with complete calendar evidence');
          }
          if (evidence.checkId && evidence.date) {
            if (requiresDateFacts) {
              const dateFact = owner.calendarReview.dateFacts.find((fact) => fact.date === evidence.date);
              if (!dateFact || dateFact.coverage !== 'complete') {
                schemaError(`${ownerPath}.reviewGroups`, `finding ${evidence.checkId} requires a complete date fact`);
              }
              if (evidence.checkId === 'missing-weekly-time' &&
                  (!['week', 'timesheet'].includes(finding.scope) ||
                   !finding.dates?.includes(evidence.date) || dateFact.workingDay !== true)) {
                schemaError(`${ownerPath}.reviewGroups`,
                  'missing-weekly-time finding must target a complete working business date');
              }
              if (evidence.checkId === 'holiday-or-non-working-day') {
                const provesViolation = dateFact.holiday === true || dateFact.workingDay === false;
                if (!provesViolation && ['exception', 'review-item'].includes(finding.classification)) {
                  schemaError(`${ownerPath}.reviewGroups`,
                    'holiday-or-non-working-day finding must target a holiday or non-working date');
                }
                if (provesViolation && finding.classification !== 'exception') {
                  schemaError(`${ownerPath}.reviewGroups`,
                    'holiday-or-non-working-day finding must use exception when complete date facts prove a violation');
                }
              }
            }
            const owningGroups = owner.reviewGroups.filter((group) => group.findingIds?.includes(finding.id));
            if (owningGroups.length > 0 &&
                owningGroups.some((group) => !dateInPeriod(evidence.date, group.period))) {
              schemaError(`${ownerPath}.reviewGroups`,
                `${evidence.checkId} evidence date must be within its owning review period`);
            }
          }
        }
      }
      for (const evidence of owner.calendarReview.populationEvidence) {
        const visibleMinutes = visibleMinutesByDate.get(evidence.date) ?? 0;
        if (evidence.populationCoverage === 'complete' && evidence.observedMinutes < visibleMinutes) {
          schemaError(`${calendarReviewPath}.populationEvidence`, `${evidence.checkId} exact observation cannot be below the visible date subtotal`);
        }
        if (evidence.populationCoverage === 'partial' && evidence.observedMinutes < visibleMinutes) {
          schemaError(`${calendarReviewPath}.populationEvidence`, `${evidence.checkId} lower bound cannot be below the visible date subtotal`);
        }
      }
      for (const threshold of owner.calendarReview.effectiveThresholds) {
        const evidence = threshold.populationEvidence;
        if (evidence) {
          if (!DAILY_POPULATION_CHECKS.has(threshold.checkId)) {
            const group = owner.reviewGroups.find((candidate) => candidate.key === evidence.reviewGroupKey);
            if (!group) schemaError(`${calendarReviewPath}.effectiveThresholds`, `weekly population evidence for ${threshold.checkId} must identify an owning review group`);
          }
          const linked = ownerFindings.filter((finding) => (threshold.checkId !== 'entry-minimum' || String(finding.internalId) === String(evidence.entryId)) && finding.evidence.some((item) => item.checkId === threshold.checkId && (item.date ?? null) === evidence.date && (item.reviewGroupKey ?? null) === (evidence.reviewGroupKey ?? null) && item.coverage === evidence.populationCoverage));
          const requiresFinding = evidence.populationCoverage !== 'complete' || ['maximum-violation', 'minimum-violation', 'over-24-violation', 'inconclusive'].includes(evidence.conclusion);
          if (!linked.length && requiresFinding) schemaError(`${calendarReviewPath}.effectiveThresholds`, `population evidence for ${threshold.checkId} must link to a finding with matching coverage and date`);
          const daily = DAILY_CALENDAR_CHECKS.has(threshold.checkId);
          if (daily && linked.some((finding) => finding.scope !== 'entry' || !finding.dates?.includes(evidence.date))) {
            schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} population evidence must link to an entry finding on its business date`);
          }
          if (!daily && linked.some((finding) => finding.scope === 'entry')) {
            schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} population evidence must not link only to an entry finding`);
          }
          const expectedClassification = ['maximum-violation', 'minimum-violation'].includes(evidence.conclusion) ? 'exception'
            : evidence.conclusion === 'over-24-violation' ? 'exception'
              : evidence.conclusion === 'inconclusive' || evidence.populationCoverage !== 'complete' || owner.calendarReview.aggregateCoverage.status !== 'complete' ? 'could-not-check' : 'no-issues-found';
          if (requiresFinding && !linked.some((finding) => finding.classification === expectedClassification)) {
            schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} population conclusion must link to a ${expectedClassification} finding`);
          }
          for (const finding of linked) {
            if (evidence.observedMinutes !== null && finding.evidence.some((item) => item.checkId === threshold.checkId && (item.date ?? null) === evidence.date && (item.reviewGroupKey ?? null) === (evidence.reviewGroupKey ?? null) && item.observed && !observedMinutesMentioned(item.observed, evidence.observedMinutes))) {
              schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} finding observed evidence must match population evidence`);
            }
          }
          if (DAILY_CALENDAR_CHECKS.has(threshold.checkId)) {
            const exactEntry = threshold.checkId === 'entry-minimum' ? owner.reviewGroups.flatMap(group => group.entries).find(entry => String(entry.internalId) === String(evidence.entryId) && entry.date === evidence.date) : null;
            if (threshold.checkId === 'entry-minimum' && !exactEntry) schemaError(calendarReviewPath, 'entry minimum requires the exact visible entryId and date');
            const visibleMinutes = exactEntry ? durationToMinutes(exactEntry.hours) : (visibleMinutesByDate.get(evidence.date) ?? 0);
            if (exactEntry && evidence.populationCoverage !== 'unavailable' && (evidence.populationCoverage !== 'complete' || evidence.observedMinutes !== visibleMinutes)) schemaError(calendarReviewPath, 'entry minimum must use the exact entry duration');
            if (evidence.populationCoverage === 'complete' && evidence.observedMinutes < visibleMinutes) {
              schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} exact observation cannot be below the visible date subtotal`);
            }
            if (evidence.populationCoverage === 'partial' && evidence.observedMinutes < visibleMinutes) {
              schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} lower bound cannot be below the visible date subtotal`);
            }
            if (WORKING_DAY_CHECKS.has(threshold.checkId) && requiresFinding && evidence.populationCoverage !== 'unavailable') {
              const expectedEntryIds = visibleEntryIdsByDate.get(evidence.date) ?? new Set();
              const linkedEntryIds = new Set(linked.filter((finding) => finding.scope === 'entry').map((finding) => String(finding.internalId)));
              for (const entryId of expectedEntryIds) {
                if (!linkedEntryIds.has(entryId)) schemaError(`${calendarReviewPath}.effectiveThresholds`, `${threshold.checkId} must link to every affected entry on its business date`);
              }
            }
          }
        }
      }
      for (const evidence of owner.calendarReview.populationEvidence) {
        if (vendorCheckClassification(owner.ownerKind, vendorPreferenceState, evidence.checkId) !== null) {
          continue;
        }
        if (!DAILY_POPULATION_CHECKS.has(evidence.checkId) && !owner.reviewGroups.some((group) => group.key === evidence.reviewGroupKey)) {
          schemaError(`${calendarReviewPath}.populationEvidence`, `weekly population evidence for ${evidence.checkId} must identify an owning review group`);
        }
        const linked = ownerFindings.filter((finding) => finding.evidence.some((item) => item.checkId === evidence.checkId && (item.date ?? null) === evidence.date && (item.reviewGroupKey ?? null) === (evidence.reviewGroupKey ?? null) && item.coverage === evidence.populationCoverage));
        if (evidence.observedMinutes !== null && linked.some((finding) => finding.evidence.some((item) => item.checkId === evidence.checkId && (item.date ?? null) === evidence.date && (item.reviewGroupKey ?? null) === (evidence.reviewGroupKey ?? null) && item.observed && !observedMinutesMentioned(item.observed, evidence.observedMinutes)))) {
          schemaError(`${calendarReviewPath}.populationEvidence`, `${evidence.checkId} finding observed evidence must match population evidence`);
        }
        if (!linked.length && ['maximum-violation', 'minimum-violation', 'over-24-violation', 'inconclusive'].includes(evidence.conclusion)) schemaError(`${calendarReviewPath}.populationEvidence`, `population evidence for ${evidence.checkId} must link to a finding with matching coverage and date`);
        if (evidence.checkId === 'daily-over-24-hours' && linked.some((finding) => finding.scope !== 'entry' || !finding.dates?.includes(evidence.date))) {
          schemaError(`${calendarReviewPath}.populationEvidence`, 'daily-over-24-hours evidence must link to an entry finding on its business date');
        }
        if (evidence.checkId === 'daily-over-24-hours' && evidence.conclusion === 'over-24-violation') {
          const linkedEntryIds = new Set(linked.filter((finding) => finding.scope === 'entry').map((finding) => String(finding.internalId)));
          for (const entryId of visibleEntryIdsByDate.get(evidence.date) ?? []) {
            if (!linkedEntryIds.has(entryId)) schemaError(`${calendarReviewPath}.populationEvidence`, 'daily-over-24-hours must link to every affected entry on its business date');
          }
        }
        const expectedClassification = evidence.conclusion === 'over-24-violation' ? 'exception'
          : evidence.conclusion === 'inconclusive' ? 'could-not-check' : null;
        const incorrectClassification = expectedClassification && (
          evidence.conclusion === 'over-24-violation'
            ? linked.some((finding) => finding.classification !== expectedClassification)
            : !linked.some((finding) => finding.classification === expectedClassification)
        );
        if (incorrectClassification) {
          schemaError(`${calendarReviewPath}.populationEvidence`,
            `${evidence.checkId} population conclusion must link to a ${expectedClassification} finding on every affected entry when the total exceeds 24 hours`);
        }
      }
    }
  }

  const displayed = model.paging.displayed;
  if (displayed.ownerCount !== model.owners.length) {
    schemaError('$.paging.displayed.ownerCount', 'must equal owners.length');
  }
  if (displayed.timesheetCount !== timesheetGroups.length) {
    schemaError('$.paging.displayed.timesheetCount', 'must equal the number of timesheet groups');
  }
  if (displayed.entryCount !== allEntries.length) {
    schemaError('$.paging.displayed.entryCount', 'must equal the number of displayed entries');
  }
  for (const finding of model.weeklyFindings) {
    if (finding.scope === 'owner' && !weeklyFindingOwners.has(finding.id)) {
      schemaError('$.weeklyFindings', `owner-scoped finding ${finding.id} must be referenced by an owner group`);
    }
  }
  const configuredLimitsCoverage = model.checkCoverage.find((check) => check.key === 'configured-limits');
  const availableCalendarThreshold = model.owners.some((owner) => owner.calendarReview?.effectiveThresholds.some((threshold) => threshold.status === 'available'));
  const configuredLimitFinding = [
    ...model.weeklyFindings,
    ...model.owners.flatMap((owner) => owner.reviewGroups.flatMap((group) => group.entries.flatMap((entry) => entry.findings))),
  ].some((finding) => ['exception', 'review-item'].includes(finding.classification) && finding.evidence.some((evidence) => THRESHOLD_CALENDAR_CHECKS.has(evidence.checkId)));
  if ((availableCalendarThreshold || configuredLimitFinding) && configuredLimitsCoverage?.status !== 'complete' && configuredLimitsCoverage?.status !== 'partial') {
    schemaError('$.checkCoverage.configured-limits', 'cannot claim not-configured or unavailable while configured calendar limits or findings are present');
  }
  if (model.coverage.status === 'complete' && model.paging.queue.status === 'complete' && !displayed.sampleOnly) {
    const pendingEntries = model.metrics.find((metric) => metric.key === 'pendingEntries');
    const pendingHours = model.metrics.find((metric) => metric.key === 'pendingHours');
    const exactMinutes = allEntries.reduce((total, entry) => total + durationToMinutes(entry.hours), 0);
    if (pendingEntries?.status !== 'exact' || pendingEntries.value !== allEntries.length) {
      schemaError('$.metrics.pendingEntries', 'must equal the complete displayed entry total');
    }
    if (pendingHours?.status !== 'exact' || durationToMinutes(pendingHours.value) !== exactMinutes) {
      schemaError('$.metrics.pendingHours', 'must equal the complete displayed hour total');
    }
  }
}

/**
 * Validate the model consumed by both dashboard renderers.
 *
 * The original object is returned unchanged so renderers cannot accidentally
 * normalize or recalculate business values while validating them.
 */
export function validateDashboardModel(model, schema) {
  if (!isObject(schema) || schema.type !== 'object') {
    throw new Error('Dashboard schema must declare an object root');
  }
  if (schema.properties?.schemaVersion?.const !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(`Unsupported dashboard schema version in schema: ${schema.properties?.schemaVersion?.const ?? '(missing)'}`);
  }
  if (!isObject(model)) schemaError('$', 'must be an object');
  if (model.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(`Unsupported dashboard schema version: ${model.schemaVersion ?? '(missing)'}`);
  }
  validateAgainstSchema(model, schema, schema, '$');
  validateModelSemantics(model);
  return model;
}

export { SUPPORTED_SCHEMA_VERSION };
