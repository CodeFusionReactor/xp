import {PartComponentView} from "./part/PartComponentView";
import {ContentViewBuilder} from "./ContentView";
import {ContentView} from "./ContentView";
import {CreateItemViewConfig} from "./CreateItemViewConfig";
import {ItemType} from "./ItemType";
import {ItemTypeConfigJson} from "./ItemTypeConfig";

export class ContentItemType extends ItemType {

        private static INSTANCE = new ContentItemType();

        static get(): ContentItemType {
            return ContentItemType.INSTANCE;
        }

        constructor() {
            super("content", <ItemTypeConfigJson>{
                cssSelector: '[data-portal-component-type=content]',
                draggable: false,
                cursor: 'pointer',
                iconCls: 'live-edit-font-icon-content',
                highlighterStyle: {
                    stroke: '',
                    strokeDasharray: '',
                    fill: 'rgba(0, 108, 255, .25)'
                },
                contextMenuConfig: ['parent', 'opencontent', 'view']
            });
        }

        createView(config: CreateItemViewConfig<PartComponentView,any>): ContentView {
            return new ContentView(new ContentViewBuilder().
                setParentPartComponentView(config.parentView).
                setParentElement(config.parentElement).
                setElement(config.element));
        }
    }

    ContentItemType.get();
