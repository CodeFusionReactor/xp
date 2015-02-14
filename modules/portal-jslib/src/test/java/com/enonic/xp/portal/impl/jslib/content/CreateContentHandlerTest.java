package com.enonic.xp.portal.impl.jslib.content;

import java.time.Instant;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.content.ContentId;
import com.enonic.xp.core.content.ContentService;
import com.enonic.xp.core.content.CreateContentParams;
import com.enonic.xp.core.content.Metadatas;
import com.enonic.xp.core.schema.mixin.Mixin;
import com.enonic.xp.core.schema.mixin.MixinService;
import com.enonic.xp.core.security.PrincipalKey;
import com.enonic.xp.portal.script.command.CommandHandler;
import com.enonic.xp.portal.impl.jslib.AbstractHandlerTest;

public class CreateContentHandlerTest
    extends AbstractHandlerTest
{
    private ContentService contentService;

    private MixinService mixinService;

    @Override
    protected CommandHandler createHandler()
        throws Exception
    {
        this.contentService = Mockito.mock( ContentService.class );
        this.mixinService = Mockito.mock( MixinService.class );

        final CreateContentHandler handler = new CreateContentHandler();
        handler.setContentService( this.contentService );
        handler.setMixinService( this.mixinService );

        return handler;
    }

    @Test
    public void createContent()
        throws Exception
    {
        Mockito.when( this.contentService.create( Mockito.any( CreateContentParams.class ) ) ).thenAnswer(
            mock -> createContent( (CreateContentParams) mock.getArguments()[0] ) );

        final Mixin metaMixin = Mixin.newMixin().name( "mymodule:test" ).build();

        Mockito.when( this.mixinService.getByLocalName( Mockito.eq( "test" ) ) ).thenReturn( metaMixin );

        execute( "createContent" );
    }

    private Content createContent( final CreateContentParams params )
    {
        final Content.Builder builder = Content.newContent();
        builder.id( ContentId.from( "123456" ) );
        builder.name( params.getName() );
        builder.parentPath( params.getParent() );
        builder.displayName( params.getDisplayName() );
        builder.valid( params.isRequireValid() );
        builder.type( params.getType() );
        builder.data( params.getData() );
        builder.creator( PrincipalKey.ofAnonymous() );
        builder.createdTime( Instant.parse( "1975-01-08T00:00:00Z" ) );

        if ( params.getMetadata() != null )
        {
            builder.metadata( Metadatas.from( params.getMetadata() ) );
        }

        return builder.build();
    }
}
