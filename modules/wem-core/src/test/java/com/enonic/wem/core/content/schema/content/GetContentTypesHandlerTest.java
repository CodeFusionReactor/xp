package com.enonic.wem.core.content.schema.content;

import javax.jcr.Session;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.wem.api.command.Commands;
import com.enonic.wem.api.command.content.schema.content.GetContentTypes;
import com.enonic.wem.api.content.schema.content.ContentType;
import com.enonic.wem.api.content.schema.content.ContentTypes;
import com.enonic.wem.api.content.schema.content.QualifiedContentTypeNames;
import com.enonic.wem.api.module.ModuleName;
import com.enonic.wem.core.command.AbstractCommandHandlerTest;
import com.enonic.wem.core.content.schema.content.dao.ContentTypeDao;

import static com.enonic.wem.api.content.schema.content.ContentType.newContentType;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

public class GetContentTypesHandlerTest
    extends AbstractCommandHandlerTest
{
    private GetContentTypesHandler handler;

    private ContentTypeDao contentTypeDao;

    @Before
    public void setUp()
        throws Exception
    {
        super.initialize();

        contentTypeDao = Mockito.mock( ContentTypeDao.class );
        handler = new GetContentTypesHandler();
        handler.setContentTypeDao( contentTypeDao );
    }

    @Test
    public void select()
        throws Exception
    {
        // setup
        final ContentType contentType = newContentType().
            name( "myContentType" ).
            module( ModuleName.from( "mymodule" ) ).
            displayName( "My content type" ).
            setAbstract( false ).
            build();
        final ContentTypes contentTypes = ContentTypes.from( contentType );
        Mockito.when( contentTypeDao.select( isA( QualifiedContentTypeNames.class ), any( Session.class ) ) ).thenReturn( contentTypes );

        // exercise
        final QualifiedContentTypeNames names = QualifiedContentTypeNames.from( "mymodule:myContentType" );
        final GetContentTypes command = Commands.contentType().get().qualifiedNames( names );
        this.handler.handle( this.context, command );

        // verify
        verify( contentTypeDao, atLeastOnce() ).select( Mockito.isA( QualifiedContentTypeNames.class ), Mockito.any( Session.class ) );
        assertEquals( 1, command.getResult().getSize() );
    }

}
