
import * as Home from "../../Base/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import ImageUtil from "../../Base/Util/ImageUtil";
import ImageInfo from "../../Base/Container/ImageInfo";
import ImageDialogController from "../Dashboard/ImageDialogController";

import RoomController from "./RoomController";


export default class RoomView extends AbstractServiceView<RoomController> {

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        let controller = this.Controller;
        let actor = controller.Room;
        let backpanel = document.getElementById('sbj-room');
        let cancelButton = document.getElementById('sbj-room-cancel');
        let nameElement = document.getElementById('sbj-room-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-room-tag') as HTMLInputElement;
        let textElement = document.getElementById('sbj-room-note') as HTMLInputElement;
        let editImageElement = document.getElementById('sbj-room-edit-image');


        nameElement.value = actor.name;
        tagElement.value = actor.tag;
        textElement.value = actor.note;

        if (actor.name) document.getElementById('sbj-room-name-field').classList.add('is-dirty');
        if (actor.tag) document.getElementById('sbj-room-tag-field').classList.add('is-dirty');
        if (actor.note) document.getElementById('sbj-room-note-field').classList.add('is-dirty');

        nameElement.onblur = (e) => this.CheckChangeUpdate(controller);
        tagElement.onblur = (e) => this.CheckChangeUpdate(controller);
        textElement.onblur = (e) => this.CheckChangeUpdate(controller);
        editImageElement.onclick = (e) => this.OnClickEditImage();

        //
        backpanel.onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                controller.CloseNotify();
            }
        };

        window.onresize = (e) => {
            this.Resize();
        };

        //  キャンセルボタン押下時
        cancelButton.onclick = (e) => {
            controller.CloseNotify();
        };

        //  外部からのドラッグイベント時
        document.getElementById("sbj-room").addEventListener('dragover', (event: DragEvent) => {

            //  ドラッグされた内容によって処理を分ける
            if (ImageUtil.IsImageDrag(event)) {
                this.OnClickEditImage();
            }

        });

        //  キー入力時イベント
        document.onkeydown = (e) => {
            //  エスケープキーはダイアログを閉じる
            if (e.keyCode === 27) {
                controller.CloseNotify();
            }
        }

        this.Resize();
        this.SetImage();
        nameElement.focus();
        callback();
    }


    /**
     * 
     */
    public Resize() {

        let height = window.innerHeight - 160;

        if (height < 540) height = 540;
        if (height > 720) height = 720;

        let marginTop = (Math.round(height / 2)) * -1;

        let mainpanel = document.getElementById('sbj-room-layout') as HTMLElement;
        mainpanel.style.height = height.toString() + "px";
        mainpanel.style.margin = marginTop.toString() + "px 0 0 -480px";
    }


    /**
     * 
     * @param controller 
     */
    private CheckChangeUpdate(controller: RoomController) {

        let room = controller.Room;
        let nameElement = document.getElementById('sbj-room-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-room-tag') as HTMLInputElement;
        let textElement = document.getElementById('sbj-room-note') as HTMLInputElement;

        if (nameElement.value !== room.name
            || tagElement.value !== room.tag
            || textElement.value !== room.note) {
            room.name = nameElement.value;
            room.tag = tagElement.value;
            room.note = textElement.value;
            controller.Model.UpdateRoom(room);
            controller.NotifyRoomChange(room.hid);
        }
    }

    /**
     * 背景画像の変更
     */
    public OnClickEditImage() {
        let controller = this.Controller;
        let room = controller.Room;
        if (room) {
            ImageDialogController.Edit(room.background, (img) => {
                room.background = img;
                this.SetImage();
                controller.Model.UpdateRoom(room);
                controller.NotifyRoomChange(room.hid);
            });
        }
    }

    public SetImage() {
        let img = this.Controller.Room.background;
        ImageInfo.SetCss("sbj-room-image", img);
    }

}
