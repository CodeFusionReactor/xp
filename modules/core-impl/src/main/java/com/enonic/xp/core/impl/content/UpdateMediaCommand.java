package com.enonic.xp.core.impl.content;

import com.google.common.base.Preconditions;

import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.content.UpdateContentParams;
import com.enonic.xp.core.content.UpdateMediaParams;
import com.enonic.xp.core.content.attachment.CreateAttachment;
import com.enonic.xp.core.content.attachment.CreateAttachments;
import com.enonic.xp.core.data.PropertyTree;
import com.enonic.xp.core.media.MediaInfo;
import com.enonic.xp.core.media.MediaInfoService;
import com.enonic.xp.core.schema.content.ContentTypeName;

final class UpdateMediaCommand
    extends AbstractCreatingOrUpdatingContentCommand
{
    private final UpdateMediaParams params;

    private final MediaInfoService mediaInfoService;

    private UpdateMediaCommand( final Builder builder )
    {
        super( builder );
        this.params = builder.params;
        this.mediaInfoService = builder.mediaInfoService;
    }

    public static Builder create( final UpdateMediaParams params )
    {
        return new Builder( params );
    }

    Content execute()
    {
        params.validate();

        return doExecute();
    }

    private Content doExecute()
    {
        final MediaInfo mediaInfo = mediaInfoService.parseMediaInfo( params.getByteSource() );
        if ( params.getMimeType() == null )
        {
            params.mimeType( mediaInfo.getMediaType() );
        }

        final ContentTypeName type = ContentTypeFromMimeTypeResolver.resolve( params.getMimeType() );
        if ( type == null )
        {
            throw new IllegalArgumentException( "Could not resolve a ContentType from MIME type: " + params.getMimeType() );
        }

        final CreateAttachment mediaAttachment = CreateAttachment.create().
            name( params.getName() ).
            mimeType( params.getMimeType() ).
            label( "source" ).
            byteSource( params.getByteSource() ).
            build();

        // TODO: Support renaming? final String nameOfContent = Name.ensureValidName( params.getName() );

        final PropertyTree data = new PropertyTree();
        new ImageFormDataBuilder().
            image( params.getName() ).
            build( data );

        final UpdateContentParams updateParams = new UpdateContentParams().
            contentId( params.getContent() ).
            createAttachments( CreateAttachments.from( mediaAttachment ) ).
            editor( editable -> editable.data = data );

        return UpdateContentCommand.create( this ).
            params( updateParams ).
            mediaInfo( mediaInfo ).
            moduleService( this.moduleService ).
            mixinService( this.mixinService ).
            build().
            execute();
    }

    public static class Builder
        extends AbstractCreatingOrUpdatingContentCommand.Builder<Builder>
    {
        private final UpdateMediaParams params;

        private MediaInfoService mediaInfoService;

        public Builder( final UpdateMediaParams params )
        {
            this.params = params;
        }

        public Builder mediaInfoService( final MediaInfoService value )
        {
            this.mediaInfoService = value;
            return this;
        }

        void validate()
        {
            Preconditions.checkNotNull( params );
        }

        public UpdateMediaCommand build()
        {
            validate();
            return new UpdateMediaCommand( this );
        }

    }

}
