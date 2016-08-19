import {Equitable} from "../Equitable";
import {Cloneable} from "../Cloneable";
import {ClassHelper} from "../ClassHelper";
import {assert} from "../util/Assert";
import {ObjectHelper} from "../ObjectHelper";
import {DateTime} from "../util/DateTime";
import {LocalDate} from "../util/LocalDate";
import {LocalDateTime} from "../util/LocalDateTime";
import {LocalTime} from "../util/LocalTime";
import {GeoPoint} from "../util/GeoPoint";
import {BinaryReference} from "../util/BinaryReference";
import {Reference} from "../util/Reference";
import {Link} from "../util/Link";
import {PropertySet} from "./PropertySet";
import {ValueType} from "./ValueType";
import {ValueTypes} from "./ValueTypes";

export class Value implements Equitable, Cloneable {

        private type: ValueType;

        private value: Object = null;

        constructor(value: Object, type: ValueType) {
            this.value = value;
            this.type = type;
            if (value) {
                var isValid = this.type.isValid(value);
                if (isValid == undefined) {
                    throw new Error(ClassHelper.getClassName(this.type) + ".isValid() did not return any value: " + isValid);
                }
                if (isValid == false) {
                    throw new Error("Invalid value for type " + type.toString() + ": " + value);
                }
            }
        }

        getType(): ValueType {
            return this.type;
        }

        isNotNull(): boolean {
            return !this.isNull();
        }

        isNull(): boolean {
            return this.value == null || this.value == undefined;
        }

        getObject(): Object {
            return this.value;
        }

        getString(): string {
            if (this.isNull()) {
                return null;
            }
            return this.type.valueToString(this);
        }

        isPropertySet(): boolean {
            return ValueTypes.DATA.toString() == this.type.toString();
        }

        getPropertySet(): PropertySet {
            if (this.isNull()) {
                return null;
            }

            assert(ObjectHelper.iFrameSafeInstanceOf(this.value, PropertySet),
                "Expected value to be a PropertySet: " + ClassHelper.getClassName(this.value));

            return <PropertySet>this.value;
        }

        getBoolean(): boolean {
            if (this.isNull()) {
                return null;
            }
            return this.type.valueToBoolean(this);
        }

        getLong(): number {
            if (this.isNull()) {
                return null;
            }
            return this.type.valueToNumber(this);
        }

        getDouble(): number {
            if (this.isNull()) {
                return null;
            }
            return this.type.valueToNumber(this);
        }

        getDateTime(): DateTime {
            if (this.isNull()) {
                return null;
            }
            return <DateTime>this.value;
        }

        getLocalDate(): LocalDate {
            if (this.isNull()) {
                return null;
            }
            return <LocalDate>this.value;
        }

         getLocalDateTime(): LocalDateTime {
            if (this.isNull()) {
                return null;
            }
            return <LocalDateTime>this.value;
        }

        getLocalTime(): LocalTime {
            if (this.isNull()) {
                return null;
            }
            return <LocalTime>this.value;
        }

        getGeoPoint(): GeoPoint {
            if (this.isNull()) {
                return null;
            }
            return <GeoPoint>this.value;
        }

        getBinaryReference(): BinaryReference {
            if (this.isNull()) {
                return null;
            }
            return <BinaryReference>this.value;
        }

        getReference(): Reference {
            if (this.isNull()) {
                return null;
            }
            return <Reference>this.value;
        }

        getLink(): Link {
            if (this.isNull()) {
                return null;
            }
            return <Link>this.value;
        }

        equals(o: Equitable): boolean {

            if (!ObjectHelper.iFrameSafeInstanceOf(o, Value)) {
                return false;
            }

            var other = <Value>o;

            if (!ObjectHelper.equals(this.type, other.type)) {
                return false;
            }

            return this.type.valueEquals(this.value, other.value);
        }

        clone(): Value {

            return new Value(this.value, this.type);
        }
    }
