import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CastCursor } from "./CurosrController";



interface CursorItemrProp {
    cursor: CastCursor;
}


/**
 * カーソル表示
 */
export class CursorItemComponent extends React.Component<CursorItemrProp, any>{


    /**
     * 
     */
    public render() {

        let cursor = this.props.cursor;

        if (cursor.isDisp){

            let imgClassName = 'sbj-cact-visitor-cursor-image-' + cursor.iid.toString();

            return (
                <div>
                    <div className='sbj-cact-visitor-cursor' style={this.PosStyle()}>
                        <div className={imgClassName} style={this.ImageStyle()}>
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
     * アイコン画像表示する為のスタイル情報
     */
    private ImageStyle() {

        if (this.props.cursor.iid.length === 0) {
            return {
                background: "url(/image/cursor.png)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: "100%",
                width: "100%",
                userselect: "none",
            }
        }
        else {
            return {
                height: "100%",
                width: "100%",
                borderRadius: "8px",
                userselect: "none",
            };
        }
    }

}
