import {Equitable} from "../Equitable";
import {ObjectHelper} from "../ObjectHelper";
import {ClassHelper} from "../ClassHelper";
import {Value} from "./Value";

export class ValueType implements Equitable {

        private name: string;

        constructor(name: string) {
            this.name = name;
        }

        toString(): string {
            return this.name;
        }

        valueToString(value: Value): string {
            return String(value.getObject());
        }

        valueToBoolean(value: Value): boolean {
            return value.getString() == "true";
        }

        valueToNumber(value: Value): number {
            return Number(value.getObject());
        }

        isValid(value: any): boolean {
            return true;
        }

        isConvertible(value: string): boolean {
            return true;
        }

        newValue(value: string): Value {
            return new Value(value, this);
        }

        newNullValue(): Value {
            return new Value(null, this);
        }

        equals(o: Equitable): boolean {

            if (!ObjectHelper.iFrameSafeInstanceOf(o, ValueType)) {
                return false;
            }

            var other = <ValueType>o;

            if (!ObjectHelper.stringEquals(this.name, other.name)) {
                return false;
            }

            return true;
        }

        valueEquals(a: any, b: any): boolean {
            throw new Error("Must be implemented by inheritor: " + ClassHelper.getClassName(this));
        }

        /**
         * Returns the actual object backing this Value.
         * If the REST service or JSON would not understand this value, then override and return compatible value.
         */
        toJsonValue(value: Value): any {
            return value.getObject();
        }

        fromJsonValue(jsonValue: any): Value {
            if (jsonValue) {
                return this.newValue(jsonValue.toString());
            }
            else if ("" == jsonValue) { // NB: empty string is not true in Javascript
                return this.newValue(jsonValue);
            }
            else {
                return this.newNullValue();
            }
        }

    }
