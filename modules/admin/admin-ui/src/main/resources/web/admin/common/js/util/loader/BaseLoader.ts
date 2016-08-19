import {LoaderEvents} from "./event/LoaderEvents";
import {LoaderEvent} from "./event/LoaderEvent";
import {LoadedDataEvent} from "./event/LoadedDataEvent";
import {LoadingDataEvent} from "./event/LoadingDataEvent";
import {ResourceRequest} from "../../rest/ResourceRequest";
import {ClassHelper} from "../../ClassHelper";
import {Comparator} from "../../Comparator";

enum LoaderStatus {
        NOT_STARTED,
        LOADING,
        LOADED
    }

    export class BaseLoader<JSON, OBJECT> {

        private request: ResourceRequest<JSON, OBJECT[]>;

        private status: LoaderStatus = LoaderStatus.NOT_STARTED;

        private results: OBJECT[];

        private searchString: string;

        private loadedDataListeners: {(event: LoadedDataEvent<OBJECT>):void}[] = [];

        private loadingDataListeners: {(event: LoadingDataEvent):void}[] = [];

        private comparator: Comparator<OBJECT>;

        constructor(request: ResourceRequest<JSON, OBJECT[]>) {
            this.setRequest(request);
        }

        sendRequest(): wemQ.Promise<OBJECT[]> {
            return this.request.sendAndParse();
        }

        load(postLoad: boolean = false): wemQ.Promise<OBJECT[]> {

            this.notifyLoadingData(postLoad);
            return this.sendRequest().then((results: OBJECT[]) => {
                this.results = results;
                if (this.comparator) {
                    try {
                        this.results = results.sort(this.comparator.compare);
                    } catch (e) {
                        console.error('Error sorting loaded elements with ' + ClassHelper.getClassName(this.comparator) + ': ', e);
                    }
                }
                this.notifyLoadedData(results, postLoad);
                return this.results;
            });
        }

        preLoad(searchString: string = ""): wemQ.Promise<OBJECT[]> {
            return this.load();
        }

        isLoading(): boolean {
            return this.status == LoaderStatus.LOADING;
        }

        isLoaded(): boolean {
            return this.status == LoaderStatus.LOADED;
        }

        isNotStarted(): boolean {
            return this.status == LoaderStatus.NOT_STARTED;
        }

        setComparator(comparator: Comparator<OBJECT>): BaseLoader<JSON, OBJECT> {
            this.comparator = comparator;
            return this;
        }

        setRequest(request: ResourceRequest<JSON, OBJECT[]>) {
            this.request = request;
        }

        getRequest(): ResourceRequest<JSON, OBJECT[]> {
            return this.request;
        }

        search(searchString: string): wemQ.Promise<OBJECT[]> {

            var deferred = wemQ.defer<OBJECT[]>();

            this.searchString = searchString;

            if (this.results) {
                var filtered = this.results.filter(this.filterFn, this);
                this.notifyLoadedData(filtered);
                deferred.resolve(this.results);
            }
            else {
                deferred.resolve(null);
            }

            return deferred.promise;
        }

        getResults(): OBJECT[] {
            return this.results;
        }

        setResults(results: OBJECT[]) {
            this.results = results;
        }

        getComparator(): Comparator<OBJECT> {
            return this.comparator;
        }

        getSearchString(): string {
            return this.searchString;
        }

        filterFn(result: OBJECT): boolean {
            throw Error("must be implemented");
        }

        notifyLoadedData(results: OBJECT[], postLoad?: boolean) {
            this.status = LoaderStatus.LOADED;
            this.loadedDataListeners.forEach((listener: (event: LoadedDataEvent<OBJECT>) => void) => {
                listener.call(this, new LoadedDataEvent<OBJECT>(results, postLoad));
            });
        }

        notifyLoadingData(postLoad?: boolean) {
            this.status = LoaderStatus.LOADING;
            this.loadingDataListeners.forEach((listener: (event: LoadingDataEvent) => void) => {
                listener.call(this, new LoadingDataEvent(postLoad));
            });
        }

        onLoadedData(listener: (event: LoadedDataEvent<OBJECT>) => void) {
            this.loadedDataListeners.push(listener);
        }

        onLoadingData(listener: (event: LoadingDataEvent) => void) {
            this.loadingDataListeners.push(listener);
        }

        unLoadedData(listener: (event: LoadedDataEvent<OBJECT>) => void) {
            this.loadedDataListeners = this.loadedDataListeners.filter((currentListener: (event: LoadedDataEvent<OBJECT>)=>void)=> {
                return currentListener != listener;
            });
        }

        unLoadingData(listener: (event: LoadingDataEvent) => void) {
            this.loadingDataListeners = this.loadingDataListeners.filter((currentListener: (event: LoadingDataEvent)=>void)=> {
                return currentListener != listener;
            });
        }

    }
