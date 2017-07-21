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

        if (cursor.posX >= 0 && cursor.posY >= 0) {

            let style = {
                left: cursor.posX,
                top: cursor.posY,
                width: "48px",
                height: "48px",
            }

            let imgstyle

            if (cursor.iid.length === 0) {
                imgstyle = {
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
                imgstyle = {
                    height: "100%",
                    width: "100%",
                    borderRadius: "8px",
                    userselect: "none",
                };
            }


            let imgClassName = 'sbj-cursor-img-' + cursor.iid.toString();

            return (
                <div>
                    <div className='sbj-cact-visitor-cursor' style={style}>
                        <div className={imgClassName} style={imgstyle}>
                            <p className="sbj-cact-visitor-cursor-image">
                                {cursor.name}
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
}
