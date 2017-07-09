import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";

import ImageDialogController from "../ImageDialogController";
import { IIConOwner } from "../Icon/IIConOwner";
import IconComponent from "../Icon/IconComponent";
import HomeComponent from "./HomeComponent";


/**
 * プロパティ
 */
export interface HomeImageProp {
    owner: HomeComponent;
    room: Home.Room;
}


/**
 * ステータス
 */
export interface HomeImageStat {
    room: Home.Room;
}


export default class HomeImageComponent extends React.Component<HomeImageProp, HomeImageStat> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: HomeImageProp, context?: any) {
        super(props, context);

        this.state = {
            room: this.props.room
        };

        this.props.owner.SetDragFromOutsideAction(() => {
            this.OnClick_Image(null);
        });
    }



    public render() {

        if (!this.state.room) {
            return (<div></div>);
        }

        return (
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--12-col">
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnClick_Image.bind(this)}>
                        <i className='material-icons'>photo</i>
                        &nbsp;背景の変更&nbsp;
                    </button>
                </div>
            </div>
        );
    }

    /**
     * 
     */
    public OnClick_Image(event) {
        let prop = this.props;
        ImageDialogController.EditDelete(this.state.room.background, (img) => this.OnImageUpdate(prop, img));
    }


    /**
     * 
     */
    public OnImageUpdate(prop: HomeImageProp, imageRec: ImageInfo) {

        let room = this.state.room;

        if (imageRec === null)
            imageRec = new ImageInfo();

        room.background = imageRec;

        this.setState({
            room: room,
        }, () => {
            prop.owner.UpdateRoom(room);
        });
    }

}
