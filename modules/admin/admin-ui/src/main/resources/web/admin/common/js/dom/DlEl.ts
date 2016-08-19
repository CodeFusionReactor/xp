import {NewElementBuilder} from "./Element";
import {Element} from "./Element";

export class DlEl extends Element {

        constructor(className?: string) {
            super(new NewElementBuilder().setTagName("dl").setClassName(className));
        }
    }
