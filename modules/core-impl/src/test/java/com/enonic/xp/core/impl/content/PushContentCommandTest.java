package com.enonic.xp.core.impl.content;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.content.ContentConstants;
import com.enonic.xp.core.content.ContentId;
import com.enonic.xp.core.content.ContentIds;
import com.enonic.xp.core.content.ContentPath;
import com.enonic.xp.core.content.Contents;
import com.enonic.xp.core.content.PushContentsResult;
import com.enonic.xp.core.event.EventPublisher;
import com.enonic.xp.core.node.Node;
import com.enonic.xp.core.node.NodeId;
import com.enonic.xp.core.node.NodeIds;
import com.enonic.xp.core.node.NodePath;
import com.enonic.xp.core.node.NodeService;
import com.enonic.xp.core.node.Nodes;
import com.enonic.xp.core.node.PushNodesResult;
import com.enonic.xp.core.node.ResolveSyncWorkResult;
import com.enonic.xp.core.node.SyncWorkResolverParams;
import com.enonic.xp.core.schema.content.ContentTypeService;

import static org.junit.Assert.*;

public class PushContentCommandTest
{
    private NodeService nodeService;

    private ContentTypeService contentTypeService;

    private ContentNodeTranslator contentNodeTranslator;

    private EventPublisher eventPublisher;

    @Before
    public void setUp()
        throws Exception
    {
        this.nodeService = Mockito.mock( NodeService.class );
        this.contentTypeService = Mockito.mock( ContentTypeService.class );
        this.contentNodeTranslator = Mockito.mock( ContentNodeTranslator.class );
        this.eventPublisher = Mockito.mock( EventPublisher.class );
    }

    @Test
    public void no_outside_requested()
        throws Exception
    {
        Mockito.when( nodeService.resolveSyncWork( Mockito.isA( SyncWorkResolverParams.class ) ) ).
            thenReturn( ResolveSyncWorkResult.create().
                publishRequested( NodeId.from( "s1" ) ).
                publishRequested( NodeId.from( "s2" ) ).
                build() );

        Mockito.when( nodeService.getByIds( Mockito.isA( NodeIds.class ) ) ).
            thenReturn( Nodes.empty() );

        Mockito.when( contentNodeTranslator.fromNodes( Mockito.isA( Nodes.class ) ) ).
            thenReturn( Contents.from( createContent( "s1", "s1Name", ContentPath.ROOT, true ),
                                       createContent( "s2", "s2Name", ContentPath.ROOT, true ) ) );

        Mockito.when( nodeService.push( Mockito.any(), Mockito.any() ) ).thenReturn( PushNodesResult.create().
            addSuccess( createNode( "s1", "s1Name", "/content" ) ).
            addSuccess( createNode( "s2", "s2Name", "/content" ) ).
            build() );

        final PushContentsResult result = PushContentCommand.create().
            contentIds( ContentIds.from( ContentId.from( "s1" ), ContentId.from( "s2" ) ) ).
            resolveDependencies( true ).
            strategy( PushContentCommand.PushContentStrategy.STRICT ).
            target( ContentConstants.BRANCH_MASTER ).
            nodeService( this.nodeService ).
            contentTypeService( this.contentTypeService ).
            translator( this.contentNodeTranslator ).
            eventPublisher( this.eventPublisher ).
            build().
            execute();

        assertEquals( 2, result.getPushedContent().getSize() );
    }

    @Test
    public void outside_requested_strict()
        throws Exception
    {
        Mockito.when( nodeService.resolveSyncWork( Mockito.isA( SyncWorkResolverParams.class ) ) ).
            thenReturn( ResolveSyncWorkResult.create().
                publishRequested( NodeId.from( "s1" ) ).
                publishReferredFrom( NodeId.from( "s1" ), NodeId.from( "s2" ) ).
                build() );

        Mockito.when( nodeService.getByIds( Mockito.isA( NodeIds.class ) ) ).
            thenReturn( Nodes.empty() );

        Mockito.when( contentNodeTranslator.fromNodes( Mockito.isA( Nodes.class ) ) ).
            thenReturn( Contents.from( createContent( "s1", "s1Name", ContentPath.ROOT, true ),
                                       createContent( "s2", "s2Name", ContentPath.ROOT, true ) ) );

        Mockito.when( nodeService.push( Mockito.any(), Mockito.any() ) ).thenReturn( PushNodesResult.create().
            addSuccess( createNode( "s1", "s1Name", "/content" ) ).
            addSuccess( createNode( "s2", "s2Name", "/content" ) ).
            build() );

        final PushContentsResult result = PushContentCommand.create().
            contentIds( ContentIds.from( ContentId.from( "s1" ) ) ).
            resolveDependencies( true ).
            strategy( PushContentCommand.PushContentStrategy.STRICT ).
            target( ContentConstants.BRANCH_MASTER ).
            nodeService( this.nodeService ).
            contentTypeService( this.contentTypeService ).
            translator( this.contentNodeTranslator ).
            eventPublisher( this.eventPublisher ).
            build().
            execute();

        assertEquals( 0, result.getPushedContent().getSize() );
        assertEquals( 1, result.getPushContentRequests().getPushBecauseRequested().size() );
        assertEquals( 1, result.getPushContentRequests().getPushedBecauseReferredTos().size() );
    }

