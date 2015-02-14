package com.enonic.xp.portal.rendering;

import com.enonic.xp.core.rendering.Renderable;

public interface RendererFactory
{
    <R extends Renderable> Renderer<R> getRenderer( R renderable );
}
