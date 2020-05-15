import SuiteCloudRunner from "../core/SuiteCloudRunner";
import MessageService from "../service/MessageService";

export type ActionOptions = { 
    suiteCloudRunner: SuiteCloudRunner;
    messageService: MessageService;
}

export interface ActionInterface {
    run(): Promise<void>;
}