package com.enonic.xp.portal.impl.rendering;


import com.enonic.xp.core.content.page.DescriptorKey;

public class DescriptorNotFoundException
    extends RuntimeException
{
    public DescriptorNotFoundException( final DescriptorKey descriptor )
    {
        super( "Descriptor not found: " + descriptor );
    }
}
