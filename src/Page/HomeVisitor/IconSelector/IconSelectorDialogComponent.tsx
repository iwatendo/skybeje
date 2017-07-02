import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import { Order } from "../../../Base/Container/Order";
import StdUtil from "../../../Base/Util/StdUtil";

import HomeVisitorController from "../HomeVisitorController";
import IconSelectorDialog from "./IconSelectorDialog";
import IconSelectorItemComponent from "./IconSelectorItemComponent";


/**
 * 
 */
export interface IconSelectorDialogProp {
    controller: HomeVisitorController;
    owner: IconSelectorDialog;
    icons: Array<Personal.Icon>;
    selectIid: string;
}


/**
 * 
 */
export interface IconSelectorDialogStat {
    icons: Array<Personal.Icon>;
    selectIid: string;
}


export default class IconSelectorDialogComponent extends React.Component<IconSelectorDialogProp, IconSelectorDialogStat> {


    private _selectedIid: string = '';


    /**
     * コンストラクタ
     * @param props 
     * @param context 
     */
    constructor(props?: IconSelectorDialogProp, context?: any) {
        super(props, context);

        this._selectedIid = props.selectIid;

        this.state = {
            icons: props.icons,
            selectIid: props.selectIid,
        };
    }


    /**
     * 描画処理
     */
    public render() {

        let key: number = 0;

        Order.Sort(this.props.icons);

        let iconList = this.props.icons.map((icon) => {
            let isSelect = (this._selectedIid === icon.iid);
            return (<IconSelectorItemComponent key={icon.iid} owner={this} icon={icon} isSelect={isSelect} />);
        });

        return (
            <div className="mdl-card__supporting-text sbj-dialog-scroll-list">
                <div className="mdl-grid">
                    {iconList}
                </div>
            </div>
        );
    }


    /**
     * 選択アイコン変更時
     * @param aid 
     */
    public ChangeSelectIcon(iid: string) {

        this._selectedIid = iid;
        this.props.owner.SelectImage(this._selectedIid);
        this.setState({ icons: this.state.icons }, () => {
        });
    }


    /**
     * 
     * @param aid 
     */
    public OnSelectIcon(aid: string) {

        this.props.owner.SelectImage(this._selectedIid);
        this.props.owner.Done();
    }

}
