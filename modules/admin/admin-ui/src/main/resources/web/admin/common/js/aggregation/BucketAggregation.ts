import {Bucket} from "./Bucket";
import {BucketAggregationJson} from "./BucketAggregationJson";
import {BucketWrapperJson} from "./BucketWrapperJson";
import {BucketFactory} from "./BucketFactory";
import {Aggregation} from "./Aggregation";

export class BucketAggregation extends Aggregation {

        private buckets: Bucket[] = [];

        constructor(name: string) {
            super(name);
        }

        public getBucketByName(name: string): Bucket {
            for (var i = 0; i < this.buckets.length; i++) {
                var bucket: Bucket = this.buckets[i];
                if (bucket.getKey() == name) {
                    return bucket;
                }
            }
            return null;
        }

        public
            getBuckets(): Bucket[] {
            return this.buckets;
        }

        public
            addBucket(bucket: Bucket) {
            this.buckets.push(bucket);
        }

        public static
            fromJson(json: BucketAggregationJson): BucketAggregation {

            var bucketAggregation: BucketAggregation = new BucketAggregation(json.name);

            json.buckets.forEach((bucketWrapper: BucketWrapperJson) => {
                bucketAggregation.addBucket(BucketFactory.createFromJson(bucketWrapper));
            })

            return bucketAggregation;
        }
    }
