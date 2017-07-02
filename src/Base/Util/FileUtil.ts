

interface OnFileSelect { (file: File) };
interface OnImport { (data: string) };

/**
 * 
 */
export default class FileUtil {

    /**
     * エクスポートファイルの拡張子
     */
    public static EXPORT_EXT = ".skybeje";

    /**
     * エクスポートのデフォルトファイル名を取得
     * @param name 
     */
    public static GetDefaultFileName(name: string) {

        let now = new Date();

        let year = ("0000" + (now.getFullYear().toString())).slice(-4);
        let month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
        let day = ("0" + now.getDate().toString()).slice(-2);
        let hours = ("0" + now.getHours().toString()).slice(-2);
        let min = ("0" + now.getMinutes().toString()).slice(-2);
        let sec = ("0" + now.getSeconds().toString()).slice(-2);

        let datetime = year + month + day + "-" + hours + min + sec;
        let filename = "SkyBeje_" + datetime + "_" + name + this.EXPORT_EXT;

        return filename;

    }


    /**
     * インポート処理
     * @param file 
     * @param callback 
     */
    public static Import(file: File, callback: OnImport) {

        if (!file || file.name.length === 0)
            return;

        let reader = new FileReader();
        reader.readAsText(file);

        let data: any;

        reader.onload = (ev) => {
            data = JSON.parse(reader.result);
        }

        reader.onloadend = (ev) => {
            callback(data);
        }
    }


    /**
     * エクスポートファイルの選択ダイアログ表示
     * @param callback 
     */
    public static SelectImportFile(callback: OnFileSelect) {
        this.Select(true, this.EXPORT_EXT, false, callback);
    }


    /**
     * 画像ファイルの選択ダイアログ表示
     * @param callback 
     */
    public static SelectImageFile(callback: OnFileSelect) {
        this.Select(false, "image/*", false, callback);
    }


    /**
     * 画像ファイルの選択ダイアログ表示　※※動作未検証※※
     * @param callback 
     */
    public static SelectImageCamera(callback: OnFileSelect) {
        this.Select(false, "image/*", true, callback);
    }


    /**
     * ファイル選択ダイアログを開きます
     * @param multiple 
     * @param accept 
     * @param isCamera
     * @param callback 
     */
    private static Select(multiple: boolean = false, accept: string = "", isCamera = false, callback: OnFileSelect) {

        let inputElement: HTMLInputElement = document.createElement("input") as HTMLInputElement;
        inputElement.type = 'file';
        inputElement.hidden = true;
        inputElement.multiple = multiple;
        inputElement.accept = accept;

        if( isCamera){
            (inputElement as any).capture = 'camera'
        }

        document.body.appendChild(inputElement);

        inputElement.onchange = ((event) => {
            let files = (event.target as any).files as FileList;

            for (let i = 0; i < files.length; i++) {
                callback(files[i]);
            }

            document.body.removeChild(inputElement);
        });

        inputElement.click();
    }


    /**
     * 
     * @param value 
     */
    public static Export(filename: string, value: string) {

        //  出力テキストのフォーマット編集
        let strValue = this.JsonFormatter(value);

        this.str2bytes(strValue, (buffer: ArrayBuffer) => {

            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(new Blob([buffer], { type: "text/plain" }), filename);
            } else {
                let a: any = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([buffer], { type: "text/plain" }));
                a.download = filename;
                document.body.appendChild(a) //  FireFox specification
                a.click();
                document.body.removeChild(a) //  FireFox specification
            }
        });
    }


    /**
     * Json文字列の加工
     * 改行コードを入れテキストエディタで加工しやすい形にする
     */
    private static JsonFormatter(str: string): string {

        str = str.replace(/},/g, '},\r\n');
        str = str.replace(/],/g, '],\r\n');
        str = str.replace(/}],/g, '}\r\n],');
        str = str.replace(/\[/g, '\[\r\n');

        return str;
    }


    /**
     * 文字列をバイナリに変換
     */
    private static str2bytes(str, callback) {
        let fr = new FileReader();
        fr.onloadend = function () {
            callback(fr.result);
        };
        fr.readAsArrayBuffer(new Blob([str]));
    }

}