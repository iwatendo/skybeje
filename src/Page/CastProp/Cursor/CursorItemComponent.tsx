import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CastCursor from './CastCursor';
import CastPropController from "../CastPropController";
import StyleCache from '../../../Contents/Cache/StyleCache';


interface CursorItemrProp {
    controller: CastPropController;
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

            let key = cursor.iid;
            let imgStyle = StyleCache.GetIconStyle(key, true);

            return (
                <div className='sbj-cast-cursor' style={this.PosStyle()}>
                    <div style={imgStyle} onMouseDown={this.onMouseDown.bind(this)} onMouseMove={this.onMouseMove.bind(this)} onMouseUp={this.onMouseUp.bind(this)} onDragStart={this.onSelect.bind(this)} onSelect={this.onSelect.bind(this)}>
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

            if (this.props.controller.IconCursor.iid === this.props.cursor.iid) {
                CastPropController.OffsetX = this.props.cursor.posX - e.clientX;
                CastPropController.OffsetY = this.props.cursor.posY - e.clientY;
            }

            if (e.buttons === 1) {
                this.props.controller.SendCastCursor(e.clientX, e.clientY, true);
            }
        }
    }


    /**
     * 
     * @param e 
     */
    private onMouseMove(e: MouseEvent) {
        if (this.props.controller.IconCursor) {
            if (e.buttons === 1) {
                this.props.controller.SendCastCursor(e.clientX, e.clientY, true);
            }
        }
    }


    /**
     * 
     * @param e 
     */
    private onMouseUp(e: MouseEvent) {
        if (this.props.controller.IconCursor) {
            CastPropController.OffsetX = 0;
            CastPropController.OffsetY = 0;
        }
    }
}
