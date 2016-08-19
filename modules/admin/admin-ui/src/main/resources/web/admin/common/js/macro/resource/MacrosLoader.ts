import {ApplicationEvent} from "../../application/ApplicationEvent";
import {ApplicationEventType} from "../../application/ApplicationEvent";
import {ApplicationKey} from "../../application/ApplicationKey";
import {BaseLoader} from "../../util/loader/BaseLoader";
import {MacroDescriptor} from "../MacroDescriptor";
import {GetMacrosRequest} from "./GetMacrosRequest";
import {MacrosJson} from "./MacrosJson";

export class MacrosLoader extends BaseLoader<MacrosJson, MacroDescriptor> {

        private getMacrosRequest: GetMacrosRequest;

        private hasRelevantData: boolean;

        constructor(applicationKeys: ApplicationKey[]) {
            this.getMacrosRequest = new GetMacrosRequest(applicationKeys);
            this.hasRelevantData = false;
            super(this.getMacrosRequest);

            ApplicationEvent.on((event: ApplicationEvent) => {
                if (event.getEventType() == ApplicationEventType.STARTED || event.getEventType() == ApplicationEventType.STOPPED ||
                    event.getEventType() == ApplicationEventType.UPDATED) {
                    this.invalidate();
                }
            });
        }

        private invalidate() {
            this.hasRelevantData = false;
        }

        load(): wemQ.Promise<MacroDescriptor[]> {

            this.notifyLoadingData();

            if (this.hasRelevantData) {
                this.notifyLoadedData(this.getResults());
                return wemQ(this.getResults());
            }

            return this.sendRequest()
                .then((macros: MacroDescriptor[]) => {
                    this.notifyLoadedData(macros);
                    this.hasRelevantData = true;
                    this.setResults(macros);
                    return macros;
                });
        }

        search(searchString: string): wemQ.Promise<MacroDescriptor[]> {
            if (this.hasRelevantData) {
                return super.search(searchString);
            } else {
                return this.load().then(() => {
                    return super.search(searchString);
                });
            }
        }

        filterFn(macro: MacroDescriptor) {
            return macro.getDisplayName().toLowerCase().indexOf(this.getSearchString().toLowerCase()) != -1;
        }

    }


