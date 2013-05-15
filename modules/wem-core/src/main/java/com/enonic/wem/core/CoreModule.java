package com.enonic.wem.core;

import com.google.inject.AbstractModule;

import com.enonic.wem.core.command.CommandModule;
import com.enonic.wem.core.config.ConfigModule;
import com.enonic.wem.core.country.CountryModule;
import com.enonic.wem.core.home.HomeModule;
import com.enonic.wem.core.lifecycle.LifecycleModule;
import com.enonic.wem.core.locale.LocaleModule;
import com.enonic.wem.core.time.TimeModule;

public final class CoreModule
    extends AbstractModule
{
    @Override
    protected void configure()
    {
        install( new HomeModule() );
        install( new LifecycleModule() );
        install( new ConfigModule() );
        install( new CountryModule() );
        install( new LocaleModule() );
        install( new TimeModule() );
        // install( new JcrModule() );
        // install( new InitializerModule() );
        // install( new ClientModule() );
        install( new CommandModule() );
        // install( new AccountModule() );
        // install( new ContentModule() );
        // install( new IndexModule() );
        // install( new SpaceModule() );
        // install( new UserStoreModule() );

        // TODO: Move to plugin. Need some service starting system first.
        // install( new MigrateModule() );
    }
}
