declare module "cli-spinner" {
    export class Spinner {
        constructor(message: string)
        start(): void;
        stop(clean: boolean): void;
    }
}

declare module "xml2js"