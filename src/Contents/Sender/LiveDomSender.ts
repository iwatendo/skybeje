import Sender from "../../Base/Container/Sender";
import { PageSettings } from "../IndexedDB/LiveHTML";


/**
 * 
 */
export default class LiveDomSender extends Sender {

    public static ID = "LiveDom";

    constructor(ps: PageSettings = new PageSettings()) {
        super(LiveDomSender.ID);
        this.isDispControlLayer = ps.isDispControlLayer;
        this.isAspectFix = ps.isAspectFix;
        this.aspectW = ps.aspectW;
        this.aspectH = ps.aspectH;
        this.layerBackgroundB = ps.layerBackgroundB;
        this.layerBackgroundF = ps.layerBackgroundF;
        this.layerActive = ps.layerActive;
        this.layerControl = ps.layerControl;
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