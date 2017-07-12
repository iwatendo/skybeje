import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LinkUtil from "../../../Base/Util/LinkUtil";

import HomeVisitorController from "../HomeVisitorController";
import ProfileEditerDialog from "./ProfileEditerDialog";


/**
 * 
 */
export interface ProfileEditerDialogProp {
    controller: HomeVisitorController;
    aid: string;
}


/**
 * 
 */
export default class ProfileEditerDialogComponent extends React.Component<ProfileEditerDialogProp, any> {


    /**
     * 描画処理
     */
    public render() {

        var linkrul = LinkUtil.CreateLink("../Profile/") + "?aid=" + this.props.aid;

        return (
            <iframe className="sbj-home-visitor-profile-editer" src={linkrul}></iframe>
        );
    }

}
