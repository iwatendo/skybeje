import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { RoomView, RoomActors } from "./RoomView";
import { RoomItemComponent } from "./RoomItemComponent";


/**
 * 
 */
interface RoomProp {
    owner: RoomView;
    roomActors: Array<RoomActors>
}


/**
 * ルーム一覧コンポーネント
 */
export default class RoomComponent extends React.Component<RoomProp, any> {


    /**
     * ルーム一覧の描画
     */
    public render() {

        let nodes = this.props.roomActors.map((ra) => {
            return (<RoomItemComponent key={ra.room.hid} owner={this.props.owner} room={ra.room} actpeers={ra.actpeers} />);
        });

        return (
            <div>
                <div className='sbj-home-instance-room-grid mdl-grid'>
                    {nodes}
                </div>
            </div>
        );
    }

}


