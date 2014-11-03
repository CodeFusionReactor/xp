package com.enonic.wem.portal.internal.underscore;

import com.enonic.wem.api.module.ModuleService;
import com.enonic.wem.portal.internal.base.ResourceFactory;

public final class PublicResourceProvider
    implements ResourceFactory<PublicResource>
{
    private ModuleService moduleService;

    @Override
    public Class<PublicResource> getType()
    {
        return PublicResource.class;
    }

    @Override
    public PublicResource newResource()
    {
        final PublicResource instance = new PublicResource();
        instance.moduleService = this.moduleService;
        return instance;
    }

    public void setModuleService( final ModuleService moduleService )
    {
        this.moduleService = moduleService;
    }
}
