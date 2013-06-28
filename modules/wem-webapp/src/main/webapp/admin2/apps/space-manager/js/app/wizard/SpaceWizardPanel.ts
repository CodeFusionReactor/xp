module app_wizard {

    export class SpaceWizardPanel extends api_app_wizard.WizardPanel {

        private static DEFAULT_SPACE_ICON_URL:string = "/admin/rest/space/image/_";

        private closeAction:api_ui.Action;

        private saveAction:api_ui.Action;

        private duplicateAction:api_ui.Action;

        private deleteAction:api_ui.Action;

        private formIcon:api_app_wizard.FormIcon;

        private toolbar:SpaceWizardToolbar;

        private spaceForm:SpaceForm;

        private schemaPanel:api_ui.Panel;

        private modulesPanel:api_ui.Panel;

        private templatesPanel:api_ui.Panel;

        constructor(id:string) {

            this.formIcon = new api_app_wizard.FormIcon(SpaceWizardPanel.DEFAULT_SPACE_ICON_URL, "Click to upload icon", "rest/upload");

            this.closeAction = new CloseSpacePanelAction(this, true);
            this.saveAction = new SaveSpaceAction();
            this.saveAction.addExecutionListener(this.handleSaveAction);

            this.duplicateAction = new DuplicateSpaceAction();
            this.deleteAction = new DeleteSpaceAction();

            this.toolbar = new SpaceWizardToolbar({
                saveAction: this.saveAction,
                duplicateAction: this.duplicateAction,
                deleteAction: this.deleteAction,
                closeAction: this.closeAction
            });

            super({
                formIcon: this.formIcon,
                toolbar: this.toolbar
            });

            this.setDisplayName("New Space");
            this.setName(id);

            this.spaceForm = new SpaceForm();

            this.schemaPanel = new api_ui.Panel("schemaPanel");
            var h1El = new api_dom.H1El();
            h1El.getEl().setInnerHtml("TODO: schema");
            this.schemaPanel.appendChild(h1El);

            this.modulesPanel = new api_ui.Panel("modulesPanel");
            h1El = new api_dom.H1El();
            h1El.getEl().setInnerHtml("TODO: modules");
            this.modulesPanel.appendChild(h1El);

            this.templatesPanel = new api_ui.Panel("templatesPanel");
            h1El = new api_dom.H1El();
            h1El.getEl().setInnerHtml("TODO: templates");
            this.templatesPanel.appendChild(h1El);

            this.addStep(new api_app_wizard.WizardStep("Space", this.spaceForm));
            this.addStep(new api_app_wizard.WizardStep("Schemas", this.schemaPanel));
            this.addStep(new api_app_wizard.WizardStep("Modules", this.modulesPanel));
            this.addStep(new api_app_wizard.WizardStep("Templates", this.templatesPanel));
        }

        setData(result:api_remote.RemoteCallSpaceGetResult) {
            this.setDisplayName(result.space.displayName);
            this.setName(result.space.name);
            this.formIcon.setSrc(result.space.iconUrl);
        }

        private handleSaveAction() {
            console.log("SpacwWizardPanel.handleSaveAction");
        }
    }
}