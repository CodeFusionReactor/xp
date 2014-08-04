package com.enonic.wem.portal.content.page;


import java.text.MessageFormat;

import com.enonic.wem.api.content.page.text.TextComponent;
import com.enonic.wem.api.rendering.RenderingMode;
import com.enonic.wem.portal.controller.JsContext;
import com.enonic.wem.portal.controller.JsHttpRequest;
import com.enonic.wem.portal.controller.JsHttpResponse;
import com.enonic.wem.portal.controller.JsHttpResponseSerializer;
import com.enonic.wem.portal.rendering.RenderResult;
import com.enonic.wem.portal.rendering.Renderer;


public final class TextRenderer
    implements Renderer<TextComponent>
{
    private static final String EMPTY_COMPONENT_EDIT_MODE_HTML =
        "<div data-live-edit-type=\"{0}\" data-live-edit-empty-component=\"true\" class=\"live-edit-empty-component\"></div>";

    private static final String EMPTY_COMPONENT_PREVIEW_MODE_HTML = "<div></div>";

    @Override
    public RenderResult render( final TextComponent textComponent, final JsContext context )
    {
        final RenderingMode renderingMode = getRenderingMode( context );
        final JsHttpResponse response = context.getResponse();
        response.setContentType( "text/html" );
        response.setPostProcess( false );

        if ( textComponent.getText() == null )
        {
            renderEmptyTextComponent( textComponent, context );
        }
        else
        {
            if ( renderingMode == RenderingMode.EDIT )
            {
                response.setBody( MessageFormat.format( "<div data-live-edit-type=\"{0}\">{1}</div>", textComponent.getType().toString(),
                                                        textComponent.getText() ) );
            }
            else
            {
                response.setBody( textComponent.getText() );
            }
        }

        return new JsHttpResponseSerializer( response ).serialize();
    }

    private void renderEmptyTextComponent( final TextComponent textComponent, final JsContext context )
    {
        final JsHttpResponse response = context.getResponse();
        final RenderingMode renderingMode = getRenderingMode( context );
        switch ( renderingMode )
        {
            case EDIT:
                response.setBody( MessageFormat.format( EMPTY_COMPONENT_EDIT_MODE_HTML, textComponent.getType().toString() ) );
                break;

            case PREVIEW:
                response.setBody( EMPTY_COMPONENT_PREVIEW_MODE_HTML );
                break;

            case LIVE:
                response.setBody( "" );
                break;
        }
    }

    private RenderingMode getRenderingMode( final JsContext context )
    {
        final JsHttpRequest req = context.getRequest();
        return req == null ? RenderingMode.LIVE : req.getMode();
    }
}
