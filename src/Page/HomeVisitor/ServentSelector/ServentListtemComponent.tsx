import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ServantSelectorController from './ServantSelectorController';
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
     * 
     * @param e 
     */
    private OnClick(e) {

    }

}
