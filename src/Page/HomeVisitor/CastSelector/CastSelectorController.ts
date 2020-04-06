import HomeVisitorController from "../HomeVisitorController";
import CastSelectorView from "./CastSelectorView";
import RoomServentSender from "../../../Contents/Sender/RoomServentSender";


export default class CastSelectorController {

    private _ownerController: HomeVisitorController;
    private _view: CastSelectorView;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._ownerController = controller;
        this._view = new CastSelectorView(controller);
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
     * @param rs 
     */
    public ChangeRoomServentList(rs: RoomServentSender) {

        let servents = rs.servents;

        if (servents) {
            this._view.SetServents(servents);
        }

        //
        this._view.SetLayout();
    }

}