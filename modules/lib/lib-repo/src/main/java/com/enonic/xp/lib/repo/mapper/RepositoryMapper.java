package com.enonic.xp.lib.repo.mapper;

import com.fasterxml.jackson.databind.JsonNode;

import com.enonic.xp.branch.Branches;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.index.IndexType;
import com.enonic.xp.json.JsonToPropertyTreeTranslator;
import com.enonic.xp.repository.IndexDefinition;
import com.enonic.xp.repository.IndexDefinitions;
import com.enonic.xp.repository.Repository;
import com.enonic.xp.repository.RepositorySettings;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class RepositoryMapper
    implements MapSerializable
{
    private Repository repository;

    public RepositoryMapper( final Repository repository )
    {
        this.repository = repository;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "id", repository.getId() );
        serialize( gen, repository.getBranches() );
        serialize( gen, repository.getSettings() );

    }

    private void serialize( final MapGenerator gen, final Branches branches )
    {
        gen.array( "branches" );
        branches.forEach( branch -> gen.value( branch.getValue() ) );
        gen.end();
    }

    private void serialize( final MapGenerator gen, final RepositorySettings settings )
    {
        gen.map( "settings" );
        serialize( gen, settings.getIndexDefinitions() );
        gen.end();
    }

    private void serialize( final MapGenerator gen, final IndexDefinitions indexDefinitions )
    {
        if ( indexDefinitions != null )
        {
            gen.map( "definitions" );
            for ( IndexType indexType : IndexType.values() )
            {
                final IndexDefinition indexDefinition = indexDefinitions.get( indexType );
                if ( indexDefinition != null )
                {
                    gen.map( indexType.getName() );

                    if ( indexDefinition.getSettings() != null )
                    {

                        gen.map( "settings" );
                        serialize( gen, indexDefinition.getSettings().getNode() );
                        gen.end();
                    }

                    if ( indexDefinition.getMapping() != null )
                    {

                        gen.map( "mapping" );
                        serialize( gen, indexDefinition.getMapping().getNode() );
                        gen.end();
                    }

                    gen.end();
                }
            }
            gen.end();
        }
    }

    private void serialize( final MapGenerator gen, final JsonNode jsonNode )
    {
        //TODO We have to handle better this conversion. And the PropertyTreeMapper is duplicated everywhere
        final PropertyTree propertyTree = new JsonToPropertyTreeTranslator().translate( jsonNode );
        new PropertyTreeMapper( propertyTree ).serialize( gen );
    }
}