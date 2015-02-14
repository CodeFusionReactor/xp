package com.enonic.xp.core.impl.schema.content;

import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.core.form.Form;
import com.enonic.xp.core.form.inputtype.InputTypes;
import com.enonic.xp.core.schema.content.ContentType;
import com.enonic.xp.core.schema.content.ContentTypeName;
import com.enonic.xp.core.schema.content.ContentTypes;
import com.enonic.xp.core.schema.content.GetAllContentTypesParams;
import com.enonic.xp.core.schema.mixin.Mixin;
import com.enonic.xp.core.schema.mixin.MixinName;

import static com.enonic.xp.core.form.Form.newForm;
import static com.enonic.xp.core.form.InlineMixin.newInlineMixin;
import static com.enonic.xp.core.form.Input.newInput;
import static com.enonic.xp.core.schema.mixin.Mixin.newMixin;
import static org.junit.Assert.*;

public class ContentTypeServiceImpl_getAllTest
    extends AbstractContentTypeServiceTest
{
    @Test
    public void testGetAll()
    {
        final ContentType type1 = createContentType( "mymodule:my-contenttype-1", "DisplayName1" );
        final ContentType type2 = createContentType( "mymodule:my-contenttype-2", "DisplayName2" );

        register( type1, type2 );

        final ContentTypes result = this.service.getAll( new GetAllContentTypesParams() );
        assertEquals( 2, result.getSize() );

        verifyContentType( "mymodule:my-contenttype-1", "DisplayName1", result );
        verifyContentType( "mymodule:my-contenttype-2", "DisplayName2", result );

        unregister();

        final ContentTypes result2 = this.service.getAll( new GetAllContentTypesParams() );
        assertEquals( 0, result2.getSize() );
    }

    @Test
    public void testGetAll_inlineMixins()
        throws Exception
    {
        final String contentTypeName = "mymodule:my-contenttype-1";

        final Mixin mixin = newMixin().name( "mymodule:my_mixin" ).
            addFormItem( newInput().
                name( "inputToBeMixedIn" ).
                inputType( InputTypes.TEXT_LINE ).
                build() ).
            build();

        final Form form = newForm().addFormItem( newInlineMixin( mixin ).build() ).build();

        Mockito.when( this.mixinService.getByName( Mockito.isA( MixinName.class ) ) ).thenReturn( mixin );

        final ContentType contentType = ContentType.newContentType().
            superType( ContentTypeName.structured() ).
            name( contentTypeName ).
            displayName( "displayName" ).
            description( "description" ).
            form( form ).
            build();

        register( contentType );

        final GetAllContentTypesParams params = new GetAllContentTypesParams().inlineMixinsToFormItems( true );
        final ContentTypes result = this.service.getAll( params );

        Mockito.verify( this.mixinService, Mockito.times( 1 ) ).getByName( Mockito.isA( MixinName.class ) );
        assertEquals( 1, result.getSize() );
        assertNotNull( result.get( 0 ).form().getInput( "inputToBeMixedIn" ) );
        assertNull( result.get( 0 ).form().getFormItem( "myMixin" ) );
    }
}
