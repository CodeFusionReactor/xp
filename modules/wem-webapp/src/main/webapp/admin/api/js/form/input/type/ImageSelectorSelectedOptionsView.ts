module api_form_input_type {

    export class ImageSelectorSelectedOptionsView extends api_ui_combobox.ComboBoxSelectedOptionsView<ImageSelectorSelectedOption> {

        private clearer:api_dom.DivEl;

        private selectedItems:api_ui_combobox.OptionData<ImageSelectorSelectedOption>[] = [];

        private editedItem:api_ui_combobox.OptionData<ImageSelectorSelectedOption>;

        private dialog:api_dom.DivEl;

        constructor() {
            super();
            this.clearer = new api_dom.DivEl(null, "clearer");
            this.appendChild(this.clearer);
        }

        addItem(optionData:api_ui_combobox.OptionData<ImageSelectorSelectedOption>) {

            if (this.dialog) {
                this.dialog.remove();
                if (this.editedItem) {
                    this.getChildren()[this.selectedItems.indexOf(this.editedItem)].removeClass("editing");
                }
            }

            this.selectedItems.push( optionData );

            var imageSelectorOption:ImageSelectorSelectedOption = optionData.displayValue;
            var optionView = new ImageSelectorSelectedOptionView(imageSelectorOption);
            optionView.getEl().addEventListener("click", () => {
                this.showImageSelectorDialog(optionData);
            });
            optionView.insertBeforeEl(this.clearer);
        }

        showImageSelectorDialog(optionData:api_ui_combobox.OptionData<ImageSelectorSelectedOption>) {
            var imageSelectorOption:ImageSelectorSelectedOption = optionData.displayValue;
            var content = imageSelectorOption.getContent();
            if (this.dialog) {
                this.dialog.remove();
            }
            if (this.editedItem == optionData) {
                this.getChildren()[this.selectedItems.indexOf(optionData)].removeClass("editing");
                this.editedItem = null;
                return;
            } else {
                if (this.editedItem) {
                    this.getChildren()[this.selectedItems.indexOf(this.editedItem)].removeClass("editing");
                }
                this.getChildren()[this.selectedItems.indexOf(optionData)].addClass("editing");
                this.editedItem = optionData;
            }

            this.dialog = new api_dom.PEl().addClass("dialog");

            var name = new api_dom.H1El();
            name.getEl().setInnerHtml(content.getName());
            this.dialog.appendChild(name);

            var path = new api_dom.PEl();
            path.getEl().setInnerHtml(content.getPath().toString());
            this.dialog.appendChild(path);

            var buttonsBar = new api_dom.DivEl().addClass("buttons-bar");

            var editButton = new api_ui.Button("Edit").addClass("edit");
            buttonsBar.appendChild(editButton);

            var removeButton = new api_ui.Button("Remove").addClass("remove");
            removeButton.getEl().addEventListener("click", (event) => {
                this.dialog.remove();
                this.editedItem = null;
                var itemIndex = this.selectedItems.indexOf(optionData);
                this.selectedItems.splice(itemIndex, 1);
                this.getChildren()[itemIndex].remove();
                this.notifySelectedOptionRemoved(optionData);
            });
            buttonsBar.appendChild(removeButton);

            this.dialog.appendChild(buttonsBar);

            var itemIndex = this.selectedItems.indexOf(optionData);
            var insertIndex = Math.min(itemIndex - (itemIndex % 3) + 3, this.selectedItems.length) - 1;

            this.dialog.insertAfterEl(this.getChildren()[insertIndex]);
        }

    }


}