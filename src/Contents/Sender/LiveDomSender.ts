import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class LiveDomSender extends Sender {

    public static ID = "LiveDom";

    constructor() {
        super(LiveDomSender.ID);
        this.isDispControlLayer = false;
        this.isAspectFix = false;
        this.aspectW = 0;
        this.aspectH = 0;
        this.layerBackgroundB = "";
        this.layerBackgroundF = "";
        this.layerActive = "";
        this.layerControl = "";
    }

    public isDispControlLayer: boolean;
    public isAspectFix: boolean;
    public aspectW: number;
    public aspectH: number;
    public layerBackgroundB: string;
    public layerBackgroundF: string;
    public layerActive: string;
    public layerControl: string;


    public static Equals(s1: LiveDomSender, s2: LiveDomSender): boolean {
        if (s1.isDispControlLayer === s2.isDispControlLayer
            && s1.isAspectFix === s2.isAspectFix
            && s1.aspectH === s2.aspectH
            && s1.aspectW === s2.aspectW
            && s1.layerBackgroundB === s2.layerBackgroundB
            && s1.layerBackgroundF === s2.layerBackgroundF
            && s1.layerActive === s2.layerActive
            && s1.layerControl === s2.layerControl) {
            return true;
        }
        else {
            return false;
        }
    }
}