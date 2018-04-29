import * as React from 'react';
import * as ReactDOM from 'react-dom';

import CastCursor from './Cursor/CastCursor';
import CastPropController from "./CastPropController";
import CursorItemComponent from "./Cursor/CursorItemComponent";
import SubTitlesComponent from './SubTitles/SubTitlesComponent';
import CursorDispOffset from './CursorDispOffset';
import ChatStatusSender from '../../Contents/Sender/ChatStatusSender';
import { Actor } from '../../Contents/IndexedDB/Personal';


interface CursorProp {
    controller: CastPropController;
    cursorList: Array<CastCursor>;
    chat: ChatStatusSender;
    offset: CursorDispOffset;
}


export default class CursorComponent extends React.Component<CursorProp, any> {

    /**
     * カーソルの描画
     */
    public render() {

        let commentNodes = this.props.cursorList.map((cur) => {
            let key = cur.peerid + cur.aid;
            return (<CursorItemComponent key={key} controller={this.props.controller} cursor={cur} />);
        });

        let messageNodes = (<div></div>);

        if (Actor.IsDispSubtitles(this.props.chat.actorType)) {
            messageNodes = (<SubTitlesComponent chat={this.props.chat} offset={this.props.offset} />);
        }

        return (
            <div>
                {commentNodes}
                {messageNodes}
            </div>
        );
    }

}
