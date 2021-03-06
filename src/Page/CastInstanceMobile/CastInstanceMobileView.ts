﻿import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import StreamUtil, { MobileCam } from "../../Base/Util/StreamUtil";

import CastInstanceMobileController from "./CastInstanceMobileController";
import CastPropController from "../CastProp/CastPropController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import GMapsUtil from "../../Contents/Util/GMapsUtil";
import MapLocationSender from "../../Contents/Sender/MapLocationSender";
import FileUtil from "../../Base/Util/FileUtil";
import FileAttachUtil from "../../Base/Util/FileAttachUtil";
import PictureSender from "../../Contents/Sender/PictureSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";

declare var ons: any;

export default class CastInstanceMobileView extends AbstractServiceView<CastInstanceMobileController> {

    public Cursor: CastPropController;

    private _micMute: boolean = false;

    /**
     * 初期化処理
     */
    public Initialize(callback) {

        (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        StdUtil.StopTouchZoom();

        let audioElement = document.getElementById('audio') as HTMLAudioElement;
        let startBotton = document.getElementById('sbj-cast-instance-start') as HTMLInputElement;
        let stopBotton = document.getElementById('sbj-cast-instance-stop');
        let camchangeBotton = document.getElementById('sbj-camchange') as HTMLInputElement;
        let cameraBotton = document.getElementById('sbj-camera') as HTMLInputElement;
        let volumeSlider = document.getElementById("sbj-volume-slider") as HTMLInputElement;

        //  ストリーミング開始ボタン
        document.getElementById('sbj-cast-instance-start').onclick = (e) => {
            this.Controller.StartStreaming();
            document.getElementById('sbj-bottom-toolbar').hidden = true;
        }

        //  ストリーミング停止ボタン
        stopBotton.onclick = (e) => {
            this.Controller.StopStreaming();
            this.Controller.SwPeer.CloseAll();
            this.Controller.PageClose();
        };

        //  マイクボタン
        document.getElementById('sbj-mic').onclick = (e) => {
            this._micMute = !this._micMute;
            document.getElementById('sbj-mic-on').hidden = this._micMute;
            document.getElementById('sbj-mic-off').hidden = !this._micMute;
            StreamUtil.SetMute(this.Controller.Stream, this._micMute);
        }

        let cam = MobileCam.REAR;

        //  プレビュー表示処理
        let startPreviewFunc = (cam: MobileCam) => {
            setTimeout(() => {
                this.SetStreamPreview(cam, () => {
                    camchangeBotton.disabled = false;
                    startBotton.disabled = false;
                });
            }, 200);
        }

        //  カメラ変更ボタン
        camchangeBotton.onclick = (e) => {
            camchangeBotton.disabled = true;
            startBotton.disabled = true;
            setTimeout(() => {
                this.StopStreamPreview();
                //  リアとフロントのカメラを切替えプレビュー表示
                cam = (cam === MobileCam.REAR ? MobileCam.FRONT : MobileCam.REAR);
                startPreviewFunc(cam);
                this.MenuClose();
            }, 200);
        };

        //  位置情報通知
        document.getElementById('sbj-location').onclick = (e) => {
            GMapsUtil.GetLocate((gpos) => {
                this.ShowToast("位置情報を送信しています");
                this.MenuClose();
                let sender = new MapLocationSender();
                sender.Location = gpos;
                this.Controller.SwPeer.SendToOwner(sender);
                this.ShowToast("位置情報を送信しました");
            });
        }

        //  カメラ起動ボタン
        cameraBotton.onclick = (e) => {
            FileUtil.SelectImageCamera((file) => {
                this.ShowToast("写真を送信しています");
                this.MenuClose();
                FileAttachUtil.FileToBase64_ChageOrentation(file, (f, src) => {
                    let sender = new PictureSender(src);
                    this.Controller.SwPeer.SendToOwner(sender);
                    this.ShowToast("写真を送信しました");
                })
            });
        }

        //  スマホ画面の回転時イベント
        let controller = this.Controller;
        document.addEventListener("DOMContentLoaded", () => { this.SendOrientationChange(controller); });
        window.addEventListener('orientationchange', () => { this.SendOrientationChange(controller); }, false);

        //  起動時はリアカメラでプレビュー表示する
        startPreviewFunc(MobileCam.REAR);

        this.InitializeCursor();

        callback();
    }


    /**
     * 配信開始可能か確認
     */
    public ReadyCheck() {

        let disabled = true;

        if (this.Controller.IsReady()) {
            disabled = false;
        }

        let startButton = document.getElementById('sbj-cast-instance-start') as HTMLButtonElement;
        startButton.disabled = disabled;
    }
    

    /**
     * 
     * @param message 
     */
    private ShowToast(message: string) {
        (ons as any).notification.toast(message, {
            timeout: 2000
        });
    }

    /**
     * メニューを閉じる
     */
    public MenuClose() {
        var menu = document.getElementById('menu') as any;
        menu.close();
    }


    public StopStreamPreview() {

        let videoElement = document.getElementById('sbj-video-preview') as HTMLVideoElement;
        if (videoElement) videoElement.srcObject = null;

        if (this.Controller.Stream) {
            StreamUtil.Stop(this.Controller.Stream);
        }
    }


    /**
     * Video/Audioソースの取得とリストへのセット
     */
    public SetStreamPreview(cam: MobileCam, callback) {

        let controller = this.Controller;
        let videoElement = document.getElementById('sbj-video-preview') as HTMLVideoElement;

        let msc: MediaStreamConstraints;
        let isDebug = false;

        if (isDebug) {
            msc = StreamUtil.GetMediaStreamConstraints_DefaultDevice();
        }
        else {
            msc = StreamUtil.GetMediaStreamConstraints_Mobile(cam, true);
        }

        StreamUtil.GetStreaming(msc,
            (stream) => {
                if (this.Controller.SwRoom) {

                    if (this._micMute) {
                        StreamUtil.SetMute(stream, true);
                    }

                    this.Controller.SwRoom.Refresh(stream);
                }

                controller.Stream = stream;

                if (stream && videoElement) {
                    videoElement.onplaying = (e) => { callback(); }
                    StreamUtil.StartPreview(videoElement, stream);
                }
                else {
                    callback();
                }
            },
            (error) => {
                this.StreamErrorClose();
                alert(error);
            }
        );
    }


    /**
     * ストリームが取得できなかった場合、メッセージ表示して終了する
     */
    public StreamErrorClose() {
        document.getElementById('sbj-video-preview').hidden = true;

        let msg = "カメラ及びマイクへの接続に失敗しました\n";
        msg += "LINE等のアプリから開いた場合、アプリ内のブラウザから標準ブラウザ（iPhoneの場合 Safari / Androidの場合 Chrome)を開いてください。";
        alert(msg);
        this.Controller.SwPeer.CloseAll();
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {
        let video = document.getElementById('sbj-video-preview') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-item-layer') as HTMLElement;
        let curport = document.getElementById('sbj-cursor-layer') as HTMLElement;
        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return CursorDispOffset.GetVideoDispOffset(video); });
        this.Cursor.DisplayAll();
    }


    /**
     * プライベート配信の設定変更
     * @param sender
     */
    public SetCastSetting(sender: CastSettingSender) {

        if (this.Cursor) {
            if (!sender.useCastProp) {
                this.Cursor.Clear();
            }
        }
    }

    /**
     * 
     * @param controller 
     */
    public SendOrientationChange(controller: CastInstanceMobileController) {
        controller.SendOrientationChange();
        controller.View.Cursor.Clear();

    }

}
