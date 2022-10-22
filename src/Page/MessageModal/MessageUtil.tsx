import * as React from 'react';
import * as ReactDOM from 'react-dom';

import MessageModal from './MessageModal';


export class MessageUtil {


    private _messageElement: HTMLElement;

    /**
     * コンストラクタ
     * @param messageElement 
     */
    public constructor(messageElement: HTMLElement) {
        this._messageElement = messageElement;
    }


    /**
     * メッセージダイアログを表示
     * @param title タイトル
     * @param message メッセージ
     */
    public ShowModal(title: string, message: string) {

        this._messageElement.hidden = false;
        ReactDOM.render(<MessageModal key={"message"} element={this._messageElement} onClose={this.Close} title={title} message={message} buttons={["Close"]} />, this._messageElement, () => {
        });

    }


    /**
     * メッセージダイアログを閉じる
     * @param value 
     */
    public Close(messageElement: HTMLElement, value: string) {

        messageElement.hidden = true;

        ReactDOM.render(undefined, messageElement, () => {
        });
    }

}
