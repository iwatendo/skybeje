import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { CameraResolutionView } from "./CameraResolutionView";



/**
 * プロパティ
 */
export interface CameraResolutionItemProp {
    owner: CameraResolutionView;
    msc: string;
}


export default class CameraResolutionItemComponent extends React.Component<CameraResolutionItemProp, any> {

    _dispName = "";


    /**
     * 
     */
    public render() {

        if(this.props.msc)
        {
            let mscValue = JSON.parse(this.props.msc);
            this._dispName = this.props.owner.ToDispLabel(mscValue);
        }
        else{
            this._dispName = "";
        }

        return (
            <li className="mdl-menu__item" onClick={this.OnClick.bind(this)}>{this._dispName}</li>
        );
    }


    /**
     * デバイス選択時
     * @param event 
     */
    public OnClick(event) {
        this.props.owner.ChangeCameraResolution(this.props.msc, this._dispName);
    }

}
