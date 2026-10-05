import record from 'N/record';
import Record from 'N/record/instance';

jest.mock('N/record');
jest.mock('N/record/instance');

beforeEach(() => {
	jest.clearAllMocks();
});

describe('Basic jest test with simple assert', () => {
	it('should assert strings are equal', () => {
		const a = 'foobar';
		const b = 'foobar';
		expect(a).toMatch(b);
	});
});

describe('Sample test with provided record module stubs', () => {
	it('should update Sales Order memo field', () => {
		// given
		const salesOrderId = 1352;
		record.load.mockReturnValue(Record);
		Record.save.mockReturnValue(salesOrderId);

		// when
		let salesOrderRecord = record.load({id: salesOrderId});
		salesOrderRecord.setValue({fieldId: 'memo', value: 'foobar'});
		const updatedSalesOrderId = salesOrderRecord.save({enableSourcing: false});

		// then
		expect(record.load).toHaveBeenCalledWith({id: salesOrderId});
		expect(Record.setValue).toHaveBeenCalledWith({fieldId: 'memo', value: 'foobar'});
		expect(Record.save).toHaveBeenCalledWith({enableSourcing: false});
		expect(salesOrderId).toBe(updatedSalesOrderId);
	});
});