import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CastSubTitlesSender from '../../../Contents/Sender/CastSubTitlesSender';
import CursorDispOffset from '../CursorDispOffset';


interface SubTitlesProp {
    csr: CastSubTitlesSender;
    offset: CursorDispOffset;
}


/**
 * 字幕表示メイン
 */
export default class SubTitlesComponent extends React.Component<SubTitlesProp, any>{


    /**
     * 
     */
    public render() {

        let msg = this.props.csr.message;

        if (msg == null || msg.length == 0) {
            return (<div></div>);
        }
        else {
            return (
                <div id='sbj-cast-subtitles' className='sbj-cast-subtitles' style={this.GetStyle()}>
                    {msg}
                </div>
            );
        }
    }


    /**
     * 字幕表示のスタイル情報
     */
    private GetStyle() {

        let offset = this.props.offset;

        let bottompos = Math.round((offset.clientHeight - offset.dispHeight) / 2);
        let sidepos = Math.round((offset.clientWidth - offset.dispWidth) / 2);
        let fontsize = Math.round((offset.dispHeight + offset.dispWidth) * 0.03);
        let lineheight = Math.ceil(fontsize * 1.4);

        return {
            bottom: bottompos.toString() + "px",
            left: sidepos.toString() + "px",
            right: sidepos.toString() + "px",
            fontSize: fontsize.toString() + "px",
            lineHeight: lineheight.toString() + "px",
        };
    }


}