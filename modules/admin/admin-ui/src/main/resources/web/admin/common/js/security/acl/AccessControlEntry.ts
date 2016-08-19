import {ArrayHelper} from "../../util/ArrayHelper";
import {Principal} from "../Principal";
import {Equitable} from "../../Equitable";
import {Cloneable} from "../../Cloneable";
import {assertNotNull} from "../../util/Assert";
import {ObjectHelper} from "../../ObjectHelper";
import {AccessControlEntryJson} from "./AccessControlEntryJson";
import {PrincipalKey} from "../PrincipalKey";
import {Permission} from "./Permission";

export class AccessControlEntry implements Equitable, Cloneable {

        private static ALL_PERMISSIONS: Permission[] = [Permission.READ, Permission.CREATE, Permission.MODIFY, Permission.DELETE,
            Permission.PUBLISH,
            Permission.READ_PERMISSIONS, Permission.WRITE_PERMISSIONS
        ];

        private principal: Principal;

        private allowedPermissions: Permission[];

        private deniedPermissions: Permission[];

        constructor(principal: Principal) {
            this.principal = assertNotNull(principal);
            this.allowedPermissions = [];
            this.deniedPermissions = [];
        }

        getPrincipal(): Principal {
            return this.principal;
        }

        getPrincipalKey(): PrincipalKey {
            return this.principal.getKey();
        }

        getPrincipalDisplayName(): string {
            return this.principal.getDisplayName();
        }

        getPrincipalTypeName(): string {
            return this.principal.getTypeName();
        }

        getAllowedPermissions(): Permission[] {
            return this.allowedPermissions;
        }

        getDeniedPermissions(): Permission[] {
            return this.deniedPermissions;
        }

        setAllowedPermissions(permissions: Permission[]): void {
            this.allowedPermissions = permissions;
        }

        setDeniedPermissions(permissions: Permission[]): void {
            this.deniedPermissions = permissions;
        }

        isAllowed(permission: Permission): boolean {
            return (this.allowedPermissions.indexOf(permission) > -1) && (this.deniedPermissions.indexOf(permission) === -1);
        }

        isDenied(permission: Permission): boolean {
            return !this.isAllowed(permission);
        }

        isSet(permission: Permission): boolean {
            return (this.allowedPermissions.indexOf(permission) > -1) || (this.deniedPermissions.indexOf(permission) > -1);
        }

        allow(permission: Permission): AccessControlEntry {
            ArrayHelper.addUnique(permission, this.allowedPermissions);
            ArrayHelper.removeValue(permission, this.deniedPermissions);
            return this;
        }

        deny(permission: Permission): AccessControlEntry {
            ArrayHelper.addUnique(permission, this.deniedPermissions);
            ArrayHelper.removeValue(permission, this.allowedPermissions);
            return this;
        }

        remove(permission: Permission): AccessControlEntry {
            ArrayHelper.removeValue(permission, this.allowedPermissions);
            ArrayHelper.removeValue(permission, this.deniedPermissions);
            return this;
        }

        equals(o: Equitable): boolean {

            if (!ObjectHelper.iFrameSafeInstanceOf(o, AccessControlEntry)) {
                return false;
            }

            var other = <AccessControlEntry>o;

            if (!ObjectHelper.equals(this.getPrincipalKey(), other.getPrincipalKey())) {
                return false;
            }

            if (!ObjectHelper.anyArrayEquals(this.allowedPermissions, other.allowedPermissions)) {
                return false;
            }

            if (!ObjectHelper.anyArrayEquals(this.deniedPermissions, other.deniedPermissions)) {
                return false;
            }
            return true;
        }

        toString(): string {
            var values = '';
            AccessControlEntry.ALL_PERMISSIONS.forEach((permission: Permission) => {
                if (this.isSet(permission)) {
                    if (values !== '') {
                        values += ', ';
                    }
                    values += this.isAllowed(permission) ? '+' : '-';
                    values += Permission[permission].toUpperCase();
                }
            });
            return this.getPrincipalKey().toString() + '[' + values + ']';
        }

        clone(): AccessControlEntry {
            var ace = new AccessControlEntry(this.principal.clone());
            ace.allowedPermissions = this.allowedPermissions.slice(0);
            ace.deniedPermissions = this.deniedPermissions.slice(0);
            return ace;
        }

        toJson(): AccessControlEntryJson {
            return {
                "principal": this.principal.toJson(),
                "allow": this.allowedPermissions.map((perm) => Permission[perm]),
                "deny": this.deniedPermissions.map((perm) => Permission[perm])
            };
        }

        static fromJson(json: AccessControlEntryJson): AccessControlEntry {
            var ace = new AccessControlEntry(Principal.fromJson(json.principal));
            var allow: Permission[] = json.allow.map((permStr) => Permission[permStr.toUpperCase()]);
            var deny: Permission[] = json.deny.map((permStr) => Permission[permStr.toUpperCase()]);
            ace.setAllowedPermissions(allow);
            ace.setDeniedPermissions(deny);
            return ace;
        }
    }

