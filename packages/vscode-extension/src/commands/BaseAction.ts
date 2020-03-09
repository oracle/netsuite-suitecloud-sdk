import SuiteCloudRunner from "../core/SuiteCloudRunner";
import { MessageService } from "../service/MessageService";

export default abstract class BaseAction {
    commandName!: string;
    async abstract execute(opts: {
        suiteCloudRunner: SuiteCloudRunner,
        messageService: MessageService
    }): Promise<void>;
}