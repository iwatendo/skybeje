﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CastCursor } from "./CurosrController";
import { CursorItemComponent } from "./CursorItemComponent";


interface CursorProp {
    CursorList: Array<CastCursor>;
}


export class CursorComponent extends React.Component<CursorProp, any> {

    /**
     * カーソルの描画
     */
    public render() {

        let commentNodes = this.props.CursorList.map((cur) => {
            let key = cur.peerid + cur.aid;
            return (<CursorItemComponent key={key} cursor={cur} />);
        });

        return (
            <div>
                {commentNodes}
            </div>
        );
    }

}
