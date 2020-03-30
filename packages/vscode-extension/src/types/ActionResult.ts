export default interface ActionResult {
	status: string;
	resultMessage: string;
	errorMessages: string[];
	data: any;
}
