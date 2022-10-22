
export class BlckCheckResult {

    constructor() {
    }

    IsBlock: boolean;
    CanUseMic: boolean;
    CanUseCamera: boolean;
    ErrorTitle: string;
    ErrorDetail: string;
}



export default class StreamChecker {


    /**
     * マイクを使用できるか？
     */
    public static CanUseMic: boolean = false;

    /**
     * カメラを使用できるか？
     */
    public static CanUseCamera: boolean = false;


    /**
     * 
     */
    public static async BlockCheck(): Promise<BlckCheckResult> {

        let result = new BlckCheckResult();

        this.CanUseMic = await this.CheckUserMedia({ audio: true });
        this.CanUseCamera = await this.CheckUserMedia({ video: true });

        result.CanUseMic = this.CanUseMic;
        result.CanUseCamera = this.CanUseCamera;

        if (this.CanUseMic && this.CanUseCamera) {
            result.IsBlock = false;
            result.ErrorTitle = "";
            result.ErrorDetail = "";
        }
        else {
            let target = "";
            if (!StreamChecker.CanUseCamera) {
                if (!StreamChecker.CanUseMic) {
                    target = "カメラとマイク";
                }
                else {
                    target = "カメラ";
                }
            } else {
                target = "マイク";
            }

            result.IsBlock = true;
            result.ErrorTitle = `${target}がブロックされています`;
            result.ErrorDetail = `${target}へのアクセスを許可する必要があります。ブラウザのアドレスバー上のインフォメーションアイコンをクリックし、ブロックされた${target}の利用を許可してください`;
        }

        return result;
    }


    public static async GetRanges(deviceId: string, deviceName: string): Promise<Array<MediaStreamConstraints>> {

        let result = new Array<MediaStreamConstraints>;

        //  16:9の比率となるカメラ画像の一蘭
        var sizeList = [
            //  { width: 160, height: 120 },
            { width: 320, height: 180 },
            //  { width: 320, height: 240 },
            { width: 640, height: 360 },
            //  { width: 640, height: 480 },
            //  { width: 768, height: 576 },
            { width: 1024, height: 576 },
            { width: 1280, height: 720 },
            //  { width: 1280, height: 768 },
            //  { width: 1280, height: 800 },
            //  { width: 1280, height: 900 },
            //  { width: 1280, height: 1000 },
            { width: 1920, height: 1080 },
            //  { width: 1920, height: 1200 },
            //  { width: 2560, height: 1440 },
            //  { width: 3840, height: 2160 },
            //  { width: 4096, height: 2160 }
        ];

        for (let size of sizeList) {

            let constraints: MediaStreamConstraints = {
                video: ({
                    advanced: ([{
                        deviceId: deviceId,
                        width: size.width,
                        height: size.height
                    }])
                }),
                audio: false,
            };

            // カメラ画像の解像度取得
            await navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    let tracks = stream.getTracks();
                    let count = tracks.length;
                    if (count > 0) {
                        if (deviceName == tracks[0].label) {
                            result.push(constraints);
                        }
                    }
                    this.Stop(stream);
                }).catch(err => {
                    //  
                });
        }

        return result;
    }


    /**
     * ユーザーメディアの状態をチェック
     * @param constraints 
     * @returns 
     */
    public static async CheckUserMedia(constraints?: MediaStreamConstraints): Promise<boolean> {

        let result = false;

        // カメラ単体検証（ブロック有無）
        await navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                result = true;
                this.Stop(stream);
            }).catch(err => {
                result = false;
            });

        return result;
    }


    /**
     * 指定ストリームを停止します
     * @param stream 
     */
    public static Stop(stream: MediaStream) {
        if (stream) {
            let tracks = stream.getTracks();
            let count = tracks.length;
            if (count > 0) {
                for (let i = count - 1; i >= 0; i--) {
                    let track: MediaStreamTrack = tracks[i];
                    track.stop();
                    stream.removeTrack(track);
                }
            }
        }
    }

}