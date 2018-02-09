import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from "../../../Contents/IndexedDB/Timeline";
import { SubTitlesComponent } from "./SubTitlesComponent";
import { CastSpeechRecognitionSender } from "../../CastInstance/CastInstanceContainer";

/**
 * 字幕表示
 */
export class SubTitlesController {

    private _subtitleElement = document.getElementById('sbj-cast-visitor-subtitles-text') as HTMLElement;


    public constructor() {
    }


    /**
     * 字幕表示
     * @param csr 
     */
    public SetMessage(csr: CastSpeechRecognitionSender) {
        ReactDOM.render(<SubTitlesComponent csr={csr} />, this._subtitleElement);
    }


    public Clear() {
        let csr = new CastSpeechRecognitionSender("");
        ReactDOM.render(<SubTitlesComponent csr={csr} />, this._subtitleElement);
    }

}

