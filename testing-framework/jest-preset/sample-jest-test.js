import Suitelet from "SuiteScripts/Suitelet";
import Record from "InternalRecord";
import Sublist from "Sublist";
import record from "N/record";

jest.mock("InternalRecord");
jest.mock("Sublist");
jest.mock("N/record");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Suitelet", () => {
    it("it has onRequest method", () => {
        // given
        record.create.mockReturnValue(Record);
        Record.getSublist.mockReturnValue(Sublist);
        Sublist.getName.mockReturnValue("MyName");

        expect(Suitelet.onRequest).toBeTruthy();
    });

    it("onRequest method has called record.create, Record.commitLine, Record.getSublist and Sublist.getName", () => {
        // given
        record.create.mockReturnValue(Record);
        Record.getSublist.mockReturnValue(Sublist);
        Sublist.getName.mockReturnValue("MyName");

        // when
        Suitelet.onRequest();

        // then
        expect(record.create).toHaveBeenCalled();
        expect(Record.commitLine).toHaveBeenCalled();
        expect(Record.getSublist).toHaveBeenCalled();
        expect(Sublist.getName).toHaveBeenCalled();
        expect(Sublist.getName()).toEqual("MyName");
    });
});