    @Test
    public void outside_requested_lenient()
        throws Exception
    {
        Mockito.when( nodeService.resolveSyncWork( Mockito.isA( SyncWorkResolverParams.class ) ) ).
            thenReturn( ResolveSyncWorkResult.create().
                publishRequested( NodeId.from( "s1" ) ).
                publishReferredFrom( NodeId.from( "s1" ), NodeId.from( "s2" ) ).
                build() );

        Mockito.when( nodeService.getByIds( Mockito.isA( NodeIds.class ) ) ).
            thenReturn( Nodes.empty() );

        Mockito.when( contentNodeTranslator.fromNodes( Mockito.isA( Nodes.class ) ) ).
            thenReturn( Contents.from( createContent( "s1", "s1Name", ContentPath.ROOT, true ),
                                       createContent( "s2", "s2Name", ContentPath.ROOT, true ) ) );

        Mockito.when( nodeService.push( Mockito.any(), Mockito.any() ) ).thenReturn( PushNodesResult.create().
            addSuccess( createNode( "s1", "s1Name", "/content" ) ).
            addSuccess( createNode( "s2", "s2Name", "/content" ) ).
            build() );

        final PushContentsResult result = PushContentCommand.create().
            contentIds( ContentIds.from( ContentId.from( "s1" ) ) ).
            resolveDependencies( true ).
            strategy( PushContentCommand.PushContentStrategy.ALLOW_PUBLISH_OUTSIDE_SELECTION ).
            target( ContentConstants.BRANCH_MASTER ).
            nodeService( this.nodeService ).
            contentTypeService( this.contentTypeService ).
            translator( this.contentNodeTranslator ).
            eventPublisher( this.eventPublisher ).
            build().
            execute();

        assertEquals( 2, result.getPushedContent().getSize() );
        assertEquals( 1, result.getPushContentRequests().getPushBecauseRequested().size() );
        assertEquals( 1, result.getPushContentRequests().getPushedBecauseReferredTos().size() );
    }


    @Test
    public void pending_deleted()
        throws Exception
    {
        Mockito.when( nodeService.resolveSyncWork( Mockito.isA( SyncWorkResolverParams.class ) ) ).
            thenReturn( ResolveSyncWorkResult.create().
                addDelete( NodeId.from( "s3" ) ).
                addDelete( NodeId.from( "s4" ) ).
                build() );

        Mockito.when( nodeService.getByIds( Mockito.isA( NodeIds.class ) ) ).
            thenReturn( Nodes.empty() );

        Mockito.when( contentNodeTranslator.fromNodes( Mockito.isA( Nodes.class ) ) ).
            thenReturn( Contents.from( createContent( "s1", "s1Name", ContentPath.ROOT, true ),
                                       createContent( "s2", "s2Name", ContentPath.ROOT, true ) ) );

        Mockito.when( nodeService.push( Mockito.any(), Mockito.any() ) ).thenReturn( PushNodesResult.create().
            addSuccess( createNode( "s1", "s1Name", "/content" ) ).
            addSuccess( createNode( "s2", "s2Name", "/content" ) ).
            build() );

        final PushContentsResult result = PushContentCommand.create().
            contentIds( ContentIds.from( ContentId.from( "s1" ) ) ).
            resolveDependencies( true ).
            strategy( PushContentCommand.PushContentStrategy.ALLOW_PUBLISH_OUTSIDE_SELECTION ).
            target( ContentConstants.BRANCH_MASTER ).
            nodeService( this.nodeService ).
            contentTypeService( this.contentTypeService ).
            translator( this.contentNodeTranslator ).
            eventPublisher( this.eventPublisher ).
            build().
            execute();

        assertEquals( 2, result.getPushedContent().getSize() );
        assertEquals( 2, result.getDeleted().getSize() );
        assertEquals( 0, result.getPushContentRequests().getPushBecauseRequested().size() );
        assertEquals( 0, result.getPushContentRequests().getPushedBecauseReferredTos().size() );
    }


    @Test
    public void contains_invalid()
        throws Exception
    {
        Mockito.when( nodeService.resolveSyncWork( Mockito.isA( SyncWorkResolverParams.class ) ) ).
            thenReturn( ResolveSyncWorkResult.create().
                publishRequested( NodeId.from( "s1" ) ).
                publishReferredFrom( NodeId.from( "s1" ), NodeId.from( "s2" ) ).
                build() );

        Mockito.when( nodeService.getByIds( Mockito.isA( NodeIds.class ) ) ).
            thenReturn( Nodes.empty() );

        final Content validContent = createContent( "s1", "s1Name", ContentPath.ROOT, true );
        final Content invalidContent = createContent( "s2", "s2Name", ContentPath.ROOT, false );
        final Contents contents = Contents.from( validContent, invalidContent );

        Mockito.when( contentNodeTranslator.fromNodes( Mockito.isA( Nodes.class ) ) ).
            thenReturn( contents );

        final PushContentsResult result = PushContentCommand.create().
            contentIds( ContentIds.from( ContentId.from( "s1" ) ) ).
            resolveDependencies( true ).
            strategy( PushContentCommand.PushContentStrategy.ALLOW_PUBLISH_OUTSIDE_SELECTION ).
            target( ContentConstants.BRANCH_MASTER ).
            nodeService( this.nodeService ).
            contentTypeService( this.contentTypeService ).
            translator( this.contentNodeTranslator ).
            eventPublisher( this.eventPublisher ).
            build().
            execute();

        assertEquals( 0, result.getPushedContent().getSize() );
        assertEquals( 1, result.getFailed().size() );
    }


    private Node createNode( final String id, final String name, final String path )
    {
        return Node.newNode().
            id( NodeId.from( id ) ).
            name( name ).
            parentPath( NodePath.newPath( path ).build() ).
            build();
    }

    private Content createContent( final String id, final String name, final ContentPath path, boolean valid )
    {
        return Content.newContent().
            id( ContentId.from( id ) ).
            name( name ).
            parentPath( path ).
            valid( valid ).
            build();
    }
}