module api.content.inputtype.image {

    import SelectedOption = api.ui.selector.combobox.SelectedOption;
    import ContentSummary = api.content.ContentSummary;
    import ValueChangedEvent = api.form.inputtype.ValueChangedEvent;

    export class SelectedOptionsView extends api.ui.selector.combobox.SelectedOptionsView<ContentSummary> {

        private numberOfOptionsPerRow: number = 3;

        private activeOption: SelectedOption<ContentSummary>;

        private selection: SelectedOption<ContentSummary>[] = [];

        private toolbar: SelectionToolbar;

        private dialog: ImageSelectorDialog;

        private editSelectedOptionsListeners: {(option: SelectedOption<ContentSummary>[]): void}[] = [];

        private removeSelectedOptionsListeners: {(option: SelectedOption<ContentSummary>[]): void}[] = [];

        private valueChangedListeners: {(event: ValueChangedEvent) : void}[] = [];

        private mouseClickListener: {(MouseEvent): void};

        constructor() {
            super();

            this.dialog = new ImageSelectorDialog();
            this.dialog.hide();
            this.appendChild(this.dialog);

            jQuery(this.getHTMLElement()).sortable({
                containment: this.getHTMLElement(),
                cursor: 'move',
                tolerance: 'pointer',
                update: (event: Event, ui: JQueryUI.SortableUIParams) => this.handleDnDUpdate()
            });

            this.toolbar = new SelectionToolbar();
            this.toolbar.hide();
            this.toolbar.onEditClicked(() => {
                this.notifyEditSelectedOptions(this.selection);
            });
            this.toolbar.onRemoveClicked(() => {
                this.notifyRemoveSelectedOptions(this.selection);
                // clear the selection;
                this.selection.length = 0;
                this.updateSelectionToolbarLayout();

            });
            this.appendChild(this.toolbar);

            this.onShown((event: api.dom.ElementShownEvent) => {
                this.updateLayout();
            });
        }

        private notifyRemoveSelectedOptions(option: SelectedOption<ContentSummary>[]) {
            this.removeSelectedOptionsListeners.forEach((listener) => {
                listener(option);
            });
        }

        onRemoveSelectedOptions(listener: (option: SelectedOption<ContentSummary>[]) => void) {
            this.removeSelectedOptionsListeners.push(listener);
        }

        unRemoveSelectedOptions(listener: (option: SelectedOption<ContentSummary>[]) => void) {
            this.removeSelectedOptionsListeners = this.removeSelectedOptionsListeners.filter(function (curr) {
                return curr != listener;
            });
        }

        private notifyEditSelectedOptions(option: SelectedOption<ContentSummary>[]) {
            this.editSelectedOptionsListeners.forEach((listener) => {
                listener(option);
            });
        }

        onEditSelectedOptions(listener: (option: SelectedOption<ContentSummary>[]) => void) {
            this.editSelectedOptionsListeners.push(listener);
        }

        unEditSelectedOptions(listener: (option: SelectedOption<ContentSummary>[]) => void) {
            this.editSelectedOptionsListeners = this.editSelectedOptionsListeners.filter(function (curr) {
                return curr != listener;
            });
        }

        createSelectedOption(option: api.ui.selector.Option<ContentSummary>, index: number): SelectedOption<ContentSummary> {

            return new SelectedOption<ContentSummary>(new SelectedOptionView(option), option, index);
        }

        addOptionView(option: SelectedOption<ContentSummary>) {

            this.dialog.hide();
            var optionView: SelectedOptionView = <SelectedOptionView>option.getOptionView();

            optionView.onClicked((event: MouseEvent) => {
                if (this.dialog.isVisible()) {
                    this.hideImageSelectorDialog();
                    optionView.getCheckbox().giveBlur();
                } else {
                    optionView.getCheckbox().giveFocus();
                }
            });

            optionView.getCheckbox().onKeyDown((event: KeyboardEvent) => {
                switch (event.which) {
                case 9: // Tab
                    if (this.isFirstInRow(option.getIndex()) || this.isLast(option.getIndex())) {
                        this.hideImageSelectorDialog();
                    }
                    break;
                case 8: // Backspace
                    optionView.getCheckbox().setChecked(false);
                    this.removeOptionViewAndRefocus(option);
                    event.preventDefault();
                    break;
                case 46: // Delete
                    optionView.getCheckbox().setChecked(false);
                    this.removeOptionViewAndRefocus(option);
                    break;
                case 13: // Enter
                    this.notifyEditSelectedOptions([option]);
                    break;
                }
                event.stopPropagation();
            });

            optionView.onChecked((view: SelectedOptionView, checked: boolean) => {
                if (checked) {
                    this.selection.push(option);
                } else {
                    var index = this.selection.indexOf(option);
                    if (index > -1) {
                        this.selection.splice(index, 1);
                    }
                }

                this.updateSelectionToolbarLayout();
            });

            optionView.onFocusChanged((view: SelectedOptionView, event: FocusChangedEvent) => {
                if (event.isFocused()) {
                    this.showImageSelectorDialog(option);
                }
            });

            optionView.getIcon().onLoaded((event: UIEvent) => {
                this.updateOptionViewLayout(optionView, this.calculateOptionHeight());
                jQuery(this.getHTMLElement()).sortable("refresh");
            });

            optionView.insertBeforeEl(this.toolbar);
        }

        private removeOptionViewAndRefocus(option: SelectedOption<ContentSummary>) {
            var index = this.isLast(option.getIndex()) ?
                (this.isFirst(option.getIndex()) ? -1 : option.getIndex() - 1) :
                option.getIndex();

            this.removeOptionView(option);
            this.notifyRemoveSelectedOptions([option]);
            this.hideImageSelectorDialog();

            if (index > -1) {
                (<SelectedOptionView>this.getSelectedOptionViews()[index]).getCheckbox().giveFocus();
            }
        }

