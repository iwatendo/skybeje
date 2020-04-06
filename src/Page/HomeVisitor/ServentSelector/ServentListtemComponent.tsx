import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ServentFrame from './ServentFrame';
import ServantSelectorView from './ServantSelectorView';



/**
 * プロパティ
 */
export interface ServentListItemProp {
    view: ServantSelectorView;
    servent: ServentFrame;
}


export default class ServentListItemComponent extends React.Component<ServentListItemProp, any> {


    /**
     * 
     */
    public render() {

        let dispname = this.props.servent.Title;

        return (
            <li className="mdl-menu__item" onClick={this.OnClick.bind(this)}>{dispname}</li>
        );
    }


    /**
     * 並び順の変更
     * @param e 
     */
    private OnClick(e: any) {
        let sf = this.props.servent;
        this.props.view.ChangeOrder(sf);
    }

}
