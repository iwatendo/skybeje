import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import IconSelectorDialogComponent from "./IconSelectorDialogComponent";


/**
 * 
 */
export interface IconItemProp {
    owner: IconSelectorDialogComponent;
    icon: Personal.Icon,
    isSelect: boolean,
}


/**
 * 
 */
export default class IconSelectorItemComponent extends React.Component<IconItemProp, any>{


    /**
     * 
     */
    public render() {

        let icon = this.props.icon;
        let id = icon.iid;

        if (icon === null) {
            return (<div></div>);
        }
        else {

            let className = "sbj-icon-cell mdl-card " + (this.props.isSelect ? "mdl-shadow--8dp" : "");

            return (
                <div className={className} onClick={this.OnClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)}>
                    <div className="sbj-icon mdl-card--expand" id={id}>
                    </div>
                </div>
            );
        }
    }


    /**
     * 
     */
    private OnClick(event) {
        this.props.owner.ChangeSelectIcon(this.props.icon.iid);
    }


    /**
     * 
     */
    private OnDoubleClick(event) {
        if (this.props.isSelect) {
            this.props.owner.OnSelectIcon(this.props.icon.iid);
        }
    }

}