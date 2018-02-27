
import AbstractServiceController from "../../Base/AbstractServiceController";

import * as Personal from "../../Contents/IndexedDB/Personal";

import { Order } from "../../Base/Container/Order";
import ProfileModel from "./ProfileModel";
import ProfileView from "./ProfileView";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ProfileChangeInfo from "../../Contents/Struct/ProfileChangeInfo";


export default class ProfileController extends AbstractServiceController<ProfileView, ProfileModel> {

    public ControllerName(): string { return "Profile"; }

    public Actor: Personal.Actor;

    public SelectionGid: string;

    public IsNew: boolean;


    /**
     *
     */
    constructor(aid: string) {

        super();

        let self = this;
        let model = self.Model;

        self.Model = new ProfileModel(self, () => {
            self.Model.GetActors((actors) => {

                let actor = actors.filter(n => n.aid === aid)[0];

                if (actor) {
                    this.IsNew = false;
                }
                else {
                    //  新規アクターデータ作成
                    this.IsNew = true;
                    actor = new Personal.Actor();
                    actor.aid = aid;
                    actor.name = "";
                    actor.order = Order.New(actors);
                }

                self.Actor = actor;
                self.View = new ProfileView(self, () => { });
            });
        });

    };


    /**
     * アクターの変更通知
     */
    public PostChangeClose(aid: string) {

        let info = new ProfileChangeInfo();
        info.updateAid = aid;
        info.isClose = true;

        MessageChannelUtil.PostOwner(JSON.stringify(info));
    }

};