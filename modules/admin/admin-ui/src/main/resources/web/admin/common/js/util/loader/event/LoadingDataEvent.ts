import {LoaderEvent} from "./LoaderEvent";

export class LoadingDataEvent extends LoaderEvent {

        private postLoad: boolean;

        constructor(postLoad: boolean = false) {
            super();
            this.postLoad = postLoad;
        }

        isPostLoad(): boolean {
            return this.postLoad;
        }
    }
