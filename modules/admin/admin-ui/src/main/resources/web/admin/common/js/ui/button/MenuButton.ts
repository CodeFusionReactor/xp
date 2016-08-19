import {Element} from "../../dom/Element";
import {Menu} from "../menu/Menu";
import {MenuItem} from "../menu/MenuItem";
import {DivEl} from "../../dom/DivEl";
import {AppHelper} from "../../util/AppHelper";
import {Action} from "../Action";
import {ActionButton} from "./ActionButton";
import {DropdownHandle} from "./DropdownHandle";

export class MenuButton extends DivEl {

        private dropdownHandle: DropdownHandle;

        private actionButton: ActionButton;
        
        private menu: Menu;

        constructor(mainAction: Action, menuActions: Action[] = []) {
            super("menu-button");

            this.initDropdownHandle();
            this.initActionButton(mainAction);
            this.initMenu(menuActions);

            this.initListeners();

            let children = [this.dropdownHandle, this.actionButton,this.menu];
            this.appendChildren(...children);
        }

        private initDropdownHandle() {
            this.dropdownHandle = new DropdownHandle();
        }

        private initActionButton(action: Action) {
            this.actionButton = new ActionButton(action);
        }

        private initMenu(actions: Action[]) {
            this.menu = new Menu(actions);
            this.setDropdownHandleEnabled(actions.length > 0);

            let updateActionEnabled = () => {
                let allActionsDisabled = actions.every((action) => !action.isEnabled());
                this.setDropdownHandleEnabled(!allActionsDisabled);
            };

            updateActionEnabled();

            actions.forEach((action) => {
                action.onPropertyChanged(updateActionEnabled);
            });
        }

        private initListeners() {
            let hideMenu = this.hideMenu.bind(this);

            this.dropdownHandle.onClicked(() => {
                if (this.dropdownHandle.isEnabled()) {
                    this.menu.toggleClass('expanded');
                    this.dropdownHandle.toggleClass('down');
                }
            });
            
            this.menu.onItemClicked((item: MenuItem) => {
                if (this.menu.isHideOnItemClick() && item.isEnabled()) {
                    hideMenu();
                }
            });
            
            this.actionButton.onClicked(hideMenu);

            this.dropdownHandle.onClicked(() => this.dropdownHandle.giveFocus());

            this.menu.onClicked(() => this.dropdownHandle.giveFocus());

            AppHelper.focusInOut(this, hideMenu);
        }

        private hideMenu(event: MouseEvent): void {
            this.menu.removeClass('expanded');
            this.dropdownHandle.removeClass('down');
        }

        setDropdownHandleEnabled(enabled: boolean = true) {
            this.dropdownHandle.setEnabled(enabled);
            if (!enabled) {
                this.menu.removeClass('expanded');
                this.dropdownHandle.removeClass('down');
            }
        }
        
        hideDropdown(hidden: boolean = true) {
            this.toggleClass('hidden-dropdown', hidden);
        }
    }
