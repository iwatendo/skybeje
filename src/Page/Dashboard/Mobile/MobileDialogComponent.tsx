import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LinkUtil from "../../../Base/Util/LinkUtil";

import DashboardController from "../DashboardController";
import MobileDialog from "./MobileDialog";


/**
 * 
 */
export interface MobileDialogProp {
    controller: DashboardController;
    linkurl: string;
}


/**
 * 
 */
export default class MobileDialogComponent extends React.Component<MobileDialogProp, any> {


    /**
     * 描画処理
     */
    public render() {

        var linkrul = LinkUtil.CreateLink("../QrCode/") + "?linkurl=" + encodeURIComponent(this.props.linkurl);

        return (
            <div>
                <h6 className="sbj-dashbord-mobile-label">Android端末からライブ配信します。</h6>
                <div className="mdl-shadow--3dp">
                    <iframe className="sbj-dashbord-mobile-qrcode" src={linkrul}></iframe>
                </div>
            </div>
        );
    }

}
