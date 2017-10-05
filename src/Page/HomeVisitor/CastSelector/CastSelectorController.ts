import HomeVisitorController from "../HomeVisitorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import ServantMap from "./ServantMap";
import CastSelectorView from "./CastSelectorView";


export default class CastSelectorController {

    public FrameCount = 4;
    public Servants: ServantMap;

    private _ownerController: HomeVisitorController;
    private _view: CastSelectorView;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {

        this._ownerController = controller;
        this._view = new CastSelectorView(controller, this);
        this.Servants = new ServantMap(this);
    }


    /**
     * 部屋変更に伴うサーバント一覧の変更
     * @param hid 
     */
    public ChangeRoom(hid: string) {
        this._ownerController.ServantCache.GetRoomServant(hid, (rs) => {
            this.ChangeRoomServantList(rs);
        });
    }


    /**
     * サーバント一覧表示切替
     * @param url 
     */
    public ChangeRoomServantList(rs: RoomServantSender) {

        let servants = rs.servants;

        if (servants) {
            this.Servants.SetServants(servants, () => {
                //  変更があった場合
                this._view.ChangeDisplayFrameCount(servants.length);
            });
        }

        //  アクティブタブの確認
        this._view.CheckChangeActiveFrame();
    }


    /**
     * 
     * @param index 
     * @param servant 
     */
    public SetServantFrame(index: number, servant: ServantSender) {
        this._view.SetServantFrame(index, servant);
    }


    /**
     * 
     * @param index 
     */
    public RemoveServantFrame(index: number) {
        this._view.RemoveServantFrame(index);
    }


    /**
     * サーバント側に使用アクターを通知
     */
    public NotifyServantToActor(element: HTMLFrameElement) {

        if (element) {
            let childDocument = element.contentDocument;
            let peerElement = childDocument.getElementById("peerid");
            let aidElement = childDocument.getElementById("aid");
            let iidElement = childDocument.getElementById("iid");

            if (peerElement && aidElement && iidElement) {
                peerElement.textContent = this._ownerController.PeerId;
                aidElement.textContent = this._ownerController.CurrentAid;
                iidElement.textContent = this._ownerController.CurrentActor.dispIid;
            }
        }
    }


    /**
     * サーバント側に使用アクターを通知
     */
    public NotifyServantToActorAll() {
        for (let i = 0; i < this.FrameCount; i++) {
            this.NotifyServantToActor(this._view.GetFrmaeElement(i));
        }
    }

}