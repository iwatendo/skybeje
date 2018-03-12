import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CastCursor from './CastCursor';
import CursorController from "./CurosrController";
import StyleCache from '../../../Contents/Cache/StyleCache';


interface CursorItemrProp {
    controller: CursorController;
    cursor: CastCursor;
}


/**
 * カーソル表示
 */
export default class CursorItemComponent extends React.Component<CursorItemrProp, any>{

    /**
     * 
     */
    public render() {

        let cursor = this.props.cursor;

        if (cursor.isDisp) {

            let key = cursor.peerid + cursor.iid;
            let imgStyle = StyleCache.GetIconStyle(key, true);

            return (
                <div>
                    <div className='sbj-cast-cursor' style={this.PosStyle()}>
                        <div style={imgStyle} onMouseDown={this.onMouseDown.bind(this)} onMouseMove={this.onMouseDown.bind(this)} onDragStart={this.onSelect.bind(this)} onSelect={this.onSelect.bind(this)}>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (<div></div>);
        }
    }


    /**
     * カーソル表示位置を指定する為のスタイル情報
     */
    private PosStyle() {

        let cursor = this.props.cursor;

        return {
            left: cursor.posX,
            top: cursor.posY,
        };
    }


    /**
     * 
     * @param e 
     */
    private onSelect(e: MouseEvent) {
        e.preventDefault();
    }


    /**
     * 
     * @param e 
     */
    private onMouseDown(e: MouseEvent) {

        if (this.props.controller.IconCursor) {
            if (e.buttons === 1) {
                let clientX = e.clientX;
                let clientY = e.clientY;
                this.props.controller.CastCursorSend(clientX, clientY, true);
            }
        }

        return false;
    }

}
