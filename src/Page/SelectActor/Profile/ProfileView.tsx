import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Contents/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";

import SelectActorController from "../SelectActorController";
import ProfileComponent from "./ProfileComponent";
import ImageUtil from "../../../Base/Util/ImageUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";

/**
 * 
 */
export default class ProfileView {

    private _owner: SelectActorController;
    private _element: HTMLElement;

    /**
     * 
     */
    public constructor(owner: SelectActorController, element: HTMLElement) {
        this._owner = owner;
        this._element = element;
        this.Refresh();
    }


    /**
     * 
     */
    public DoShoActorEditDialog(aid: string) {

        let controller = this._owner;

        controller.Model.GetUserProfile((userProfile) => {
            let frame = document.getElementById('sbj-profile-frame') as HTMLFrameElement;
            let src = LinkUtil.CreateLink("../Profile/") + "?aid=" + aid;

            frame.onload = (e) => {
                frame.hidden = false;
                frame.onload = null;
            };
            frame.src = src;
        });
    }


    /**
     * 
     */
    public Refresh() {

        let isConnected = true;

        this._owner.Model.GetActors((actors) => {
            let key = StdUtil.CreateUuid();
            ReactDOM.render(<ProfileComponent key={key} controller={this._owner} view={this} isConnected={isConnected} actors={actors} />, this._element, () => {
                this.SetIconImageCss(actors);
                document.getElementById('sbj-dashboard-profile-back').focus();
            });
        });
    }


    /**
     * 
     * @param actors 
     */
    public SetIconImageCss(actors: Array<Personal.Actor>) {

        actors.map((actor) => {

            let iid = actor.dispIid;
            if (iid) {
                this._owner.Model.GetIcon(iid, (icon) => {
                    ImageInfo.SetCss("sbj-icon-img-" + iid.toString(), icon.img);
                });
            }

        });
    }

}

