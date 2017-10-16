import HomeVisitorController from "../HomeVisitorController";
import { RoomServentSender, ServentSender } from "../../HomeInstance/HomeInstanceContainer";
import ServentMap from "./ServentMap";
import CastSelectorView from "./CastSelectorView";


export default class CastSelectorController {

    public FrameCount = 6;
    public Servents: ServentMap;

    private _ownerController: HomeVisitorController;
    private _view: CastSelectorView;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {

        this._ownerController = controller;
        this._view = new CastSelectorView(controller, this);
        this.Servents = new ServentMap(this);
    }


    /**
     * 部屋変更に伴うサーバント一覧の変更
     * @param hid 
     */
    public ChangeRoom(hid: string) {
        this._ownerController.ServentCache.GetRoomServent(hid, (rs) => {
            this.ChangeRoomServentList(rs);
        });
    }


    /**
     * サーバント一覧表示切替
     * @param url 
     */
    public ChangeRoomServentList(rs: RoomServentSender) {

        let servents = rs.servents;

        if (servents) {
            this.Servents.SetServents(servents, () => {
                //  変更があった場合
                this._view.ChangeDisplayFrameCount(servents.length);
            });
        }

        //  アクティブタブの確認
        this._view.CheckChangeActiveFrame();
    }


    /**
     * 
     * @param index 
     * @param servent 
     */
    public SetServentFrame(index: number, servent: ServentSender) {
        this._view.SetServentFrame(index, servent);
    }


    /**
     * 
     * @param index 
     */
    public RemoveServentFrame(index: number) {
        this._view.RemoveServentFrame(index);
    }


    /**
     * サーバント側に使用アクターを通知
     */
    public NotifyServentToActor(element: HTMLFrameElement) {

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
    public NotifyServentToActorAll() {
        for (let i = 0; i < this.FrameCount; i++) {
            this.NotifyServentToActor(this._view.GetFrame(i));
        }
    }

}