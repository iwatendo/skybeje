import * as React from 'react';
import * as ReactDOM from 'react-dom';

import CastCursor from './Cursor/CastCursor';
import CastPropController, { VideoDispOffset } from "./CastPropController";
import CursorItemComponent from "./Cursor/CursorItemComponent";
import SubTitlesComponent from './SubTitles/SubTitlesComponent';
import CastSubTitlesSender from '../../Contents/Sender/CastSubTitlesSender';


interface CursorProp {
    controller: CastPropController;
    cursorList: Array<CastCursor>;
    subtitles: CastSubTitlesSender;
    offset: VideoDispOffset;
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

        let messageNodes = (<SubTitlesComponent csr={this.props.subtitles} offset={this.props.offset} />);

        return (
            <div>
                {commentNodes}
                {messageNodes}
            </div>
        );
    }

}
