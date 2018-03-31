export default class CursorDispOffset {

    clientWidth: number = 0;
    clientHeight: number = 0;
    dispWidth: number = 0;
    dispHeight: number = 0;
    offsetRight: number = 0;
    offsetTop: number = 0;

    /**
     * Videoの表示エリアのオフセット値計算（送信時/受信時共通処理）
     * @param video
     */
    public static GetVideoDispOffset(video: HTMLVideoElement): CursorDispOffset {

        let result = new CursorDispOffset();

        let videoWidth: number = video.videoWidth;
        let videoHeight: number = video.videoHeight;
        let videoAspect: number = videoWidth / videoHeight;

        let divWidth: number = video.clientWidth;
        let divHeight: number = video.clientHeight;
        let divAscpet: number = divWidth / divHeight;

        result.clientWidth = video.clientWidth;
        result.clientHeight = video.clientHeight;

        if (divAscpet > videoAspect) {
            //  divが横に長い場合・・・
            result.dispHeight = divHeight;
            result.dispWidth = result.dispHeight * videoAspect;
            result.offsetTop = 0;
            result.offsetRight = (divWidth - result.dispWidth) / 2;
        }
        else {
            //  divが縦に長い場合
            result.dispWidth = divWidth;
            result.dispHeight = result.dispWidth / videoAspect;
            result.offsetRight = 0;
            result.offsetTop = (divHeight - result.dispHeight) / 2;
        }

        return result;
    }


    /**
     * Div内の指定比率の最大比率で表示する為のOffset計算
     * @param content
     */
    public static GetAspectDispOffset(content: HTMLElement, aspect: number): CursorDispOffset {

        let result = new CursorDispOffset();

        result.clientWidth = content.clientWidth;
        result.clientHeight = content.clientHeight;

        if (aspect === 0) {
            //  アスペクト比指定がない場合
            result.dispHeight = content.clientHeight;
            result.dispWidth = content.clientWidth;
            result.offsetRight = 0;
            result.offsetTop = 0;
        }
        else if (content.clientHeight * aspect < content.clientWidth) {
            //  divが横に長い場合・・・
            result.dispHeight = content.clientHeight;
            result.dispWidth = content.clientHeight * aspect;
            result.offsetTop = 0;
            result.offsetRight = (content.clientWidth - result.dispWidth) / 2;
        }
        else {
            //  divが縦に長い場合
            result.dispWidth = content.clientWidth;
            result.dispHeight = content.clientWidth / aspect;
            result.offsetRight = 0;
            result.offsetTop = (content.clientHeight - result.dispHeight) / 2;
        }

        return result;
    }


    /**
     * 
     * @param element 
     * @param offset 
     * @param isControllLayer 
     */
    public static SetOffsetDiv(element: HTMLElement, offset: CursorDispOffset, isControllLayer: boolean) {
        if (element) {
            if (isControllLayer) {
                element.style.bottom = "0px";
                element.style.right = offset.offsetRight + "px";
                element.style.width = offset.dispWidth + "px";
            }
            else {
                element.style.top = offset.offsetTop + "px";
                element.style.right = offset.offsetRight + "px";
                element.style.width = offset.dispWidth + "px";
                element.style.height = offset.dispHeight + "px";
            }
        }
    }


}
