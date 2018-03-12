import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CastSpeechRecognitionSender from '../../../Contents/Sender/CastSpeechRecognitionSender';


interface SubTitlesProp {
    csr: CastSpeechRecognitionSender;
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
                <div className='sbj-cast-subtitles'>
                    <div className='sbj-cast-subtitles-text'>
                        {msg}
                    </div>
                </div>
            );
        }
    }
}