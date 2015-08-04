module app.browse {

    import BrowseItem = api.app.browse.BrowseItem;
    import Application = api.application.Application;
    import ModuleViewer = api.application.ApplicationViewer;

    export class ModuleBrowseItemsSelectionPanel extends api.app.browse.BrowseItemsSelectionPanel<Application> {

        createItemViewer(item: BrowseItem<Application>): ModuleViewer  {
            var viewer = new ModuleViewer();
            viewer.setObject(item.getModel());
            return viewer;
        }

    }
}