package com.enonic.wem.repo.internal.entity;

import com.enonic.xp.core.context.Context;
import com.enonic.xp.core.context.ContextAccessor;
import com.enonic.xp.core.node.NodeComparison;
import com.enonic.xp.core.node.NodeComparisons;
import com.enonic.xp.core.node.NodeId;
import com.enonic.xp.core.node.NodeIds;

public class CompareNodesCommand
    extends AbstractCompareNodeCommand
{
    private final NodeIds nodeIds;

    private CompareNodesCommand( final Builder builder )
    {
        super( builder );
        nodeIds = builder.nodeIds;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public NodeComparisons execute()
    {
        final Context context = ContextAccessor.current();

        final NodeComparisons.Builder builder = NodeComparisons.create();

        for ( final NodeId nodeId : this.nodeIds )
        {
            final NodeComparison nodeComparison = doCompareNodeVersions( context, nodeId );

            builder.add( nodeComparison );
        }

        return builder.build();
    }

    public static final class Builder
        extends AbstractCompareNodeCommand.Builder<Builder>
    {
        private NodeIds nodeIds;

        public Builder nodeIds( final NodeIds nodeIds )
        {
            this.nodeIds = nodeIds;
            return this;
        }

        public CompareNodesCommand build()
        {
            return new CompareNodesCommand( this );
        }
    }
}
