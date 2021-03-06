export default class CursorDispOffset {

    clientWidth: number = 0;
    clientHeight: number = 0;
    dispWidth: number = 0;
    dispHeight: number = 0;
    offsetRight: number = 0;
    offsetTop: number = 0;
    aspect: number = 0;

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
        let divAspect: number = divWidth / divHeight;

        result.aspect = divAspect;
        result.clientWidth = video.clientWidth;
        result.clientHeight = video.clientHeight;

        if (divAspect > videoAspect) {
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
     * Content内に、指定比率の最大値で表示する為のOffset計算
     * @param contentClientWidth 
     * @param contentClientHeight 
     * @param cntlHeight 
     * @param aspect 
     */
    public static GetAspectDispOffset(contentClientWidth: number, contentClientHeight: number, aspect: number): CursorDispOffset {

        let result = new CursorDispOffset();

        result.aspect = aspect;
        result.clientWidth = contentClientWidth;
        result.clientHeight = contentClientHeight;

        if (aspect === 0) {
            //  アスペクト比指定がない場合
            result.dispHeight = result.clientHeight;
            result.dispWidth = result.clientWidth;
            result.offsetRight = 0;
            result.offsetTop = 0;
        }
        else if (result.clientHeight * aspect < result.clientWidth) {
            //  divが横に長い場合・・・
            result.dispHeight = result.clientHeight;
            result.dispWidth = result.clientHeight * aspect;
            result.offsetTop = 0;
            result.offsetRight = (result.clientWidth - result.dispWidth) / 2;
        }
        else {
            //  divが縦に長い場合
            result.dispWidth = result.clientWidth;
            result.dispHeight = result.clientWidth / aspect;
            result.offsetRight = 0;
            result.offsetTop = (result.clientHeight - result.dispHeight) / 2;
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

            let width: string;
            let height: string;

            if (offset.aspect > 0) {
                width = offset.dispWidth + "px";
                height = offset.dispHeight + "px";
            }
            else {
                width = "100%";
                height = "100%";
            }

            if (isControllLayer) {
                element.style.bottom = "0px";
                element.style.right = offset.offsetRight + "px";
                element.style.width = width;
            }
            else {
                element.style.top = offset.offsetTop + "px";
                element.style.right = offset.offsetRight + "px";
                element.style.width = width;
                element.style.height = height;
            }
        }
    }

}
