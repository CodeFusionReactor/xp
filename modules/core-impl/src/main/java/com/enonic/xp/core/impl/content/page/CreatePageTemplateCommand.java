package com.enonic.xp.core.impl.content.page;


import com.enonic.xp.core.content.Content;
import com.enonic.xp.core.content.ContentName;
import com.enonic.xp.core.content.ContentPath;
import com.enonic.xp.core.content.ContentService;
import com.enonic.xp.core.content.CreateContentParams;
import com.enonic.xp.core.content.page.CreatePageParams;
import com.enonic.xp.core.content.page.DescriptorKey;
import com.enonic.xp.core.content.page.PageRegions;
import com.enonic.xp.core.content.page.PageService;
import com.enonic.xp.core.content.page.PageTemplate;
import com.enonic.xp.core.data.PropertyTree;
import com.enonic.xp.core.schema.content.ContentTypeName;
import com.enonic.xp.core.schema.content.ContentTypeNames;
import com.enonic.xp.core.security.PrincipalKey;
import com.enonic.xp.core.impl.content.ContentServiceImpl;

class CreatePageTemplateCommand
{
    private ContentService contentService;

    private PageService pageService;

    private ContentPath site;

    private ContentName name;

    private String displayName;

    private DescriptorKey controller;

    private ContentTypeNames supports;

    private PageRegions pageRegions;

    private PropertyTree pageConfig;

    public CreatePageTemplateCommand contentService( final ContentService contentService )
    {
        this.contentService = contentService;
        return this;
    }

    public CreatePageTemplateCommand pageService( final PageService pageService )
    {
        this.pageService = pageService;
        return this;
    }

    public CreatePageTemplateCommand site( final ContentPath site )
    {
        this.site = site;
        return this;
    }

    public CreatePageTemplateCommand name( final ContentName name )
    {
        this.name = name;
        return this;
    }

    public CreatePageTemplateCommand displayName( final String displayName )
    {
        this.displayName = displayName;
        return this;
    }

    public CreatePageTemplateCommand controller( final DescriptorKey controller )
    {
        this.controller = controller;
        return this;
    }

    public CreatePageTemplateCommand supports( final ContentTypeNames supports )
    {
        this.supports = supports;
        return this;
    }

    public CreatePageTemplateCommand pageRegions( final PageRegions pageRegions )
    {
        this.pageRegions = pageRegions;
        return this;
    }

    public CreatePageTemplateCommand pageConfig( final PropertyTree pageConfig )
    {
        this.pageConfig = pageConfig;
        return this;
    }

    public PageTemplate execute()
    {
        final PropertyTree data = new PropertyTree();
        new PageTemplateFormDataBuilder().
            supports( supports ).
            appendData( data.getRoot() );

        final Content content = contentService.create( CreateContentParams.create().
            name( name ).
            displayName( displayName ).
            owner( PrincipalKey.ofAnonymous() ).
            contentData( data ).
            type( ContentTypeName.pageTemplate() ).
            inheritPermissions( true ).
            parent( ContentPath.from( site, ContentServiceImpl.TEMPLATES_FOLDER_NAME ) ).
            build() );

        return (PageTemplate) pageService.create( new CreatePageParams().
            content( content.getId() ).
            controller( controller ).
            config( pageConfig ).
            regions( pageRegions ) );
    }
}
