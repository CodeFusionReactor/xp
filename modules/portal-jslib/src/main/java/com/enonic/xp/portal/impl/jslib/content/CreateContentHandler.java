package com.enonic.xp.portal.impl.jslib.content;

import java.util.Map;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.content.ContentPath;
import com.enonic.xp.core.content.ContentService;
import com.enonic.xp.core.content.CreateContentParams;
import com.enonic.xp.core.content.Metadata;
import com.enonic.xp.core.content.Metadatas;
import com.enonic.xp.core.data.PropertySet;
import com.enonic.xp.core.data.PropertyTree;
import com.enonic.xp.core.schema.content.ContentTypeName;
import com.enonic.xp.core.schema.mixin.Mixin;
import com.enonic.xp.core.schema.mixin.MixinService;
import com.enonic.xp.portal.script.command.CommandHandler;
import com.enonic.xp.portal.script.command.CommandRequest;
import com.enonic.xp.portal.impl.jslib.mapper.ContentMapper;

@Component(immediate = true)
public final class CreateContentHandler
    implements CommandHandler
{
    private ContentService contentService;

    private MixinService mixinService;

    @Override
    public String getName()
    {
        return "content.create";
    }

    @Override
    public Object execute( final CommandRequest req )
    {
        final CreateContentParams params = createParams( req );
        final Content result = this.contentService.create( params );
        return new ContentMapper( result );
    }

    private CreateContentParams createParams( final CommandRequest req )
    {
        return CreateContentParams.create().
            name( req.param( "name" ).value( String.class ) ).
            parent( contentPath( req.param( "parentPath" ).value( String.class ) ) ).
            displayName( req.param( "displayName" ).value( String.class ) ).
            requireValid( !req.param( "draft" ).value( Boolean.class ) ).
            type( contentTypeName( req.param( "contentType" ).value( String.class ) ) ).
            contentData( propertyTree( req.param( "data" ).map() ) ).
            metadata( metadatas( req.param( "x" ).map() ) ).
            build();
    }

    private ContentPath contentPath( final String value )
    {
        return value != null ? ContentPath.from( value ) : null;
    }

    private ContentTypeName contentTypeName( final String value )
    {
        return value != null ? ContentTypeName.from( value ) : null;
    }

    private PropertyTree propertyTree( final Map<?, ?> value )
    {
        if ( value == null )
        {
            return null;
        }

        final PropertyTree tree = new PropertyTree();
        applyData( tree.getRoot(), value );
        return tree;
    }

    private void applyData( final PropertySet set, final Map<?, ?> value )
    {
        for ( final Map.Entry<?, ?> entry : value.entrySet() )
        {
            final String name = entry.getKey().toString();
            final Object item = entry.getValue();

            if ( item instanceof Map )
            {
                applyData( set.addSet( name ), (Map) item );
            }
            else if ( item instanceof Iterable )
            {
                applyData( set, name, (Iterable<?>) item );
            }
            else if ( item instanceof Double )
            {
                set.addDouble( name, (Double) item );
            }
            else if ( item instanceof Number )
            {
                set.addLong( name, ( (Number) item ).longValue() );
            }
            else if ( item instanceof Boolean )
            {
                set.addBoolean( name, (Boolean) item );
            }
            else
            {
                set.addString( name, item.toString() );
            }
        }
    }

    private void applyData( final PropertySet set, final String name, final Object value )
    {
        if ( value instanceof Map )
        {
            applyData( set.addSet( name ), (Map) value );
        }
        else if ( value instanceof Iterable )
        {
            applyData( set, name, (Iterable<?>) value );
        }
        else
        {
            set.addString( name, value.toString() );
        }
    }

    private void applyData( final PropertySet set, final String name, final Iterable<?> value )
    {
        for ( final Object item : value )
        {
            applyData( set, name, item );
        }
    }

    private Metadatas metadatas( final Map<String, Object> value )
    {
        if ( value == null )
        {
            return null;
        }

        final Metadatas.Builder metadatasBuilder = Metadatas.builder();
        for ( final Map.Entry<String, Object> entry : value.entrySet() )
        {
            final Metadata item = metaData( entry.getKey(), entry.getValue() );
            if ( item != null )
            {
                metadatasBuilder.add( item );
            }
        }

        return metadatasBuilder.build();
    }

    private Metadata metaData( final String localName, final Object value )
    {
        if ( value instanceof Map )
        {
            final Mixin mixin = mixinService.getByLocalName( localName );
            if ( mixin != null )
            {
                return new Metadata( mixin.getName(), propertyTree( (Map) value ) );
            }
        }

        return null;
    }

    @Reference
    public void setContentService( final ContentService contentService )
    {
        this.contentService = contentService;
    }

    @Reference
    public void setMixinService( final MixinService mixinService )
    {
        this.mixinService = mixinService;
    }
}
