export default interface OperationResult {

    status: string;
    resultMessage: string;
    errorCode: string;
    errorMessages: string[];
    data: any;
}