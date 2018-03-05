
import AbstractServiceController from "../../Base/AbstractServiceController";
import SelectActorModel from "./SelectActorModel";
import SelectActorView from "./SelectActorView";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ProfileChangeSender from "../../Contents/Sender/ProfileChangeSender";


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
        MessageChannelUtil.SetOwner((sender) => {

            //  Profileフレームからの通知
            let info = sender as ProfileChangeSender;

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

        let sender = new ProfileChangeSender();
        sender.updateAid = aid;
        sender.isClose = false;

        MessageChannelUtil.PostOwner(sender);
    }


    /**
     * 選択しているアクターが変更された事を通知する
     */
    public PostSelectClose(aid: string) {

        let sender = new ProfileChangeSender();
        sender.selectAid = aid;
        sender.isClose = true;

        MessageChannelUtil.PostOwner(sender);
    }


    /** 
     * 
     */
    public PostClose() {
        let info = new ProfileChangeSender();
        info.isClose = true;
        MessageChannelUtil.PostOwner(info);
    }

}
