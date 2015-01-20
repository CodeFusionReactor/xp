module api.content.page.region {

    import PropertyIdProvider = api.data.PropertyIdProvider;

    export class Regions implements api.Equitable {

        public debug: boolean = true;

        private regionByName: {[s:string] : Region;} = {};

        private changedListeners: {(event: RegionsChangedEvent):void}[] = [];

        private componentPropertyChangedListeners: {(event: ComponentPropertyChangedEvent):void}[] = [];

        private regionChangedListeners: {(event: RegionChangedEvent):void}[] = [];

        private regionAddedListeners: {(event: RegionAddedEvent):void}[] = [];

        private regionRemovedListeners: {(event: RegionRemovedEvent):void}[] = [];

        constructor(builder: RegionsBuilder) {

            builder.regions.forEach((region: Region) => {
                if (this.regionByName[region.getName()] != undefined) {
                    throw new Error("Regions must be unique by name, duplicate found: " + region.getName());
                }

                this.addRegion(region);
            });
        }

        mergeRegions(descriptorRegions: RegionDescriptor[], parent: LayoutComponent): Regions {
            return new LayoutRegionsMerger().merge(this, descriptorRegions, parent);
        }

        addRegion(region: Region) {

            this.regionByName[region.getName()] = region;

            this.notifyRegionAdded(region.getPath());
            this.registerRegionListeners(region);
        }

        private registerRegionListeners(region: Region) {

            if (this.handleRegionChanged.bind) {
                region.onChanged(this.handleRegionChanged.bind(this));
                region.onComponentPropertyChangedEvent(this.forwardComponentPropertyChangedEvent.bind(this));
            }
            else {
                // PhantomJS does not support bind
                region.onChanged((event) => {
                    this.handleRegionChanged(event);
                });
                region.onComponentPropertyChangedEvent((event) => {
                    this.forwardComponentPropertyChangedEvent(event);
                });
            }
        }

        private unregisterRegionListeners(region: Region) {
            region.unChanged(this.handleRegionChanged);
            region.unComponentPropertyChangedEvent(this.forwardComponentPropertyChangedEvent);
        }

        private handleRegionChanged(event: BaseRegionChangedEvent) {
            this.notifyRegionChanged(event.getPath());
        }

        removeRegions(regions: Region[]) {
            regions.forEach((region: Region) => {
                delete this.regionByName[region.getName()];

                this.notifyRegionRemoved(region.getPath());
                this.unregisterRegionListeners(region);
            });
        }

        getRegions(): Region[] {
            var regions = [];
            for (var i in this.regionByName) {
                var region = this.regionByName[i];
                regions.push(region);
            }
            return regions;
        }

        getRegionByName(name: string): Region {

            return this.regionByName[name];
        }

        getComponent(path: ComponentPath): Component {

            var first: ComponentPathRegionAndComponent = path.getFirstLevel();
            var region = this.getRegionByName(first.getRegionName());
            var component = region.getComponentByIndex(first.getComponentIndex());

            if (path.numberOfLevels() == 1) {
                return component;
            }
            else {
                if (!api.ObjectHelper.iFrameSafeInstanceOf(component, LayoutComponent)) {
                    throw new Error("Expected component to be a LayoutComponent: " + api.ClassHelper.getClassName(component));
                }

                var layoutComponent = <LayoutComponent> component;
                return layoutComponent.getComponent(path.removeFirstLevel());
            }
        }

        /**
         * Keeps existing regions (including components) if they are listed in given regionDescriptors.
         * Removes others and adds those missing.
         * @param regionDescriptors
         */
        changeRegionsTo(regionDescriptors: RegionDescriptor[]) {

            // Remove regions not existing in regionDescriptors
            var regionsToRemove: Region[] = this.getRegions().
                filter((region: Region, index: number) => {
                    return !regionDescriptors.
                        some((regionDescriptor: RegionDescriptor) => {
                            return regionDescriptor.getName() == region.getName();
                        });
                });
            this.removeRegions(regionsToRemove);

            // Add missing regions
            regionDescriptors.forEach((regionDescriptor: RegionDescriptor) => {
                var region = this.getRegionByName(regionDescriptor.getName());
                if (!region) {
                    region = Region.create().
                        setName(regionDescriptor.getName()).
                        build();
                    this.addRegion(region);
                }
            });
        }

        public toJson(): RegionJson[] {

            var regionJsons: RegionJson[] = [];
            this.getRegions().forEach((region: Region) => {
                regionJsons.push(region.toJson());
            });
            return regionJsons;
        }

        equals(o: api.Equitable): boolean {

            if (!api.ObjectHelper.iFrameSafeInstanceOf(o, Regions)) {
                return false;
            }

            var other = <Regions>o;


            var thisRegions = this.getRegions();
            var otherRegions = other.getRegions();

            if (!api.ObjectHelper.arrayEquals(thisRegions, otherRegions)) {
                return false;
            }

            return true;
        }

        clone(generateNewPropertyIds: boolean = false): Regions {
            return new RegionsBuilder(this, generateNewPropertyIds).build();
        }

        onChanged(listener: (event: BaseRegionChangedEvent)=>void) {
            this.changedListeners.push(listener);
        }

        unChanged(listener: (event: BaseRegionChangedEvent)=>void) {
            this.changedListeners =
            this.changedListeners.filter((curr: (event: BaseRegionChangedEvent)=>void) => {
                return listener != curr;
            });
        }

        private notifyChanged(event: RegionsChangedEvent) {
            if (this.debug) {
                console.debug("Regions.notifyChanged");
            }
            this.changedListeners.forEach((listener: (event: RegionsChangedEvent)=>void) => {
                listener(event);
            });
        }

        onComponentPropertyChanged(listener: (event: ComponentPropertyChangedEvent)=>void) {
            this.componentPropertyChangedListeners.push(listener);
        }

        unComponentPropertyChanged(listener: (event: ComponentPropertyChangedEvent)=>void) {
            this.componentPropertyChangedListeners =
            this.componentPropertyChangedListeners.filter((curr: (event: ComponentPropertyChangedEvent)=>void) => {
                return listener != curr;
            });
        }

        private forwardComponentPropertyChangedEvent(event: ComponentPropertyChangedEvent) {
            this.componentPropertyChangedListeners.forEach((listener: (event: ComponentPropertyChangedEvent)=>void) => {
                listener(event);
            });
        }

        onRegionChanged(listener: (event: RegionChangedEvent)=>void) {
            this.regionChangedListeners.push(listener);
        }

        unRegionChanged(listener: (event: RegionChangedEvent)=>void) {
            this.regionChangedListeners =
            this.regionChangedListeners.filter((curr: (event: RegionChangedEvent)=>void) => {
                return listener != curr;
            });
        }

        private notifyRegionChanged(regionPath: RegionPath) {
            var event = new RegionChangedEvent(regionPath);
            if (this.debug) {
                console.debug("Regions.notifyRegionChanged: " + event.getRegionPath().toString());
            }
            this.regionChangedListeners.forEach((listener: (event: RegionChangedEvent)=>void) => {
                listener(event);
            });
            this.notifyChanged(event);
        }

        onRegionAdded(listener: (event: RegionAddedEvent)=>void) {
            this.regionAddedListeners.push(listener);
        }

        unRegionAdded(listener: (event: RegionAddedEvent)=>void) {
            this.regionAddedListeners =
            this.regionAddedListeners.filter((curr: (event: RegionAddedEvent)=>void) => {
                return listener != curr;
            });
        }

        private notifyRegionAdded(regionPath: RegionPath) {
            var event = new RegionAddedEvent(regionPath);
            if (this.debug) {
                console.debug("Regions.notifyRegionAdded: " + event.getRegionPath().toString());
            }
            this.regionAddedListeners.forEach((listener: (event: RegionAddedEvent)=>void) => {
                listener(event);
            });
            this.notifyChanged(event);
        }

        onRegionRemoved(listener: (event: RegionRemovedEvent)=>void) {
            this.regionRemovedListeners.push(listener);
        }

        unRegionRemoved(listener: (event: RegionRemovedEvent)=>void) {
            this.regionRemovedListeners =
            this.regionRemovedListeners.filter((curr: (event: RegionRemovedEvent)=>void) => {
                return listener != curr;
            });
        }

        private notifyRegionRemoved(regionPath: RegionPath) {
            var event = new RegionRemovedEvent(regionPath);
            if (this.debug) {
                console.debug("Regions.notifyRegionRemoved: " + event.getRegionPath().toString());
            }
            this.regionRemovedListeners.forEach((listener: (event: RegionRemovedEvent)=>void) => {
                listener(event);
            });
            this.notifyChanged(event);
        }

        public static create(): RegionsBuilder {

            return new RegionsBuilder();
        }
    }

    class RegionsBuilder {

        regions: Region[] = [];

        constructor(source?: Regions, generateNewPropertyIds: boolean = false) {
            if (source) {
                source.getRegions().forEach((region: Region) => {
                    this.regions.push(region.clone(generateNewPropertyIds));
                });
            }
        }

        fromJson(regionsJson: RegionJson[], propertyIdProvider: PropertyIdProvider, parent: LayoutComponent): RegionsBuilder {

            regionsJson.forEach((regionJson: RegionJson) => {

                var region = Region.create().
                    setName(regionJson.name).
                    setParent(parent).
                    build();

                regionJson.components.forEach((componentJson: ComponentTypeWrapperJson, componentIndex: number) => {
                    var component: Component = ComponentFactory.createFromJson(componentJson,
                        componentIndex, region, propertyIdProvider);
                    region.addComponent(component);
                });

                this.addRegion(region);
            });
            return this;
        }

        addRegion(value: Region): RegionsBuilder {
            this.regions.push(value);
            return this;
        }

        public build(): Regions {
            return new Regions(this);
        }
    }

}