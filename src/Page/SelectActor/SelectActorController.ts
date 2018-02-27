
import AbstractServiceController from "../../Base/AbstractServiceController";
import SelectActorModel from "./SelectActorModel";
import SelectActorView from "./SelectActorView";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ProfileChangeInfo from "../../Contents/Struct/ProfileChangeInfo";


export default class SelectActorController extends AbstractServiceController<SelectActorView, SelectActorModel> {

    public ControllerName(): string { return "SelectActor"; }

    /**
     * 
     */
    public constructor() {
        super();

        this.Model = new SelectActorModel(this, () => {
            this.View = new SelectActorView(this, () => {
                this.SetMessageChannel();
            });
        });
    }


    /**
     * メッセージチャンネルの設定
     */
    private SetMessageChannel() {

        //  HomeVisitorの子フレームである事を設定
        MessageChannelUtil.SetChild(this, (msg) => { });

        //  Profileの親フレームである事を設定
        MessageChannelUtil.SetOwner((msg) => {

            //  Profileフレームからの通知
            let info = JSON.parse(msg) as ProfileChangeInfo;

            if (info) {

                //  プロフィール更新画面からの通知
                if (info.updateAid) {
                    this.PostChangeActor(info.updateAid);
                    this.View.ProfileView.Refresh();
                }

                //  プロフィール更新画面を閉じる
                if (info.isClose) {
                    let profileFrame = document.getElementById('sbj-profile-frame');
                    profileFrame.hidden = true;
                }
            }
        });

    }


    /**
     * アクターが変更があった事を通知する
     */
    public PostChangeActor(aid: string) {

        let info = new ProfileChangeInfo();
        info.updateAid = aid;
        info.isClose = false;

        MessageChannelUtil.PostOwner(JSON.stringify(info));
    }


    /**
     * 選択しているアクターが変更された事を通知する
     */
    public PostSelectClose(aid: string) {

        let info = new ProfileChangeInfo();
        info.selectAid = aid;
        info.isClose = true;

        MessageChannelUtil.PostOwner(JSON.stringify(info));
    }


    /** 
     * 
     */
    public PostClose() {
        let info = new ProfileChangeInfo();
        info.isClose = true;
        MessageChannelUtil.PostOwner(JSON.stringify(info));
    }

}
