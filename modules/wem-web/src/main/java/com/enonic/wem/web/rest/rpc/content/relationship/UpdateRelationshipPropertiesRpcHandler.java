package com.enonic.wem.web.rest.rpc.content.relationship;


import java.util.Iterator;
import java.util.Map;

import org.codehaus.jackson.node.ObjectNode;
import org.springframework.stereotype.Component;

import com.google.common.collect.Maps;

import com.enonic.wem.api.command.Commands;
import com.enonic.wem.api.command.content.relationship.UpdateRelationships;
import com.enonic.wem.api.command.content.relationship.UpdateRelationshipsResult;
import com.enonic.wem.api.content.relationship.RelationshipId;
import com.enonic.wem.api.content.relationship.RelationshipIds;
import com.enonic.wem.api.content.relationship.editor.RelationshipEditors;
import com.enonic.wem.core.content.relationship.dao.RelationshipIdFactory;
import com.enonic.wem.web.json.rpc.JsonRpcContext;
import com.enonic.wem.web.rest.rpc.AbstractDataRpcHandler;

@Component
public final class UpdateRelationshipPropertiesRpcHandler
    extends AbstractDataRpcHandler
{
    public UpdateRelationshipPropertiesRpcHandler()
    {
        super( "relationship_update_properties" );
    }

    @Override
    public void handle( final JsonRpcContext context )
        throws Exception
    {
        final RelationshipId relationshipIdToUpdate = RelationshipIdFactory.from( context.param( "relationshipId" ).asString() );

        final RelationshipEditors.CompositeBuilder compositeEditorBuilder = RelationshipEditors.newCompositeBuilder();
        final ObjectNode addNode = context.param( "add" ).asObject();
        if ( addNode != null )
        {
            final Map<String, String> propertiesToAdd = resolveProperties( addNode );
            compositeEditorBuilder.add( RelationshipEditors.addProperties( propertiesToAdd ) );
        }
        final String[] remove = context.param( "remove" ).asStringArray();
        if ( remove != null && remove.length > 0 )
        {
            compositeEditorBuilder.add( RelationshipEditors.removeProperties( remove ) );
        }

        final UpdateRelationships updateCommand = Commands.relationship().update();
        updateCommand.relationshipIds( RelationshipIds.from( relationshipIdToUpdate ) );
        updateCommand.editor( compositeEditorBuilder.build() );

        final UpdateRelationshipsResult result = client.execute( updateCommand );
        final CreateOrUpdateRelationshipJsonResult.Builder jsonResult = CreateOrUpdateRelationshipJsonResult.newBuilder();
        jsonResult.updated().relationship( relationshipIdToUpdate );
        if ( result.isFailure( relationshipIdToUpdate ) )
        {
            jsonResult.failure( result.getFailure( relationshipIdToUpdate ).reason );
        }
        context.setResult( jsonResult.build() );

    }

    private Map<String, String> resolveProperties( final ObjectNode addNode )
    {
        final Iterator<String> propertyNames = addNode.getFieldNames();
        final Map<String, String> propertiesToAdd = Maps.newLinkedHashMap();
        while ( propertyNames.hasNext() )
        {
            final String propertyKey = propertyNames.next();
            final String propertyValue = addNode.get( propertyKey ).getTextValue();
            propertiesToAdd.put( propertyKey, propertyValue );
        }
        return propertiesToAdd;
    }


}
