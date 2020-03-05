import SuiteCloudRunner from "../core/SuiteCloudRunner";
import { MessageService } from "../service/MessageService";
import { getRootProjectFolder } from "../util/ExtensionUtil";
import CommandsMetadataSingleton from "../service/CommandsMetadataSingleton";

export default abstract class BaseAction {

    suiteCloudRunner: SuiteCloudRunner | undefined;
    executionPath: string | null;
    messageService: MessageService;

    constructor(opts: {
        messageService: MessageService
    }) {
        this.messageService = opts.messageService;
        this.executionPath = getRootProjectFolder();
        if (this.executionPath) {
            this.suiteCloudRunner = new SuiteCloudRunner(this.executionPath, CommandsMetadataSingleton.getInstance().getMetadata());
        }
        //else {
        //    this.messageService.showTriggeredActionError();
        //}
    }


	abstract execute():void;

}