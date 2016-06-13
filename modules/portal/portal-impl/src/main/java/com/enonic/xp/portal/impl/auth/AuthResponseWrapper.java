package com.enonic.xp.portal.impl.auth;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.ServletOutputStream;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import com.enonic.xp.portal.auth.AuthControllerExecutionParams;
import com.enonic.xp.portal.auth.AuthControllerService;
import com.enonic.xp.util.Exceptions;
import com.enonic.xp.web.HttpStatus;


public class AuthResponseWrapper
    extends HttpServletResponseWrapper
{
    private final AuthControllerService authControllerService;

    private final HttpServletRequest request;

    private final HttpServletResponse response;

    private boolean errorHandled;

    public AuthResponseWrapper( final AuthControllerService authControllerService, final HttpServletRequest request,
                                final HttpServletResponse response )
    {
        super( response );
        this.authControllerService = authControllerService;
        this.request = request;
        this.response = response;
    }

    @Override
    public void setStatus( final int sc )
    {
        handleError( sc );

        if ( !errorHandled )
        {
            super.setStatus( sc );
        }
    }

    @Override
    public PrintWriter getWriter()
        throws IOException
    {
        if ( errorHandled )
        {
            return new PrintWriter( new StringWriter() );
        }
        return super.getWriter();
    }

    @Override
    public ServletOutputStream getOutputStream()
        throws IOException
    {
        if ( errorHandled )
        {
            return new ServletOutputStream()
            {
                @Override
                public boolean isReady()
                {
                    return true;
                }

                @Override
                public void setWriteListener( final WriteListener writeListener )
                {

                }

                @Override
                public void write( final int b )
                    throws IOException
                {

                }
            };
        }
        return super.getOutputStream();
    }

    @Override
    public void setHeader( final String name, final String value )
    {
        if ( !errorHandled )
        {
            super.setHeader( name, value );
        }
    }

    @Override
    public void sendError( final int sc )
        throws IOException
    {
        handleError( sc );

        if ( !errorHandled )
        {
            super.sendError( sc );
        }
    }

    @Override
    public void sendError( final int sc, final String msg )
        throws IOException
    {
        handleError( sc );

        if ( !errorHandled )
        {
            super.sendError( sc, msg );
        }
    }

    private void handleError( final int sc )
    {
        if ( !errorHandled && isUnauthorizedError( sc ) && !isErrorAlreadyHandled() )
        {
            try
            {
                final AuthControllerExecutionParams executionParams = AuthControllerExecutionParams.create().
                    functionName( "handle401" ).
                    servletRequest( request ).
                    response( response ).
                    build();
                final boolean responseSerialized = authControllerService.execute( executionParams ) != null;
                if ( responseSerialized )
                {
                    errorHandled = true;
                }
            }
            catch ( IOException e )
            {
                throw Exceptions.unchecked( e );
            }
        }
    }

    private boolean isUnauthorizedError( final int sc )
    {
        return HttpStatus.UNAUTHORIZED.value() == sc;
    }

    private boolean isErrorAlreadyHandled()
    {
        return Boolean.TRUE == request.getAttribute( "error.handled" );
    }
}