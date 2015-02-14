package com.enonic.xp.portal.impl.resource.image;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.content.ContentId;
import com.enonic.xp.core.content.ContentName;
import com.enonic.xp.core.content.ContentPath;
import com.enonic.xp.core.content.Media;
import com.enonic.xp.core.content.attachment.Attachment;
import com.enonic.xp.core.util.MediaTypes;
import com.enonic.xp.portal.impl.resource.base.BaseSubResource;

import static org.apache.commons.lang.StringUtils.substringBeforeLast;

public final class ImageResource
    extends BaseSubResource
{

    @Path("{id}/{name}")
    public ImageHandleResource imageById( @PathParam("id") final String id, @PathParam("name") final String name )
    {
        final ImageHandleResource resource = initResource( new ImageHandleResource() );

        final ContentId imageContentId = ContentId.from( id );
        final Media imageContent = getImage( imageContentId );

        if ( !contentNameMatch( imageContent.getName(), name ) )
        {
            throw notFound( "Image [%s] not found for content [%s]", name, id );
        }

        final Attachment attachment = imageContent.getMediaAttachment();
        if ( attachment == null )
        {
            throw notFound( "Attachment [%s] not found", imageContent.getName().toString() );
        }

        resource.binary = this.services.getContentService().getBinary( imageContentId, attachment.getBinaryReference() );
        if ( resource.binary == null )
        {
            throw notFound( "Binary [%s] not found for content [%s]", attachment.getBinaryReference(), imageContentId );
        }

        resource.mimeType = getMimeType( name, imageContent.getName(), attachment );
        resource.name = name;
        return resource;
    }

    @Path("{name}")
    public ImageHandleResource imageByName( @PathParam("name") final String name )
    {
        final ImageHandleResource resource = initResource( new ImageHandleResource() );

        final Media imageContent = getImage( this.contentPath );
        final Attachment attachment = imageContent.getMediaAttachment();
        if ( !contentNameMatch( imageContent.getName(), name ) )
        {
            throw notFound( "Image [%s] not found for content [%s]", name, this.contentPath );
        }

        resource.binary = this.services.getContentService().getBinary( imageContent.getId(), attachment.getBinaryReference() );
        if ( resource.binary == null )
        {
            throw notFound( "Binary [%s] not found for content [%s]", attachment.getBinaryReference(), imageContent.getId() );
        }

        resource.mimeType = getMimeType( name, imageContent.getName(), attachment );
        resource.name = name;
        return resource;
    }

    private boolean contentNameMatch( final ContentName contentName, final String urlName )
    {
        final String contentNameStr = contentName.toString();
        return contentNameStr.equals( urlName ) || contentNameStr.equals( substringBeforeLast( urlName, "." ) );
    }

    private String getMimeType( final String fileName, final ContentName contentName, final Attachment attachment )
    {
        return contentName.toString().equals( fileName ) ? attachment.getMimeType() : MediaTypes.instance().fromFile( fileName ).toString();
    }

    private Media getImage( final ContentId contentId )
    {
        final Content content = this.services.getContentService().getById( contentId );
        if ( content == null )
        {
            throw notFound( "Content with id [%s] not found", contentId.toString() );
        }

        if ( !( content instanceof Media ) )
        {
            throw notFound( "Content with id [%s] is not an Image", contentId.toString() );
        }

        final Media media = (Media) content;
        if ( !media.isImage() )
        {
            throw notFound( "Content with id [%s] is not an Image", contentId.toString() );
        }

        return media;
    }

    private Media getImage( final ContentPath contentPath )
    {
        final Content content = this.services.getContentService().getByPath( contentPath );
        if ( content == null )
        {
            throw notFound( "Content with path [%s] not found", contentPath.toString() );
        }

        if ( !( content instanceof Media ) )
        {
            throw notFound( "Content with path [%s] is not an Image", contentPath.toString() );
        }

        final Media media = (Media) content;
        if ( !media.isImage() )
        {
            throw notFound( "Content with path [%s] is not an Image", contentPath.toString() );
        }

        return media;
    }
}
