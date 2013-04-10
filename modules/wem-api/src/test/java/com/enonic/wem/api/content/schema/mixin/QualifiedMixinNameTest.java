package com.enonic.wem.api.content.schema.mixin;

import org.junit.Test;

import com.enonic.wem.api.content.AbstractEqualsTest;

public class QualifiedMixinNameTest
{
    @Test
    public void equals()
    {
        AbstractEqualsTest equalsTest = new AbstractEqualsTest()
        {
            @Override
            public Object getObjectX()
            {
                return new QualifiedMixinName( "mymodule:myMixin" );
            }

            @Override
            public Object[] getObjectsThatNotEqualsX()
            {
                return new Object[]{new QualifiedMixinName( "mymodule:myOtherMixin" ), new QualifiedMixinName( "myothermodule:myMixin" )};
            }

            @Override
            public Object getObjectThatEqualsXButNotTheSame()
            {
                return new QualifiedMixinName( "mymodule:myMixin" );
            }

            @Override
            public Object getObjectThatEqualsXButNotTheSame2()
            {
                return new QualifiedMixinName( "mymodule:myMixin" );
            }
        };
        equalsTest.assertEqualsAndHashCodeContract();
    }
}
