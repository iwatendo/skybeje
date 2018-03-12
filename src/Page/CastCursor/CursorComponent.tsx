import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CastCursor, CursorController } from "./CurosrController";
import { CursorItemComponent } from "./CursorItemComponent";


interface CursorProp {
    controller: CursorController;
    CursorList: Array<CastCursor>;
}


export class CursorComponent extends React.Component<CursorProp, any> {

    /**
     * カーソルの描画
     */
    public render() {

        let commentNodes = this.props.CursorList.map((cur) => {
            let key = cur.peerid + cur.aid;
            return (<CursorItemComponent key={key} controller={this.props.controller} cursor={cur} />);
        });

        return (
            <div>
                {commentNodes}
            </div>
        );
    }

}
