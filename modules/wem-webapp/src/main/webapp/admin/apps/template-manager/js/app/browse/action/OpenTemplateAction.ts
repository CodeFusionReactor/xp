module app.browse.action
{
    export class OpenTemplateAction extends api.ui.Action {

        constructor()
        {
            super( "Open" );
            this.addExecutionListener( () => {
                console.log( "open template action" );
            } );
        }

    }
}