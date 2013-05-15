package com.enonic.wem.web.boot;

import com.google.inject.AbstractModule;

import com.enonic.wem.web.WebModule;

final class BootModule
    extends AbstractModule
{
    @Override
    protected void configure()
    {
        install( new WebModule() );
    }
}
