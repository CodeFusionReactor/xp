import {Component} from "./Component";
import {ComponentTypeWrapperJson} from "./ComponentTypeWrapperJson";
import {FragmentComponent} from "./FragmentComponent";
import {FragmentComponentBuilder} from "./FragmentComponent";
import {ImageComponent} from "./ImageComponent";
import {ImageComponentBuilder} from "./ImageComponent";
import {LayoutComponent} from "./LayoutComponent";
import {LayoutComponentBuilder} from "./LayoutComponent";
import {PartComponent} from "./PartComponent";
import {PartComponentBuilder} from "./PartComponent";
import {Region} from "./Region";
import {TextComponent} from "./TextComponent";
import {TextComponentBuilder} from "./TextComponent";

export class ComponentFactory {

        public static createFromJson(json: ComponentTypeWrapperJson, componentIndex: number, region: Region): Component {

            if (json.PartComponent) {
                return new PartComponentBuilder().fromJson(json.PartComponent, region).build();
            }
            else if (json.ImageComponent) {
                return new ImageComponentBuilder().fromJson(json.ImageComponent, region).build();
            }
            else if (json.LayoutComponent) {
                var layoutComponentBuilder = new LayoutComponentBuilder();
                layoutComponentBuilder.setIndex(componentIndex);
                return layoutComponentBuilder.fromJson(json.LayoutComponent, region);
            }
            else if (json.TextComponent) {
                return new TextComponentBuilder().fromJson(json.TextComponent, region).setIndex(componentIndex).build();
            }
            else if (json.FragmentComponent) {
                return new FragmentComponentBuilder().fromJson(json.FragmentComponent, region).setIndex(componentIndex).build();
            }
            else {
                throw new Error("Not a component that can be placed in a Region: " + json);
            }
        }
    }
