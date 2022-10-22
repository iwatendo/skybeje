import * as React from 'react';
import * as ReactDOM from 'react-dom';

import CameraResolutionItemComponent from "./CameraResolutionItemComponent";
import { CameraResolutionView } from "./CameraResolutionView";


/**
 * プロパティ
 */
export interface CameraResolutionProp {
    owner: CameraResolutionView;
    mscList: Array<MediaStreamConstraints>; 
}


export default class CameraResolutionComponent extends React.Component<CameraResolutionProp, any> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: CameraResolutionProp, context?: any) {
        super(props, context);
    }


    /**
     * 
     */
    public render() {

        let deviceTable = this.props.mscList.map((msc, index, array) => {

            let jsonStr = JSON.stringify(msc);

            return (<CameraResolutionItemComponent key={jsonStr} owner={this.props.owner} msc={jsonStr}/>);
        });

        //  コンボボックスの初期化（先頭には空白行を入れる）
        return (
            <div>
                <CameraResolutionItemComponent key={""} owner={this.props.owner} msc={""} />
                {deviceTable}
            </div>
        );
    }

}
