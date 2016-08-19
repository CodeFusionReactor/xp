import {ApplicationKey} from "../../application/ApplicationKey";
import {ApplicationBasedName} from "../../application/ApplicationBasedName";
import {assertNotNull} from "../../util/Assert";
import {Equitable} from "../../Equitable";
import {ObjectHelper} from "../../ObjectHelper";
import {Mixin} from "./Mixin";

export class MixinName extends ApplicationBasedName {

        constructor(name:string) {
            assertNotNull(name, "Mixin name can't be null");
            var parts = name.split(ApplicationBasedName.SEPARATOR);
            super(ApplicationKey.fromString(parts[0]), parts[1]);
        }

        equals(o: Equitable): boolean {
            if (!ObjectHelper.iFrameSafeInstanceOf(o, MixinName)) {
                return false;
            }

            return super.equals(o);
        }
    }
