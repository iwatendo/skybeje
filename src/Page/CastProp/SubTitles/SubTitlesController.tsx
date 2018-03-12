import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from "../../../Contents/IndexedDB/Timeline";
import SubTitlesComponent from "./SubTitlesComponent";
import CastSubTitlesSender from '../../../Contents/Sender/CastSubTitlesSender';


/**
 * 字幕表示
 */
export default class SubTitlesController {

    private _subtitleElement = document.getElementById('sbj-cast-subtitles-text') as HTMLElement;


    public constructor() {
    }


    /**
     * 字幕表示
     * @param csr 
     */
    public SetMessage(csr: CastSubTitlesSender) {
        ReactDOM.render(<SubTitlesComponent csr={csr} />, this._subtitleElement);
    }


    public Clear() {
        let csr = new CastSubTitlesSender("");
        ReactDOM.render(<SubTitlesComponent csr={csr} />, this._subtitleElement);
    }

}

