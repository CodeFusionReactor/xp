import {Element} from "./Element";

export class WindowDOM {

        private el: any; // Window clashes with WindowDOM

        private static instance: WindowDOM = new WindowDOM();

        private onBeforeUnloadListeners: {(event): void;}[] = [];

        private onUnloadListeners: {(event): void;}[] = [];

        static get(): WindowDOM {
            return WindowDOM.instance;
        }

        constructor() {
            this.el = window;

            this.el.onbeforeunload = (event) => {
                this.onBeforeUnloadListeners.forEach((listener) => listener(event));
            };

            this.el.onunload = (event) => {
                this.onUnloadListeners.forEach((listener) => listener(event));
            };
        }

        asWindow(): Window {
            return this.el;
        }

        getTopParent(): WindowDOM {

            var parent = this.getParent();
            if (!parent) {
                return null;
            }

            var i = 0;
            do {
                var next = parent.getParent();
                if (!next) {
                    return parent;
                }
                parent = next;
                i++;
            }
            while (i < 10);
            return  null;
        }

        getParent(): WindowDOM {
            var parent = this.el.parent;
            if (parent === this.el) {
                return null;
            }
            return parent.WindowDOM.get();
        }

        getHTMLElement(): HTMLElement {
            return this.el;
        }

        getScrollTop(): number {
            return wemjq(this.el).scrollTop();
        }

        onResized(listener: (event: UIEvent) => void, element?: Element) {
            this.el.addEventListener("resize", listener);

            if (element) {
                element.onRemoved(() => this.unResized(listener));
            }
        }

        unResized(listener: (event: UIEvent) => void) {
            this.el.removeEventListener("resize", listener);
        }

        getWidth(): number {
            return wemjq(this.el).innerWidth();
        }

        getHeight(): number {
            return wemjq(this.el).innerHeight();
        }

        onScroll(listener: (event: UIEvent) => void, element?: Element) {
            this.el.addEventListener('scroll', listener);

            if (element) {
                element.onRemoved(() => this.unScroll(listener));
            }
        }

        unScroll(listener: (event: UIEvent) => void) {
            this.el.removeEventListener('scroll', listener);
        }

        onBeforeUnload(listener: (event) => void) {
            this.onBeforeUnloadListeners.push(listener);
        }

        unBeforeUnload(listener: (event) => void) {
            this.onBeforeUnloadListeners = this.onBeforeUnloadListeners.filter((curr) => {
                return curr != listener;
            });
            return this;
        }

        onUnload(listener: (event) => void) {
            this.onUnloadListeners.push(listener);
        }
    }

