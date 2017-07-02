import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { CastSpeechRecognitionSender } from "../../CastInstance/CastInstanceContainer";


interface SubTitlesProp {
    csr: CastSpeechRecognitionSender;
}


/**
 * 字幕表示メイン
 */
export class SubTitlesComponent extends React.Component<SubTitlesProp, any>{


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
                <div className='sbj-cact-visitor-subtitles'>
                    <div className='sbj-cast-visitor-subtitles-text'>
                        {msg}
                    </div>
                </div>
            );
        }
    }
}