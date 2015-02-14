package com.enonic.xp.core.impl.content;

import com.google.common.base.Preconditions;

import com.enonic.xp.core.content.ContentNotFoundException;
import com.enonic.xp.core.content.ContentPath;
import com.enonic.xp.core.content.ContentPaths;
import com.enonic.xp.core.content.Contents;
import com.enonic.xp.core.context.ContextAccessor;
import com.enonic.xp.core.node.NoNodeAtPathFoundException;
import com.enonic.xp.core.node.NodePaths;
import com.enonic.xp.core.node.Nodes;


final class GetContentByPathsCommand
    extends AbstractContentCommand
{
    private final ContentPaths contentPaths;

    private GetContentByPathsCommand( final Builder builder )
    {
        super( builder );
        this.contentPaths = builder.contentPaths;
        for ( final ContentPath path : builder.contentPaths )
        {
            Preconditions.checkArgument( path.isAbsolute(), "contentPath must be absolute: " + path );
        }
    }

    Contents execute()
    {
        final Contents contents;

        try
        {
            contents = doExecute();
        }
        catch ( NoNodeAtPathFoundException ex )
        {
            throw new ContentNotFoundException( ContentPath.from( ex.getPath().toString() ), ContextAccessor.current().getBranch() );
        }

        return contents;
    }

    private Contents doExecute()
    {
        final NodePaths paths = ContentNodeHelper.translateContentPathsToNodePaths( contentPaths );
        final Nodes nodes = nodeService.getByPaths( paths );

        return translator.fromNodes( nodes );
    }

    public static Builder create( final ContentPaths contentPaths )
    {
        return new Builder( contentPaths );
    }

    public static class Builder
        extends AbstractContentCommand.Builder<Builder>
    {
        private final ContentPaths contentPaths;

        public Builder( final ContentPaths contentPaths )
        {
            this.contentPaths = contentPaths;
        }

        void validate()
        {
            super.validate();
            Preconditions.checkNotNull( contentPaths );
        }

        public GetContentByPathsCommand build()
        {
            validate();
            return new GetContentByPathsCommand( this );
        }
    }
}
