

interface OnDropToHtml { (html: string) }

export default class HtmlGenerator {

    /**
     * ドラック＆ドロップイベントを追加します
     * @param textArea 
     * @param onDropUrl 
     */
    public static SetEvent(textArea: HTMLTextAreaElement, callback: OnDropToHtml) {

        //  ガイドエリアのイベント（ドラック＆ドロップ用）
        textArea.ondragover = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            textArea.focus();
        };

        //  ドロップ時イベント
        textArea.ondrop = (event: DragEvent) => {

            event.preventDefault();

            var items = event.dataTransfer.items;

            for (var i = 0; i < items.length; i++) {

                var item: DataTransferItem = items[i];

                if ((item.kind == 'string') && (item.type.match('^text/plain'))) {
                    item.getAsString((text) => { callback(text); });
                } else if ((item.kind == 'string') && (item.type.match('^text/html'))) {
                    item.getAsString((s) => { this.DataTransferItem(s, callback) });
                } else if ((item.kind == 'string') && (item.type.match('^text/uri-list'))) {
                    item.getAsString((url) => { this.DropUrl(url, callback); });
                } else if ((item.kind == 'file') && (item.type.match('^image/'))) {
                    var f = item.getAsFile();
                    item.getAsString((url) => { this.DropUrl(url, callback); });
                }
            }
        };

    }

    /**
     * データ変換処理
     * @param value
     */
    private static DataTransferItem(value: string, callback: OnDropToHtml) {
        let doc: Document = new DOMParser().parseFromString(value, 'text/html');
        let image = doc.images[0];

        if (image) {
            let result = image.attributes.getNamedItem('src').nodeValue;
            let html = "<img class='fit' src='" + result + "'></img>";
            callback(html);
        }
    }


    /**
     * 
     * @param url 
     * @param callback 
     */
    private static DropUrl(url: string, callback: OnDropToHtml) {
        let html = "<iframe class='full' src='" + url + "'></iframe>";
        callback(html);
    }


}
