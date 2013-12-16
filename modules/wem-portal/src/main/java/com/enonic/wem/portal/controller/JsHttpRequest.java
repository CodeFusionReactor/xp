package com.enonic.wem.portal.controller;

import javax.ws.rs.core.MultivaluedMap;

import com.sun.jersey.api.core.HttpRequestContext;

public final class JsHttpRequest
{
    private final HttpRequestContext raw;

    private final MultivaluedMap<String, String> queryParameters;

    public JsHttpRequest( final HttpRequestContext raw )
    {
        this.raw = raw;
        this.queryParameters = raw.getQueryParameters();
    }

    public String getMethod()
    {
        return this.raw.getMethod();
    }

    public String param( final String name )
    {
        return queryParameters.getFirst( name );
    }
}
