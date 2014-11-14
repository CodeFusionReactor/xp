package com.enonic.wem.portal.internal.controller;

import com.google.common.collect.Multimap;

import com.enonic.wem.api.content.Content;
import com.enonic.wem.api.content.page.PageComponent;
import com.enonic.wem.api.content.page.PageDescriptor;
import com.enonic.wem.api.content.page.PageTemplate;
import com.enonic.wem.api.content.site.Site;
import com.enonic.wem.api.module.Module;
import com.enonic.wem.api.workspace.Workspace;
import com.enonic.wem.portal.PortalContext;
import com.enonic.wem.portal.PortalRequest;
import com.enonic.wem.portal.PortalResponse;
import com.enonic.wem.portal.RenderingMode;
import com.enonic.wem.portal.url.PortalUrlBuilders;

public final class PortalContextImpl
    implements PortalContext, PortalRequest
{
    private PortalRequestImpl request;

    private PortalResponseImpl response;

    private RenderingMode mode;

    private Site site;

    private Content content;

    private PageTemplate pageTemplate;

    private PageComponent component;

    private Module module;

    public PortalContextImpl()
    {
        this.response = new PortalResponseImpl();
    }

    @Override
    public PortalRequest getRequest()
    {
        return this.request;
    }

    public void setRequest( final PortalRequestImpl request )
    {
        this.request = request;
    }

    @Override
    public PortalResponse getResponse()
    {
        return this.response;
    }

    public void setResponse( final PortalResponseImpl response )
    {
        this.response = response;
    }

    @Override
    public RenderingMode getMode()
    {
        return mode;
    }

    public void setMode( final RenderingMode mode )
    {
        this.mode = mode;
    }

    @Override
    public Site getSite()
    {
        return site;
    }

    public void setSite( final Site site )
    {
        this.site = site;
    }

    @Override
    public Content getContent()
    {
        return content;
    }

    public void setContent( final Content content )
    {
        this.content = content;
    }

    @Override
    public PageTemplate getPageTemplate()
    {
        return pageTemplate;
    }

    public void setPageTemplate( final PageTemplate pageTemplate )
    {
        this.pageTemplate = pageTemplate;
    }

    public PortalUrlBuilders getUrl()
    {
        return new PortalUrlBuilders( this );
    }

    @Override
    public PageComponent getComponent()
    {
        return component;
    }

    @Override
    public void setComponent( final PageComponent component )
    {
        this.component = component;
    }

    @Override
    public Module getModule()
    {
        return this.module;
    }

    public void setModule( final Module module )
    {
        this.module = module;
    }

    @Override
    public String getMethod()
    {
        return this.request.getMethod();
    }

    @Override
    public Workspace getWorkspace()
    {
        return this.request.getWorkspace();
    }

    @Override
    public Multimap<String, String> getParams()
    {
        return this.request.getParams();
    }

    @Override
    public String getBaseUri()
    {
        return this.request.getBaseUri();
    }

    private PageDescriptor pageDescriptor;

    @Override
    public PageDescriptor getPageDescriptor()
    {
        return pageDescriptor;
    }

    public void setPageDescriptor( final PageDescriptor pageDescriptor )
    {
        this.pageDescriptor = pageDescriptor;
    }
}
