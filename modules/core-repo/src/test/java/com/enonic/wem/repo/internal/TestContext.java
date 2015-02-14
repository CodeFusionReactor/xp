package com.enonic.wem.repo.internal;

import com.enonic.xp.core.context.Context;
import com.enonic.xp.core.context.ContextBuilder;
import com.enonic.xp.core.repository.Repository;
import com.enonic.xp.core.repository.RepositoryId;
import com.enonic.xp.core.branch.Branch;

public class TestContext
{
    public static final Branch TEST_BRANCH = Branch.from( "test" );

    public static final Repository TEST_REPOSITORY = Repository.create().
        id( RepositoryId.from( "test" ) ).
        build();

    public static final Context TEST_CONTEXT = ContextBuilder.create().
        branch( TEST_BRANCH ).
        repositoryId( TEST_REPOSITORY.getId() ).
        build();

}
