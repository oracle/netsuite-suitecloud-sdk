export default class OperationResult {

    status: string;
    resultMessage: string;
    errorCode: string;
    errorMessages: Array<string>;
    data: any

    constructor(status: string, resultMessage: string, errorCode: string, errorMessages: Array<string>, data: any) {
        this.status = status;
        this.resultMessage = resultMessage;
        this.errorCode = errorCode;
        this.errorMessages = errorMessages;
        this.data;
    }
}