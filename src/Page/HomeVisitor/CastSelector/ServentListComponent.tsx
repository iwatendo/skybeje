import * as React from 'react';
import * as ReactDOM from 'react-dom';

import RoomItemComponent from "./ServentListtemComponent";
import CastSelectorController from './CastSelectorController';
import ServentFrame from './ServentFrame';
import CastSelectorView from './CastSelectorView';


/**
 * プロパティ
 */
export interface ServentListProp {
    view: CastSelectorView;
    servents: Array<ServentFrame>;
}


export default class ServentListComponent extends React.Component<ServentListProp, any> {

    /**
     * 
     */
    public render() {

        let list = this.props.servents.map((serventFrame) => {
            let key = serventFrame.FrameNo;
            if( serventFrame.IsCasting){
                return (<RoomItemComponent key={key} view={this.props.view} servent={serventFrame} />);
            }
        });

        return (
            <div>
                {list}
            </div>
        );
    }

}
