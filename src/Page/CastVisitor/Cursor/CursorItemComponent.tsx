import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CastCursor } from "./CurosrController";



interface CursorItemrProp {
    cursor: CastCursor;
    size: number;
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

        if (cursor.posX >= 0 && cursor.posY >= 0) {

            let imgClassName = 'sbj-cact-visitor-cursor-image-' + cursor.iid.toString();

            return (
                <div>
                    <div className='sbj-cact-visitor-cursor' style={this.PosStyle()}>
                        <div className={imgClassName} style={this.ImageStyle()}>
                            <p className='sbj-cact-visitor-cursor-pointer' style={this.PointerStyle()}>
                            </p>
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
        let size = this.props.size.toString() + "px";

        return {
            left: cursor.posX,
            top: cursor.posY,
            width: size,
            height: size,
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


    /**
     * アイコンの左上に白い三角を表示する為のスタイル情報
     */
    private PointerStyle() {

        let size = Math.round(this.props.size / 6).toString() + "px";

        return {
            borderTop: size + " solid var(--sbj-color-cast-cursor)",
            borderLeft: size + " solid var(--sbj-color-cast-cursor)",
            borderRight: size + " solid transparent",
            borderBottom: size + " solid transparent",
        }
    }

}
