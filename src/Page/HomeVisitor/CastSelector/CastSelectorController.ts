import HomeVisitorController from "../HomeVisitorController";
import ServentMap from "./ServentMap";
import CastSelectorView from "./CastSelectorView";
import RoomServentSender from "../../../Contents/Sender/RoomServentSender";
import ServentSender from "../../../Contents/Sender/ServentSender";


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

}