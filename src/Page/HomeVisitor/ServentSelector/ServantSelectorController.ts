import HomeVisitorController from "../HomeVisitorController";
import ServantSelectorView from "./ServantSelectorView";
import RoomServentSender from "../../../Contents/Sender/RoomServentSender";


export default class ServantSelectorController {

    private _ownerController: HomeVisitorController;
    private _view: ServantSelectorView;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._ownerController = controller;
        this._view = new ServantSelectorView(controller);
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