import "../../../api.ts";

import Element = api.dom.Element;
import LabelEl = api.dom.LabelEl;
import LinkEl = api.dom.LinkEl;
import ContentSummaryAndCompareStatus = api.content.ContentSummaryAndCompareStatus;

export class WidgetItemView extends api.dom.DivEl {

    public static debug = false;
    private uid: string = "";

    constructor(className?: string) {
        super("widget-item-view" + (className ? " " + className : ""));
    }

    public layout(): wemQ.Promise<any> {
        if (WidgetItemView.debug) {
            console.debug('WidgetItemView.layout: ', this);
        }
        return wemQ<any>(null);
    }

    public setContentAndUpdateView(item: ContentSummaryAndCompareStatus): wemQ.Promise<any> {
        return wemQ<any>(null);
    }

    private getFullWidgetUrl(url: string, uid: string, contentId: string) {
        return url + "?uid=" + uid + "&contentId=" + contentId;
    }

    public setUrl(url: string, contentId: string, keepId: boolean = false): wemQ.Promise<void> {
        var deferred = wemQ.defer<void>(),
            uid = (!keepId || !this.uid) ? Date.now().toString() : this.uid,
            linkEl = new LinkEl(this.getFullWidgetUrl(url, uid, contentId)).setAsync(),
            el = this.getEl().getHTMLElement(),
            onLinkLoaded = ((event: UIEvent) => {
                var mainContainer = event.target["import"].body;
                if (mainContainer) {
                    var shadowRoot = el['shadowRoot'] || el['attachShadow']({mode: 'open'});

                    shadowRoot.innerHTML = mainContainer.innerHTML;
                }
                linkEl.unLoaded(onLinkLoaded);
                this.removeChild(linkEl);
                deferred.resolve(null);
            });

        this.uid = uid;
        this.removeChildren();

        linkEl.onLoaded(onLinkLoaded);
        this.appendChild(linkEl);

        return deferred.promise;
    }

    private stripOffAssets(html: string): string {
        var result = this.stripOffScripts(html);
        result = (api.BrowserHelper.isFirefox() || api.BrowserHelper.isSafari()) ? result : this.stripOffLinks(result); // leave stylesheet links for FF & Safari due to bug in processing them
        return result;
    }

    private stripOffScripts(html: string): string {
        return html.replace(/(?:<script\b[^>]*>[\s\S]*?<\/script>)/gm, "");
    }

    private stripOffLinks(html: string): string {
        return html.replace(/(?:<link\b[^<>]*[\\/]?>)/gm, "");
    }
}
