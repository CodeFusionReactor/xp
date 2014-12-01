declare var plupload;

module api.content.form.inputtype.imageupload {

    import Property = api.data.Property;
    import Value = api.data.Value;
    import ValueType = api.data.ValueType;
    import ValueTypes = api.data.ValueTypes;

    export class Image extends api.form.inputtype.support.BaseInputTypeSingleOccurrence<any,string> {

        private imageUploader: api.ui.uploader.ImageUploader;

        private attachmentName: string;

        private attachment: api.content.attachment.Attachment;

        constructor(config: api.content.form.inputtype.ContentInputTypeViewContext<any>) {
            super(config, "image");

            var input = config.input;
            var attachments: api.content.attachment.Attachment[] = config.attachments.getAttachments();

            if (attachments.length > 1) {
                throw new Error("Expected max one attachment for Image content, actual " + (attachments.length));
            }

            this.attachment = attachments.pop();

            var uploadUrl = api.util.UriHelper.getRestUri("blob/upload");
            var imageUploaderConfig = <api.ui.uploader.ImageUploaderConfig> {
                showImageAfterUpload: true,
                maximumOccurrences: 1
            };
            this.imageUploader = new api.ui.uploader.ImageUploader(input.getName(), uploadUrl, imageUploaderConfig);


            this.appendChild(this.imageUploader);
        }

        getContext(): api.content.form.inputtype.ContentInputTypeViewContext<any> {
            return <api.content.form.inputtype.ContentInputTypeViewContext<any>>super.getContext();
        }

        getValueType(): ValueType {
            return ValueTypes.STRING;
        }

        newInitialValue(): Value {
            return null;
        }

        layoutProperty(input: api.form.Input, property: Property) {

            if (property.hasNonNullValue()) {
                this.attachmentName = property.getString();
                var imgUrl = new ContentImageUrlResolver().
                    setContentId(this.getContext().contentId).
                    setSize(494).resolve();
                this.imageUploader.setValue(imgUrl);
            }

            this.imageUploader.onImageUploaded((event: api.ui.uploader.ImageUploadedEvent) => {
                if (this.attachmentName == null) {
                    this.attachmentName = event.getUploadedItem().getName();
                    this.attachment = this.uploadItemToAttachment(event.getUploadedItem());

                    var value = new Value(this.attachmentName, ValueTypes.STRING);
                    property.setValue(value);
                }
            });

            this.imageUploader.onImageReset(() => {
                this.attachment = null;
                this.attachmentName = null;
                var value = ValueTypes.STRING.newNullValue();
                property.setValue(value);
            });
        }

        getAttachments(): api.content.attachment.Attachment[] {
            return this.attachment ? [this.attachment] : [];
        }

        validate(silent: boolean = true): api.form.inputtype.InputValidationRecording {

            return new api.form.inputtype.InputValidationRecording();
        }

        onFocus(listener: (event: FocusEvent) => void) {
            this.imageUploader.onFocus(listener);
        }

        unFocus(listener: (event: FocusEvent) => void) {
            this.imageUploader.unFocus(listener);
        }

        onBlur(listener: (event: FocusEvent) => void) {
            this.imageUploader.onBlur(listener);
        }

        unBlur(listener: (event: FocusEvent) => void) {
            this.imageUploader.unBlur(listener);
        }

        private uploadItemToAttachment(uploadItem: api.ui.uploader.UploadItem): api.content.attachment.Attachment {
            return new api.content.attachment.AttachmentBuilder().
                setBlobKey(uploadItem.getBlobKey()).
                setAttachmentName(new api.content.attachment.AttachmentName(uploadItem.getName())).
                setMimeType(uploadItem.getMimeType()).
                setSize(uploadItem.getSize()).
                build();
        }
    }

    api.form.inputtype.InputTypeManager.register(new api.Class("Image", Image));
}