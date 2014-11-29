package com.enonic.wem.export.internal;

import org.junit.Before;
import org.junit.Test;

import com.enonic.wem.api.export.NodeExportResult;
import com.enonic.wem.api.node.CreateNodeParams;
import com.enonic.wem.api.node.Node;
import com.enonic.wem.api.node.NodeName;
import com.enonic.wem.api.node.NodePath;
import com.enonic.wem.api.node.NodeService;
import com.enonic.wem.export.internal.writer.ExportWriter;
import com.enonic.wem.export.internal.writer.SystemOutExportWriter;
import com.enonic.wem.export.internal.xml.serializer.XmlNodeSerializer;

import static org.junit.Assert.*;

public class BatchedNodeExporterTest
{
    private NodeService nodeService;

    private ExportWriter exportWriter;

    @Before
    public void setUp()
        throws Exception
    {
        this.nodeService = new NodeServiceMock();
        this.exportWriter = new SystemOutExportWriter();
    }

    @Test
    public void one_node()
        throws Exception
    {
        final Node node = createNode( "mynode", NodePath.ROOT );

        this.nodeService.create( CreateNodeParams.from( node ).build() );

        final NodeExportResult result = BatchedNodeExporter.create().
            nodeService( this.nodeService ).
            nodeExportWriter( exportWriter ).
            nodePath( NodePath.ROOT ).
            xmlNodeSerializer( new XmlNodeSerializer() ).
            build().
            export();

        assertEquals( 1, result.size() );
    }

    @Test
    public void children_nodes()
        throws Exception
    {
        final Node root = createNode( "mynode", NodePath.ROOT );
        final Node child1 = createNode( "child1", root.path() );
        final Node child1_1 = createNode( "child1_1", child1.path() );
        final Node child1_2 = createNode( "child1_2", child1.path() );
        final Node child1_3 = createNode( "child1_3", child1.path() );
        final Node child1_4 = createNode( "child1_4", child1.path() );
        final Node child1_4_1 = createNode( "child1_4_1", child1_4.path() );
        final Node child1_4_2 = createNode( "child1_4_2", child1_4.path() );
        final Node child2 = createNode( "child2", root.path() );
        final Node child2_1 = createNode( "child2_1", child2.path() );

        final NodeExportResult result = BatchedNodeExporter.create().
            nodeService( this.nodeService ).
            nodeExportWriter( this.exportWriter ).
            nodePath( NodePath.ROOT ).
            xmlNodeSerializer( new XmlNodeSerializer() ).
            build().
            export();

        assertEquals( 10, result.size() );

        assertTrue( result.getExportedNodes().contains( root.path() ) );
        assertTrue( result.getExportedNodes().contains( child1.path() ) );
        assertTrue( result.getExportedNodes().contains( child1_1.path() ) );
        assertTrue( result.getExportedNodes().contains( child1_2.path() ) );
        assertTrue( result.getExportedNodes().contains( child1_3.path() ) );
        assertTrue( result.getExportedNodes().contains( child1_4.path() ) );
        assertTrue( result.getExportedNodes().contains( child1_4_1.path() ) );
        assertTrue( result.getExportedNodes().contains( child1_4_2.path() ) );
        assertTrue( result.getExportedNodes().contains( child2.path() ) );
        assertTrue( result.getExportedNodes().contains( child2_1.path() ) );
    }

    private Node createNode( final String name, final NodePath root )
    {
        final Node node = Node.newNode().
            name( NodeName.from( name ) ).
            parent( root ).
            build();

        return this.nodeService.create( CreateNodeParams.from( node ).build() );
    }
}