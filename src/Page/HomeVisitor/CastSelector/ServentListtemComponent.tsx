import * as React from 'react';
import * as ReactDOM from 'react-dom';

import CastSelectorController from './CastSelectorController';
import ServentFrame from './ServentFrame';



/**
 * プロパティ
 */
export interface ServentListItemProp {
    controller: CastSelectorController;
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
