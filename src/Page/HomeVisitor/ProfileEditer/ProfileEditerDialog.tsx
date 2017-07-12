import * as React from 'react';
import * as ReactDOM from 'react-dom';

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";
import ProfileEditerDialogComponent from "./ProfileEditerDialogComponent";
import LinkUtil from "../../../Base/Util/LinkUtil";


export default class ProfileEditerDialog {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
    }


    public Show(aid: string, callback){
        let iframe = document.getElementById('sbj-profile-frame') as HTMLFrameElement;
        iframe.src = LinkUtil.CreateLink("../Profile/") + "?aid=" + aid;
        iframe.hidden = false;
    }

}


