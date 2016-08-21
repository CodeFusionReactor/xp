import {OrderExpr} from "../../query/expr/OrderExpr";
import {FieldOrderExpr} from "../../query/expr/FieldOrderExpr";
import {OrderDirection} from "../../query/expr/OrderDirection";
import {FieldExpr} from "../../query/expr/FieldExpr";
import {Expression} from "../../query/expr/Expression";
import {QueryField} from "../../query/QueryField";
import {QueryExpr} from "../../query/expr/QueryExpr";
import {ContentSummaryJson} from "../json/ContentSummaryJson";
import {ContentId} from "../ContentId";
import {Expand} from "../../rest/Expand";
import {PathMatchExpressionBuilder} from "../../query/PathMatchExpression";
import {Path} from "../../rest/Path";
import {JsonResponse} from "../../rest/JsonResponse";
import {ContentSummary} from "../ContentSummary";
import {ContentResourceRequest} from "./ContentResourceRequest";
import {ContentQueryResultJson} from "../json/ContentQueryResultJson";

export class ContentSelectorQueryRequest extends ContentResourceRequest<ContentQueryResultJson<ContentSummaryJson>, ContentSummary[]> {

        public static DEFAULT_SIZE = 15;

        public static MODIFIED_TIME_DESC = new FieldOrderExpr(new FieldExpr("modifiedTime"), OrderDirection.DESC);

        public static SCORE_DESC = new FieldOrderExpr(new FieldExpr("_score"), OrderDirection.DESC);

        public static DEFAULT_ORDER: OrderExpr[] = [ContentSelectorQueryRequest.SCORE_DESC, ContentSelectorQueryRequest.MODIFIED_TIME_DESC];

        private queryExpr: QueryExpr;

        private from: number = 0;

        private size: number = ContentSelectorQueryRequest.DEFAULT_SIZE;

        private expand: Expand = Expand.SUMMARY;

        private content: ContentSummary;

        private inputName: string;

        private contentTypeNames: string[] = [];

        private allowedContentPaths: string[] = [];

        private relationshipType: string;

        private loaded: boolean;

        private results: ContentSummary[] = [];

        constructor() {
            super();
            super.setMethod("POST");

            this.setQueryExpr();
        }

        setInputName(name: string) {
            this.inputName = name;
        }

        getInputName(): string {
            return this.inputName;
        }

        setContent(content: ContentSummary) {
            this.content = content;
            this.setQueryExpr();
        }

        getContent(): ContentSummary {
            return this.content;
        }

        setFrom(from: number) {
            this.from = from;
        }

        getFrom(): number {
            return this.from;
        }

        setSize(size: number) {
            this.size = size;
        }

        getSize(): number {
            return this.size;
        }

        setContentTypeNames(contentTypeNames: string[]) {
            this.contentTypeNames = contentTypeNames
        }

        setAllowedContentPaths(allowedContentPaths: string[]) {
            this.allowedContentPaths = allowedContentPaths;
        }

        setRelationshipType(relationshipType: string) {
            this.relationshipType = relationshipType;
        }

        setQueryExpr(searchString: string = "") {
            var fulltextExpression = this.createSearchExpression(searchString);

            this.queryExpr = new QueryExpr(fulltextExpression, ContentSelectorQueryRequest.DEFAULT_ORDER);
        }

        private createSearchExpression(searchString): Expression {
            return new PathMatchExpressionBuilder()
                .setSearchString(searchString)
                .setPath(this.content ? this.content.getPath().toString() : "")
                .addField(new QueryField(QueryField.DISPLAY_NAME, 5))
                .addField(new QueryField(QueryField.NAME, 3))
                .addField(new QueryField(QueryField.ALL))
                .build();
        }

        getQueryExpr(): QueryExpr {
            return this.queryExpr;
        }

        getRequestPath(): Path {
            return Path.fromParent(super.getResourcePath(), "selectorQuery");
        }

        isPartiallyLoaded(): boolean {
            return this.results.length > 0 && !this.loaded;
        }

        isLoaded(): boolean {
            return this.loaded;
        }

        resetParams() {
            this.from = 0;
            this.loaded = false;
        }

        getParams(): Object {
            var queryExprAsString = this.getQueryExpr() ? this.getQueryExpr().toString() : "";

            return {
                queryExpr: queryExprAsString,
                from: this.getFrom(),
                size: this.getSize(),
                expand: this.expandAsString(),
                contentId: this.content.getId().toString(),
                inputName: this.getInputName(),
                contentTypeNames: this.contentTypeNames,
                allowedContentPaths: this.allowedContentPaths,
                relationshipType: this.relationshipType
            };
        }

        sendAndParse(): wemQ.Promise<ContentSummary[]> {

            return this.send().then((response: JsonResponse<ContentQueryResultJson<ContentSummaryJson>>) => {

                var responseResult: ContentQueryResultJson<ContentSummaryJson> = response.getResult();

                var contentsAsJson: ContentSummaryJson[] = responseResult.contents;

                var contentSummaries: ContentSummary[] = <any[]> this.fromJsonToContentSummaryArray(
                    <ContentSummaryJson[]>contentsAsJson);

                if (this.from === 0) {
                    this.results = [];
                }
                this.from += responseResult.metadata["hits"];
                this.loaded = this.from >= responseResult.metadata["totalHits"];

                this.results = this.results.concat(contentSummaries);

                return this.results;
            });
        }

        private expandAsString(): string {
            switch (this.expand) {
            case Expand.FULL:
                return "full";
            case Expand.SUMMARY:
                return "summary";
            case Expand.NONE:
                return "none";
            default:
                return "summary";
            }
        }
    }
