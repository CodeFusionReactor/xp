package com.enonic.wem.repo.internal.entity;

import com.google.common.base.Preconditions;

import com.enonic.wem.repo.internal.InternalContext;
import com.enonic.wem.repo.internal.branch.StoreBranchDocument;
import com.enonic.wem.repo.internal.index.IndexContext;
import com.enonic.wem.repo.internal.storage.branch.NodeBranchVersion;
import com.enonic.wem.repo.internal.version.NodeVersionDocument;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.node.Node;
import com.enonic.xp.node.NodeNotFoundException;
import com.enonic.xp.node.NodeVersionId;

public class StoreNodeCommand
    extends AbstractNodeCommand
{
    private final Node node;

    private final boolean updateMetadataOnly;

    private StoreNodeCommand( final Builder builder )
    {
        super( builder );
        this.node = builder.node;
        this.updateMetadataOnly = builder.updateMetadataOnly;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public static Builder create( final AbstractNodeCommand source )
    {
        return new Builder( source );
    }

    public Node execute()
    {
        final Context context = ContextAccessor.current();

        final NodeVersionId nodeVersionId;

        if ( !updateMetadataOnly )
        {
            nodeVersionId = nodeDao.store( node );

            this.versionService.store( NodeVersionDocument.create().
                nodeId( node.id() ).
                nodeVersionId( nodeVersionId ).
                nodePath( node.path() ).
                timestamp( node.getTimestamp() ).
                build(), InternalContext.from( context ) );
        }
        else
        {
            final NodeBranchVersion nodeBranchVersion = this.branchService.get( node.id(), InternalContext.from( context ) );

            if ( nodeBranchVersion == null )
            {
                throw new NodeNotFoundException( "Cannot find node with id: " + node.id() + " in branch " + context.getBranch() );
            }

            nodeVersionId = nodeBranchVersion.getVersionId();
        }

        this.branchService.store( StoreBranchDocument.create().
            node( node ).
            nodeVersionId( nodeVersionId ).
            build(), InternalContext.from( context ) );

        this.indexServiceInternal.store( node, nodeVersionId, IndexContext.from( context ) );

        return this.nodeDao.getByVersionId( nodeVersionId );
    }

    public static final class Builder
        extends AbstractNodeCommand.Builder<Builder>
    {
        private Node node;

        private boolean updateMetadataOnly = false;

        private Builder()
        {
            super();
        }

        private Builder( final AbstractNodeCommand source )
        {
            super( source );
        }

        public Builder node( Node node )
        {
            this.node = node;
            return this;
        }

        public Builder updateMetadataOnly( final boolean updateMetadataOnly )
        {
            this.updateMetadataOnly = updateMetadataOnly;
            return this;
        }

        @Override
        void validate()
        {
            super.validate();
            Preconditions.checkNotNull( this.node );
        }

        public StoreNodeCommand build()
        {
            this.validate();
            return new StoreNodeCommand( this );
        }
    }
}
