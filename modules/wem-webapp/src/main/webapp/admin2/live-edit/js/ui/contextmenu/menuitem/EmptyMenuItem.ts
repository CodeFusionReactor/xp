module LiveEdit.ui.contextmenu.menuitem {

    // Uses
    var $ = $liveEdit;

    export class EmptyMenuItem extends LiveEdit.ui.contextmenu.menuitem.BaseMenuItem {

        menu = null;

        constructor(menu) {
            super({
                text: 'Empty',
                name: 'clear',
                handler: (event:Event) => {
                    this.onEmptyRegion();
                    event.stopPropagation();
                }
            }, menu);

            this.menu = menu;
        }

        private onEmptyRegion() {
            var region:JQuery = this.menu.selectedComponent.getElement();

            LiveEdit.component.Selection.deSelect();

            $('[data-live-edit-type]', region).remove();

            $(window).trigger('componentRemoved.liveEdit');
        }
    }
}