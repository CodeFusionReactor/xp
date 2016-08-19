import {DateTime} from "../util/DateTime";
import {ObjectHelper} from "../ObjectHelper";
import {StringHelper} from "../util/StringHelper";
import {Value} from "./Value";
import {ValueType} from "./ValueType";

export class ValueTypeDateTime extends ValueType {

        constructor() {
            super("DateTime");
        }

        isValid(value: any): boolean {
            if (ObjectHelper.iFrameSafeInstanceOf(value, DateTime)) {
                return true;
            }
            return DateTime.isValidDateTime(value);
        }

        isConvertible(value: string): boolean {
            if (StringHelper.isBlank(value)) {
                return false;
            }
            // 2010-01-01T10:55:00+01:00
            if (value.length < 19) {
                return false;
            }
            return this.isValid(value);
        }

        newValue(value: string): Value {
            if (!value) {
                return this.newNullValue();
            }
            if (!this.isConvertible(value)) {
                return this.newNullValue();
            }
            var date = DateTime.fromString(value);
            return new Value(date, this);
        }

        // 2010-01-01T10:55:00+01:00
        toJsonValue(value: Value): string {
            return value.isNull() ? null : value.getDateTime().toString();
        }

        valueToString(value: Value): string {
            return value.getDateTime().toString();
        }

        valueEquals(a: DateTime, b: DateTime): boolean {
            return ObjectHelper.equals(a, b);
        }

    }
