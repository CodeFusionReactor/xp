package com.enonic.xp.web.vhost.impl.config;

import com.enonic.xp.web.vhost.impl.mapping.VirtualHostMappings;

public interface VirtualHostConfig
{
    boolean isEnabled();

    VirtualHostMappings getMappings();
}
