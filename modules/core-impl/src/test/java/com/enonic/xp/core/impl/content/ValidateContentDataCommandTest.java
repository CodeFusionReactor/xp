package com.enonic.xp.core.impl.content;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.form.FieldSet;
import com.enonic.xp.core.form.FormItemSet;
import com.enonic.xp.core.form.Input;
import com.enonic.xp.core.form.inputtype.InputTypes;
import com.enonic.xp.core.module.ModuleService;
import com.enonic.xp.core.schema.content.ContentType;
import com.enonic.xp.core.schema.content.ContentTypeName;
import com.enonic.xp.core.schema.content.ContentTypeService;
import com.enonic.xp.core.schema.content.GetContentTypeParams;
import com.enonic.xp.core.schema.content.validator.DataValidationErrors;
import com.enonic.xp.core.schema.mixin.MixinService;

import static com.enonic.xp.core.content.Content.newContent;
import static com.enonic.xp.core.form.FieldSet.newFieldSet;
import static com.enonic.xp.core.form.FormItemSet.newFormItemSet;
import static com.enonic.xp.core.form.Input.newInput;
import static org.junit.Assert.*;

public class ValidateContentDataCommandTest
{
    private ContentTypeService contentTypeService;

    private MixinService mixinService;

    private ModuleService moduleService;

    @Before
    public void setUp()
        throws Exception
    {
        this.contentTypeService = Mockito.mock( ContentTypeService.class );
        this.mixinService = Mockito.mock( MixinService.class );
        this.moduleService = Mockito.mock( ModuleService.class );
    }

    @Test
    public void validation_with_errors()
        throws Exception
    {
        // setup
        final ContentType contentType = ContentType.newContentType().
            superType( ContentTypeName.structured() ).
            name( "mymodule:my_type" ).
            addFormItem( FieldSet.newFieldSet().
                label( "My layout" ).
                name( "myLayout" ).
                addFormItem( FormItemSet.newFormItemSet().name( "mySet" ).required( true ).
                    addFormItem( Input.newInput().name( "myInput" ).inputType( InputTypes.TEXT_LINE ).
                        build() ).
                    build() ).
                build() ).
            build();

        Mockito.when( contentTypeService.getByName( Mockito.isA( GetContentTypeParams.class ) ) ).thenReturn( contentType );

        final Content content = Content.newContent().path( "/mycontent" ).type( contentType.getName() ).build();

        // exercise

        final DataValidationErrors result = ValidateContentDataCommand.create().
            contentData( content.getData() ).
            contentType( contentType.getName() ).
            contentTypeService( this.contentTypeService ).
            mixinService( this.mixinService ).
            moduleService( this.moduleService ).
            build().
            execute();

        // test
        assertTrue( result.hasErrors() );
        assertEquals( 1, result.size() );

    }

    @Test
    public void validation_no_errors()
        throws Exception
    {
        // setup
        final FieldSet fieldSet = newFieldSet().label( "My layout" ).name( "myLayout" ).addFormItem(
            newFormItemSet().name( "mySet" ).required( true ).addFormItem(
                newInput().name( "myInput" ).inputType( InputTypes.TEXT_LINE ).build() ).build() ).build();
        final ContentType contentType = ContentType.newContentType().
            superType( ContentTypeName.structured() ).
            name( "mymodule:my_type" ).
            addFormItem( fieldSet ).
            build();

        Mockito.when( contentTypeService.getByName( Mockito.isA( GetContentTypeParams.class ) ) ).thenReturn( contentType );

        final Content content = newContent().path( "/mycontent" ).type( contentType.getName() ).build();
        content.getData().setString( "mySet.myInput", "thing" );

        // exercise
        final DataValidationErrors result = ValidateContentDataCommand.create().
            contentData( content.getData() ).
            contentType( contentType.getName() ).
            contentTypeService( this.contentTypeService ).
            mixinService( this.mixinService ).
            moduleService( this.moduleService ).
            build().
            execute();

        // test

        assertFalse( result.hasErrors() );
        assertEquals( 0, result.size() );
    }

}
