import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LinkUtil from "../../../Base/Util/LinkUtil";

import CastVisitorController from "../CastVisitorController";
import MobileDialog from "./MobileDialog";


/**
 * 
 */
export interface MobileDialogProp {
    controller: CastVisitorController;
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
                <h6 className="sbj-cast-visitor-mobile-label">Android端末でライブキャストを見れます。</h6>
                <div className="mdl-shadow--3dp">
                    <iframe className="sbj-cast-visitor-qrcode" src={linkrul}></iframe>
                </div>
            </div>
        );
    }

}
