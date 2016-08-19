import {ContentJson} from "../json/ContentJson";
import {Path} from "../../rest/Path";
import {JsonResponse} from "../../rest/JsonResponse";
import {Content} from "../Content";
import {ContentId} from "../ContentId";
import {ContentResourceRequest} from "./ContentResourceRequest";

export class GetContentByIdRequest extends ContentResourceRequest<ContentJson, Content> {

        private id: ContentId;

        private expand: string;

        constructor(id: ContentId) {
            super();
            super.setMethod("GET");
            this.id = id;
        }

        public setExpand(expand: string): GetContentByIdRequest {
            this.expand = expand;
            return this;
        }

        getParams(): Object {
            return {
                id: this.id.toString(),
                expand: this.expand
            };
        }

        getRequestPath(): Path {
            return super.getResourcePath();
        }

        sendAndParse(): wemQ.Promise<Content> {

            return this.send().then((response: JsonResponse<ContentJson>) => {
                return this.fromJsonToContent(response.getResult());
            });
        }
    }
