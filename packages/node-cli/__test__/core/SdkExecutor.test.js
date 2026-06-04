const SdkExecutor = require('../../src/SdkExecutor');

describe('SdkExecutor _splitParameters(value)', () => {
	let sdkExecutor;

	beforeEach(() => {
		sdkExecutor = new SdkExecutor('fake-sdk-path.jar');
	});

	it('should return an empty array when value is undefined', () => {
		expect(sdkExecutor._splitParameters(undefined)).toStrictEqual([]);
	});

	it('should return an empty array when value is null', () => {
		expect(sdkExecutor._splitParameters(null)).toStrictEqual([]);
	});

	it('should return an empty array when value is an empty string', () => {
		expect(sdkExecutor._splitParameters('')).toStrictEqual([]);
	});

	it('should return an empty array when value contains only whitespace', () => {
		expect(sdkExecutor._splitParameters('   ')).toStrictEqual([]);
	});

	it('should split values separated by whitespace', () => {
		expect(sdkExecutor._splitParameters('one two three')).toStrictEqual(['one', 'two', 'three']);
	});

	it('should preserve double-quoted groups as a single value', () => {
		expect(sdkExecutor._splitParameters('one "two three" four')).toStrictEqual(['one', '"two three"', 'four']);
	});

	it('should return a single double-quoted group as one value', () => {
		expect(sdkExecutor._splitParameters('"one two"')).toStrictEqual(['"one two"']);
	});

	it('should trim outer whitespace before splitting', () => {
		expect(sdkExecutor._splitParameters('  one  "two three"   four  ')).toStrictEqual(['one', '"two three"', 'four']);
	});

	it('should return the original value when the quoted group is unterminated', () => {
		expect(sdkExecutor._splitParameters('abc "unterminated')).toStrictEqual(['abc "unterminated']);
	});

	it('should return the original value when quotes appear in an invalid token', () => {
		expect(sdkExecutor._splitParameters('abc "bad"quote')).toStrictEqual(['abc "bad"quote']);
	});
});