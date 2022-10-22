import * as React from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';


/**
 * プロパティ
 */
export interface MessageProp {
    onClose: (element: HTMLElement, value: string) => void
    element: HTMLElement,
    title?: string,
    message?: string,
    buttons?: string[],
}


/**
 * 
 */
export default class MessageModal extends React.Component<MessageProp, any> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: MessageProp, context?: any) {
        super(props, context);
    }


    /**
     * 
     */
    public render() {

        let buttons = this.props.buttons.map((value, index, array) => {
            return (<Button onClick={() => this.props.onClose(this.props.element, value)}>{value}</Button>);
        });


        return (
            <Dialog open onClose={() => this.props.onClose(this.props.element, 'close')}>
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{this.props.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {buttons}
                </DialogActions>
            </Dialog>
        );

    }

}
