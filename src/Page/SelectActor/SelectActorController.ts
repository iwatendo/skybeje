
import AbstractServiceController from "../../Base/AbstractServiceController";
import SelectActorModel from "./SelectActorModel";
import SelectActorView from "./SelectActorView";


export default class SelectActorController extends AbstractServiceController<SelectActorView, SelectActorModel> {

    public ControllerName(): string { return "SelectActor"; }

    /**
     * 
     */
    public constructor() {
        super();

        this.Model = new SelectActorModel(this, () => {
            this.View = new SelectActorView(this, () => {
            });
        });
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


    /**
     * クライアントが起動していた場合に
     * 選択しているアクターが変更された事を通知する
     */
    public SelectActorNotify(aid: string) {

        let frame = window.parent.document.getElementById('sbj-main-home-visitor-frame') as HTMLFrameElement;

        if (!frame) {
            return;
        }

        //  ホームインスタンス側のエレメント
        let document = frame.contentDocument;
        let element = document.getElementById("sbj-dashborad-select-actor") as HTMLInputElement;

        if (element) {
            element.value = aid;
            element.click();
        }
    }
    

}
