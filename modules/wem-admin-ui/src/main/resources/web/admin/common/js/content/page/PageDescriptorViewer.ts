module api.content.page {

    export class PageDescriptorViewer extends  api.ui.Viewer<PageDescriptor> {

        private namesAndIconView: api.app.NamesAndIconView;

        constructor() {
            super();
            this.namesAndIconView = new api.app.NamesAndIconViewBuilder()
                .setSize(api.app.NamesAndIconViewSize.small).build();
            this.namesAndIconView.setIconClass('icon-insert-template icon-large');
            this.appendChild(this.namesAndIconView);
        }

        setObject(desriptor: PageDescriptor) {
            super.setObject(desriptor);
            this.namesAndIconView.setMainName(desriptor.getDisplayName()).
                setSubName(desriptor.getName().toString());
        }

        getPreferredHeight(): number {
            return 50;
        }

    }

}