import * as React from 'react';
import * as ReactDOM from 'react-dom';

import RoomItemComponent from "./ServentListtemComponent";
import CastSelectorController from './CastSelectorController';
import ServentFrame from './ServentFrame';


/**
 * プロパティ
 */
export interface ServentListProp {
    controller: CastSelectorController;
    servents: Array<ServentFrame>;
}


export default class ServentListComponent extends React.Component<ServentListProp, any> {

    /**
     * 
     */
    public render() {

        let list = this.props.servents.map((serventFrame) => {
            let key = serventFrame.FrameIndex;
            if( serventFrame.IsCasting){
                return (<RoomItemComponent key={key} controller={this.props.controller} servent={serventFrame} />);
            }
        });

        return (
            <div>
                {list}
            </div>
        );
    }

}
