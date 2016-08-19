import {PermissionsJson} from "../../content/json/PermissionsJson";
import {Equitable} from "../../Equitable";
import {Cloneable} from "../../Cloneable";
import {AccessControlEntryJson} from "./AccessControlEntryJson";
import {AccessControlEntry} from "./AccessControlEntry";
import {ObjectHelper} from "../../ObjectHelper";
import {PrincipalKey} from "../PrincipalKey";

export class AccessControlList implements Equitable, Cloneable {

        private entries: {[key: string]: AccessControlEntry};

        constructor(entries?: AccessControlEntry[]) {
            this.entries = {};
            if (entries) {
                this.addAll(entries);
            }
        }

        getEntries(): AccessControlEntry[] {
            var values = [];
            for (var key in this.entries) {
                if (this.entries.hasOwnProperty(key)) {
                    values.push(this.entries[key]);
                }
            }
            return values;
        }

        getEntry(principalKey: PrincipalKey): AccessControlEntry {
            return this.entries[principalKey.toString()];
        }

        add(entry: AccessControlEntry): void {
            this.entries[entry.getPrincipalKey().toString()] = entry;
        }

        addAll(entries: AccessControlEntry[]): void {
            entries.forEach((entry) => {
                this.entries[entry.getPrincipalKey().toString()] = entry;
            });
        }

        contains(principalKey: PrincipalKey): boolean {
            return this.entries.hasOwnProperty(principalKey.toString());
        }

        remove(principalKey: PrincipalKey): void {
            delete this.entries[principalKey.toString()];
        }

        toJson(): AccessControlEntryJson[] {
            var acl: AccessControlEntryJson[] = [];
            this.getEntries().forEach((entry: AccessControlEntry) => {
                var entryJson = entry.toJson();
                acl.push(entryJson);
            });
            return acl;
        }

        toString(): string {
            return '[' + this.getEntries().map((ace) => ace.toString()).join(', ') + ']';
        }

        equals(o: Equitable): boolean {

            if (!ObjectHelper.iFrameSafeInstanceOf(o, AccessControlList)) {
                return false;
            }

            var other = <AccessControlList>o;
            return ObjectHelper.arrayEquals(this.getEntries().sort(), other.getEntries().sort());
        }

        clone(): AccessControlList {
            var entries: AccessControlEntry[] = [];
            for (var key in this.entries) {
                if (this.entries.hasOwnProperty(key)) {
                    entries.push(this.entries[key].clone());
                }
            }
            return new AccessControlList(entries);
        }

        static fromJson(json: PermissionsJson): AccessControlList {
            var acl = new AccessControlList();
            json.permissions.forEach((entryJson: AccessControlEntryJson) => {
                var entry = AccessControlEntry.fromJson(entryJson);
                acl.add(entry);
            });
            return acl;
        }
    }
