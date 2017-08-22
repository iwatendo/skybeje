import * as React from 'react';
import * as ReactDOM from 'react-dom';

import GuideDialogController from "../GuideDialogController";


/**
 * プロパティ
 */
export interface NoEmbedProp {
    controller: GuideDialogController;
}


/**
 * 
 */
export default class NoEmbedComponent extends React.Component<NoEmbedProp, any> {

    public render() {
        return (
            <h6 className="sbj-guide-no-embed mdl-color-text--grey-600">
                <br/>
                YouTube動画を再生させる事ができます。<br/>
                URLをドロップすることで追加できます。<br/>
            </h6>
        );
    }

}
