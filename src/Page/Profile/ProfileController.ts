﻿
import AbstractServiceController from "../../Base/Common/AbstractServiceController";

import * as Personal from "../../Base/IndexedDB/Personal";

import { Order } from "../../Base/Container/Order";
import ProfileModel from "./ProfileModel";
import ProfileView from "./ProfileView";


export default class ProfileController extends AbstractServiceController<ProfileView, ProfileModel> {

    public Actor: Personal.Actor;

    public SelectionGid: string;


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

                if (!actor) {
                    //  新規アクターデータ作成
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
    public ChangeActorNotify(aid: string) {

        let element = window.parent.document.getElementById('sbj-dashborad-change-actor') as HTMLInputElement;

        if (element) {
            element.value = aid;
            element.click();
        }
    }


    /**
     * クローズ通知
     * ※親ドキュメント側から閉じる
     */
    public CloseNotify() {
        let element = window.parent.document.getElementById('sbj-profile-do-close') as HTMLInputElement;

        if (element) {
            element.click();
        }
    }

};