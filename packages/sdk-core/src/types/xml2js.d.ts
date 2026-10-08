declare module 'xml2js' {
	// xml2js builds a shape determined by both the XML document and parser options.
	// Keep the untyped boundary here; service parsers normalize it into SDK types.
	export function parseStringPromise(xml: string, options?: Record<string, unknown>): Promise<any>;
	export class Parser {
		constructor(options?: Record<string, unknown>);
		parseString(xml: string, callback: (error: Error | null, result: any) => void): void;
	}
}
