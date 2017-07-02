
import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import DashboardModel from "./DashboardModel";
import DashboardView, { NaviEnum } from "./DashboardView";


export default class DashboardController extends AbstractServiceController<DashboardView, DashboardModel> {

    /**
     * 
     */
    public constructor() {
        super();

        this.Model = new DashboardModel(this, () => {
            this.View = new DashboardView(this, () => {
            });
        });
    }


    /**
     * ホームインスタンスが起動していた場合に
     * ルームデータに変更があった事を通知する
     */
    public ChangeRoomNotify() {

        let frame = window.parent.document.getElementById('sbj-main-home-instance-frame') as HTMLFrameElement;

        if (!frame) {
            return;
        }

        //  ホームインスタンス側のエレメント
        let document = frame.contentDocument;
        let element = document.getElementById("sbj-dashborad-change-room");

        if (element) {
            element.click();
        }
    }


    /**
     * クライアントが起動していた場合に
     * アクターが変更があった事を通知する
     */
    public ChangeActorNotify(aid: string) {

        let frame = window.parent.document.getElementById('sbj-main-home-visitor-frame') as HTMLFrameElement;

        if (!frame) {
            return;
        }

        //  ホームインスタンス側のエレメント
        let document = frame.contentDocument;
        let element = document.getElementById("sbj-dashborad-change-actor") as HTMLInputElement;

        if (element) {
            element.value = aid;
            element.click();
        }
    }

}
