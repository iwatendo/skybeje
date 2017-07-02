import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import BootInstanceComponent from "./BootInstanceComponent";


/**
 * 
 */
export interface BootInstanceItemProp {
    owner: BootInstanceComponent;
    room: Home.Room,
    isSelect: boolean,
}


/**
 * 
 */
export default class BootInstanceItemComponent extends React.Component<BootInstanceItemProp, any>{


    /**
     * 
     */
    public render() {

        let liclass = "mdl-list__item mdl-list__item--two-line" +
            (this.props.isSelect ? " mdl-card mdl-shadow--3dp" : "");

        let avatarstyle = {
            color: 'var(--sbj-color-default-text)',
            borderRadius: "0%",
            backgroundColor: "initial",
        };

        return (
            <li className={liclass} onClick={this.OnClick.bind(this)}>
                <span className="mdl-list__item-primary-content">
                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>note</i>
                    <span>{this.props.room.name}</span>
                    <span className="mdl-list__item-sub-title">{this.props.room.tag}</span>
                </span>
            </li>
        );
    }


    /**
     * 
     */
    private OnClick(event) {
        this.props.owner.SelectRoom(this.props.room);
    }

}