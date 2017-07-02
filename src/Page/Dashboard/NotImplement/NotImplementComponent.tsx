import * as React from 'react';
import * as ReactDOM from 'react-dom';

import NotImplementView from "./NotImplementView";


/**
 * プロパティ
 */
export interface NotImplementProp {
    controller: NotImplementView;
}


export default class NotImplementComponent extends React.Component<NotImplementProp, any> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: NotImplementProp, context?: any) {
        super(props, context);
    }


    public render() {

        return (
            <div className="mdl-grid">
            </div>
        );
    }

}
