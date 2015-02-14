package com.enonic.xp.core.impl.content.page.region;


import com.enonic.xp.core.content.ContentId;
import com.enonic.xp.core.content.page.ComponentDataSerializer;
import com.enonic.xp.core.content.page.region.ImageComponent;
import com.enonic.xp.core.data.PropertySet;

public class ImageComponentDataSerializer
    extends ComponentDataSerializer<ImageComponent, ImageComponent>
{
    public void toData( final ImageComponent component, final PropertySet parent )
    {
        final PropertySet asData = parent.addSet( ImageComponent.class.getSimpleName() );
        applyComponentToData( component, asData );
        if ( component.getImage() != null )
        {
            asData.addString( "image", component.getImage().toString() );
        }
        if ( component.hasConfig() )
        {
            asData.addSet( "config", component.getConfig().getRoot().copy( asData.getTree() ) );
        }
    }

    public ImageComponent fromData( final PropertySet asData )
    {
        ImageComponent.Builder component = ImageComponent.newImageComponent();
        applyComponentFromData( component, asData );
        if ( asData.isNotNull( "image" ) )
        {
            component.image( ContentId.from( asData.getString( "image" ) ) );
        }
        if ( asData.hasProperty( "config" ) )
        {
            component.config( asData.getSet( "config" ).toTree() );
        }
        return component.build();
    }
}
