import * as React from 'react';
import * as ReactDOM from 'react-dom';

import SettingController, { DBEnum } from "../SettingController";
import LocalCache from '../../../../Contents/Cache/LocalCache';


/**
 * プロパティ
 */
export interface UserSettingProp {
    controller: SettingController;
}


/**
 * ステータス
 */
export interface UserSettingStat {
    enterMode: number,
    actorChangeMode: number,
    voiceRecognitionMode: number,
    cahtMessageCopyMode: number,
    useActors: boolean,
    debugMode: number,
}


export default class UserSettingComponent extends React.Component<UserSettingProp, UserSettingStat> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: UserSettingProp, context?: any) {
        super(props, context);
        this.SetCacheState();
    }


    public SetCacheState() {
        this.state = {
            enterMode: LocalCache.ChatEnterMode,
            actorChangeMode: LocalCache.ActorChangeKeyMode,
            voiceRecognitionMode: LocalCache.VoiceRecognitionMode,
            cahtMessageCopyMode: LocalCache.ChatMessageCopyMode,
            useActors: LocalCache.UseActors,
            debugMode: LocalCache.DebugMode,
        };
    }


    public render() {

        let selectClass = "sbj-option-select";
        let noSelectClass = "sbj-option-noselect";

        return (
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--12-col">
                    <div className="mdl-card__supporting-text">
                        <h5>チャット入力時のEnterキーの動作</h5>
                        <h6>
                            <div className="sbj-option" onClick={(e) => { this.OnEnterModeSelect(0) }}>
                                <input type="radio" name="sbj-options-chat-enter" checked={this.state.enterMode === 0}></input>
                                <span className={this.state.enterMode === 0 ? selectClass : noSelectClass}>メッセージ送信（Sihft（Alt）+ Enterで改行）</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnEnterModeSelect(1) }}>
                                <input type="radio" name="sbj-options-chat-enter" checked={this.state.enterMode === 1}></input>
                                <span className={this.state.enterMode === 1 ? selectClass : noSelectClass}>改行（Sihft（Alt）+ Enterでメッセージ送信）</span>
                            </div>
                        </h6>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <h5>アイコン変更のショートカットキー</h5>
                        <h6>
                            <div className="sbj-option" onClick={(e) => { this.OnActorChangeModeSelect(0) }}>
                                <input type="radio" name="sbj-options-actorchange-key" checked={this.state.actorChangeMode === 0}></input>
                                <span className={this.state.actorChangeMode === 0 ? selectClass : noSelectClass}>Ctrl + [方向キー]（左右でアイコン、上下でアクターを変更）</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnActorChangeModeSelect(1) }}>
                                <input type="radio" name="sbj-options-actorchange-key" checked={this.state.actorChangeMode === 1}></input>
                                <span className={this.state.actorChangeMode === 1 ? selectClass : noSelectClass}>Sihft + Alt + [方向キー]（左右でアイコン、上下でアクターを変更）</span>
                            </div>
                        </h6>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <h5>音声認識の動作</h5>
                        <h6>
                            <div className="sbj-option" onClick={(e) => { this.OnVoiceRecognitionModeSelect(0) }}>
                                <input type="radio" name="sbj-options-voiceRecognition-key" checked={this.state.voiceRecognitionMode === 0}></input>
                                <span className={this.state.voiceRecognitionMode === 0 ? selectClass : noSelectClass}>チャットのテキストボックスに出力</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnVoiceRecognitionModeSelect(1) }}>
                                <input type="radio" name="sbj-options-voiceRecognition-key" checked={this.state.voiceRecognitionMode === 1}></input>
                                <span className={this.state.voiceRecognitionMode === 1 ? selectClass : noSelectClass}>直接チャットメッセージとして送信</span>
                            </div>
                        </h6>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <h5>メッセージ送信時の動作</h5>
                        <h6>
                            <div className="sbj-option" onClick={(e) => { this.OnChatMessageCopyModeSelect(0) }}>
                                <input type="radio" name="sbj-options-chatmessagecopy-key" checked={this.state.cahtMessageCopyMode === 0}></input>
                                <span className={this.state.cahtMessageCopyMode === 0 ? selectClass : noSelectClass}>クリップボードにコピーしない</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnChatMessageCopyModeSelect(1) }}>
                                <input type="radio" name="sbj-options-chatmessagecopy-key" checked={this.state.cahtMessageCopyMode === 1}></input>
                                <span className={this.state.cahtMessageCopyMode === 1 ? selectClass : noSelectClass}>クリップボードにコピー（棒読みちゃん用）</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnChatMessageCopyModeSelect(2) }}>
                                <input type="radio" name="sbj-options-chatmessagecopy-key" checked={this.state.cahtMessageCopyMode === 2}></input>
                                <span className={this.state.cahtMessageCopyMode === 2 ? selectClass : noSelectClass}>Json形式でクリップボードにコピー（Skybeje.Speaker用）</span>
                            </div>
                        </h6>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <h5>アクター機能（複数プロフィール登録）</h5>
                        <h6>
                            <div className="sbj-option" onClick={(e) => { this.OnChangeUseActors(false) }}>
                                <input type="radio" name="sbj-options-useactor-key" checked={!this.state.useActors}></input>
                                <span className={!this.state.useActors ? selectClass : noSelectClass}>使用しない</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnChangeUseActors(true) }}>
                                <input type="radio" name="sbj-options-useactor-key" checked={this.state.useActors}></input>
                                <span className={this.state.useActors ? selectClass : noSelectClass}>使用する</span>
                            </div>
                        </h6>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <h5>デバックモード</h5>
                        <h6>
                            <div className="sbj-option" onClick={(e) => { this.OnDebugModeSelect(0) }}>
                                <input type="radio" name="sbj-options-debugmode-key" checked={this.state.debugMode === 0}></input>
                                <span className={this.state.debugMode === 0 ? selectClass : noSelectClass}>無効</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnDebugModeSelect(1) }}>
                                <input type="radio" name="sbj-options-debugmode-key" checked={this.state.debugMode === 1}></input>
                                <span className={this.state.debugMode === 1 ? selectClass : noSelectClass}>コンソールにログ出力</span>
                            </div>
                            <div className="sbj-option" onClick={(e) => { this.OnDebugModeSelect(2) }}>
                                <input type="radio" name="sbj-options-debugmode-key" checked={this.state.debugMode === 2}></input>
                                <span className={this.state.debugMode === 2 ? selectClass : noSelectClass}>コンソールにログ出力（SkyWayのログを含む）</span>
                            </div>
                        </h6>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * エンターキーモードの設定
     * @param enterMode 
     */
    public OnEnterModeSelect(enterMode: number) {

        LocalCache.ChatEnterMode = enterMode;

        this.setState({
            enterMode: enterMode,
        });
    }


    /**
     * アクターチェンジモードの設定
     * @param actorChangeMode 
     */
    public OnActorChangeModeSelect(actorChangeMode: number) {
        LocalCache.ActorChangeKeyMode = actorChangeMode;

        this.setState({
            actorChangeMode: actorChangeMode,
        });
    }


    /**
     * 音声認識時の振舞いの設定
     * @param actorChangeMode 
     */
    public OnVoiceRecognitionModeSelect(mode: number) {
        LocalCache.VoiceRecognitionMode = mode;

        this.setState({
            voiceRecognitionMode: mode,
        });
    }


    /**
     * チャットメッセージのクリップボードコピー有無設定
     * @param actorChangeMode 
     */
    public OnChatMessageCopyModeSelect(mode: number) {
        LocalCache.ChatMessageCopyMode = mode;

        this.setState({
            cahtMessageCopyMode: mode,
        });
    }


    /**
     * アクター機能の使用有無
     * @param actorChangeMode 
     */
    public OnChangeUseActors(value: boolean) {
        LocalCache.UseActors = value;

        this.setState({
            useActors: value,
        });
    }


    /**
     * デバックモードの設定
     * @param actorChangeMode 
     */
    public OnDebugModeSelect(mode: number) {
        LocalCache.DebugMode = mode;

        this.setState({
            debugMode: mode,
        });
    }
    

}
