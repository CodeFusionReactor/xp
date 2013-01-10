package com.enonic.wem.core.content.relation;

import javax.jcr.Session;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.enonic.wem.api.command.Commands;
import com.enonic.wem.api.command.content.relation.GetRelationshipTypes;
import com.enonic.wem.api.content.relation.QualifiedRelationshipTypeNames;
import com.enonic.wem.api.content.relation.RelationshipType;
import com.enonic.wem.api.content.relation.RelationshipTypes;
import com.enonic.wem.api.content.type.QualifiedContentTypeName;
import com.enonic.wem.api.module.ModuleName;
import com.enonic.wem.core.command.AbstractCommandHandlerTest;
import com.enonic.wem.core.content.relation.dao.RelationshipTypeDao;

import static com.enonic.wem.api.content.relation.RelationshipType.newRelationType;
import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

public class GetRelationshipTypesHandlerTest
    extends AbstractCommandHandlerTest
{
    private GetRelationshipTypesHandler handler;

    private RelationshipTypeDao relationshipTypeDao;

    @Before
    public void setUp()
        throws Exception
    {
        super.initialize();

        relationshipTypeDao = Mockito.mock( RelationshipTypeDao.class );
        handler = new GetRelationshipTypesHandler();
        handler.setRelationshipTypeDao( relationshipTypeDao );
    }

    @Test
    public void getRelationshipType()
        throws Exception
    {
        // setup
        final RelationshipType relationshipType = newRelationType().
            module( ModuleName.from( "myModule" ) ).
            name( "like" ).
            fromSemantic( "likes" ).
            toSemantic( "liked by" ).
            addAllowedFromType( new QualifiedContentTypeName( "myModule:person" ) ).
            addAllowedToType( new QualifiedContentTypeName( "myModule:person" ) ).
            build();
        final RelationshipTypes relationshipTypes = RelationshipTypes.from( relationshipType );
        Mockito.when(
            relationshipTypeDao.retrieveRelationshipTypes( isA( QualifiedRelationshipTypeNames.class ), any( Session.class ) ) ).thenReturn(
            relationshipTypes );

        // exercise
        final QualifiedRelationshipTypeNames names = QualifiedRelationshipTypeNames.from( "myModule:like" );
        final GetRelationshipTypes command = Commands.relationshipType().get().names( names );
        this.handler.handle( this.context, command );

        // verify
        verify( relationshipTypeDao, atLeastOnce() ).retrieveRelationshipTypes( Mockito.isA( QualifiedRelationshipTypeNames.class ),
                                                                                Mockito.any( Session.class ) );
        assertEquals( 1, command.getResult().getSize() );
    }

    @Test
    public void getAllRelationshipTypes()
        throws Exception
    {
        // setup
        final RelationshipType relationshipType = newRelationType().
            module( ModuleName.from( "myModule" ) ).
            name( "like" ).
            fromSemantic( "likes" ).
            toSemantic( "liked by" ).
            addAllowedFromType( new QualifiedContentTypeName( "myModule:person" ) ).
            addAllowedToType( new QualifiedContentTypeName( "myModule:person" ) ).
            build();
        final RelationshipType relationshipType2 = newRelationType().
            module( ModuleName.from( "myModule" ) ).
            name( "hate" ).
            fromSemantic( "hates" ).
            toSemantic( "hated by" ).
            addAllowedFromType( new QualifiedContentTypeName( "myModule:person" ) ).
            addAllowedToType( new QualifiedContentTypeName( "myModule:person" ) ).
            build();
        final RelationshipTypes relationshipTypes = RelationshipTypes.from( relationshipType, relationshipType2 );
        Mockito.when( relationshipTypeDao.retrieveAllRelationshipTypes( any( Session.class ) ) ).thenReturn( relationshipTypes );

        // exercise
        final GetRelationshipTypes command = Commands.relationshipType().get().all();
        this.handler.handle( this.context, command );

        // verify
        verify( relationshipTypeDao, atLeastOnce() ).retrieveAllRelationshipTypes( Mockito.any( Session.class ) );
        assertEquals( 2, command.getResult().getSize() );
    }
}