        private showImageSelectorDialog(option: SelectedOption<ContentSummary>) {

            var selectedOptionViews = this.getSelectedOptionViews();
            for (var i = 0; i < selectedOptionViews.length; i++) {
                var view = <SelectedOptionView>selectedOptionViews[i];
                var passedSelectedOption = i >= option.getIndex();
                if ((this.isLastInRow(i) || this.isLast(i)) && passedSelectedOption) {
                    this.dialog.insertAfterEl(view);
                    break;
                }
            }

            if (this.activeOption) {
                this.activeOption.getOptionView().removeClass('editing first-in-row last-in-row');
            }
            this.activeOption = option;
            option.getOptionView().addClass('editing' + (this.isFirstInRow(option.getIndex()) ? ' first-in-row' : '') +
                                            (this.isLastInRow(option.getIndex()) ? ' last-in-row' : ''));

            this.dialog.setContent(option.getOption().displayValue);
            if (!this.dialog.isVisible()) {
                this.setOutsideClickListener();
                this.dialog.show();
                this.updateDialogLayout(this.calculateOptionHeight());
            }

            jQuery(this.getHTMLElement()).sortable("disable");
        }

        updateLayout() {
            var optionHeight = this.calculateOptionHeight();
            this.getSelectedOptionViews().forEach((optionView: SelectedOptionView) => {
                this.updateOptionViewLayout(optionView, optionHeight);
            });
            if (this.dialog.isVisible()) {
                this.updateDialogLayout(optionHeight);
            }
        }

        private updateOptionViewLayout(optionView: SelectedOptionView, optionHeight: number) {
            optionView.getEl().setHeightPx(optionHeight);
            var iconHeight = optionView.getIcon().getEl().getHeightWithBorder();
            if (iconHeight < optionHeight && iconHeight !== 0) {
                optionView.getIcon().getEl().setMarginTop((optionHeight - iconHeight) / 2 + 'px');
            }
        }

        private updateDialogLayout(optionHeight) {
            this.dialog.getEl().setMarginTop(((optionHeight / 3) - 20) + 'px');
        }

        private updateSelectionToolbarLayout() {
            var showToolbar = this.selection.length > 0;
            this.toolbar.setVisible(showToolbar);
            if (showToolbar) {
                this.toolbar.setSelectionCount(this.selection.length);
            }
        }

        private calculateOptionHeight(): number {
            var availableWidth = this.getEl().getWidthWithMargin();
            return Math.floor(0.3 * availableWidth);
        }

        private hideImageSelectorDialog() {
            this.dialog.hide();
            this.activeOption.getOptionView().removeClass('editing first-in-row last-in-row');
            jQuery(this.getHTMLElement()).sortable("enable");

            api.dom.Body.get().unClicked(this.mouseClickListener);
        }

        private setOutsideClickListener() {
            this.mouseClickListener = (event: MouseEvent) => {
                for (var element = event.target; element; element = (<any>element).parentNode) {
                    if (element == this.getHTMLElement()) {
                        return;
                    }
                }
                this.hideImageSelectorDialog();
            };

            api.dom.Body.get().onClicked(this.mouseClickListener);
        }

        private isFirstInRow(index: number): boolean {
            return index % this.numberOfOptionsPerRow == 0;
        }

        private isLastInRow(index: number): boolean {
            return index % this.numberOfOptionsPerRow == 2;
        }

        private isFirst(index: number): boolean {
            return index == 0;
        }

        private isLast(index: number): boolean {
            return index == this.getSelectedOptionViews().length - 1;
        }

        private handleDnDUpdate() {
            var orderedOptions = this.resolveViewsInOrderAccordingToDOM();

            orderedOptions.forEach((view: SelectedOptionView, index: number) => {
                this.getSelectedOptions().getByView(view).setIndex(index);
            });

            this.reorderOptionsAccordingToNewIndexes();
        }

        private resolveViewsInOrderAccordingToDOM(): SelectedOptionView[] {
            var orderedOptions: SelectedOptionView[] = [];

            var optionViews = this.getSelectedOptions().getOptionViews();

            var domChildren = this.getHTMLElement().children;
            for (var i = 0; i < domChildren.length; i++) {
                var domChild = <HTMLElement> domChildren[i];
                var childEl = optionViews.filter((optionView: SelectedOptionView) => (optionView.getHTMLElement() == domChild))[0];
                if (childEl) {
                    orderedOptions.push(<SelectedOptionView>childEl);
                }
            }

            return orderedOptions;
        }

        private reorderOptionsAccordingToNewIndexes() {

            var oldIndexes = this.getSelectedOptions().getIndexes();

            this.getSelectedOptions().reorderAccordingToIndexes();

            oldIndexes.forEach((index: number, arrayPosition: number) => {
                if (index != arrayPosition) {
                    var option = this.getSelectedOptions().getSelectedOption(arrayPosition).getOption();
                    var value = new api.data.Value(option.displayValue.getContentId(), api.data.ValueTypes.CONTENT_ID);
                    var event = new ValueChangedEvent(value, arrayPosition);
                    this.notifyValueChanged(event);
                }
            });
        }

        onValueChanged(listener: (event: ValueChangedEvent) => void) {
            this.valueChangedListeners.push(listener);
        }

        unValueChanged(listener: (event: ValueChangedEvent) => void) {
            this.valueChangedListeners.filter((currentListener: (event: ValueChangedEvent)=>void) => {
                return listener == currentListener;
            });
        }

        private notifyValueChanged(event: ValueChangedEvent) {
            this.valueChangedListeners.forEach((listener: (event: ValueChangedEvent)=>void) => {
                listener(event);
            });
        }
    }

}
