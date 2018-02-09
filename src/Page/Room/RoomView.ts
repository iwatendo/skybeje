
import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import ImageUtil from "../../Base/Util/ImageUtil";
import ImageInfo from "../../Base/Container/ImageInfo";
import ImageDialogController from "../Dashboard/ImageDialogController";
import RoomController from "./RoomController";


export default class RoomView extends AbstractServiceView<RoomController> {

    
    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        let isNew = this.Controller.IsNew;
        document.getElementById('sbj-room-title').textContent = "ルームの" + (isNew ? "追加" : "編集");
        document.getElementById('sbj-room-append').hidden = !isNew;
        document.getElementById('sbj-room-update').hidden = isNew;

        this.SetRoomInfo(this.Controller.Room);

        let room = this.Controller.Room;
        if (room.name) {
            document.getElementById('sbj-room-name-field').classList.remove('is-invalid');
            document.getElementById('sbj-room-name-field').classList.add('is-dirty');
        }
        if (room.tag) document.getElementById('sbj-room-tag-field').classList.add('is-dirty');
        if (room.note) document.getElementById('sbj-room-note-field').classList.add('is-dirty');

        this.Resize();
        this.SetButtonDisabled();
        this.InitializeEvent();

        document.getElementById('sbj-room-name').focus();

        callback();
    }


    /**
     * 各種イベントの初期化
     */
    public InitializeEvent() {

        let controller = this.Controller;
        let room = controller.Room;

        //  更新ボタン押下時
        document.getElementById('sbj-room-append').onclick = (e) => { this.RoomUpdate(this.Controller); }
        document.getElementById('sbj-room-update').onclick = (e) => { this.RoomUpdate(this.Controller); }

        //  画像変更ボタン押下時
        document.getElementById('sbj-room-edit-image').onclick = (e) => { this.OnClickEditImage(); }

        //  ルーム名変更時
        document.getElementById('sbj-room-name').oninput = (e) => { this.SetButtonDisabled(); }

        //  リサイズ時
        window.onresize = (e) => { this.Resize(); };


        //  キャンセルボタン押下時
        document.getElementById('sbj-room-cancel').onclick = (e) => { controller.CloseNotify(); }
        document.getElementById('sbj-room-dialog-close').onclick = (e) => { controller.CloseNotify(); };

        //  エリア外クリック
        document.getElementById('sbj-room').onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                controller.CloseNotify();
            }
        };

        //  ESCキーでのクローズ
        document.onkeydown = (e) => {
            if (e.keyCode === 27) {
                controller.CloseNotify();
            }
        }

        //  外部からのドラッグ時
        document.getElementById("sbj-room").addEventListener('dragover', (event: DragEvent) => {
            if (ImageUtil.IsImageDrag(event)) {
                this.OnClickEditImage();
            }
        });

    }


    /**
     * ルーム情報を画面にセット
     * @param room 
     */
    public SetRoomInfo(room: Home.Room) {
        (document.getElementById('sbj-room-name') as HTMLInputElement).value = room.name;
        (document.getElementById('sbj-room-tag') as HTMLInputElement).value = room.tag;
        (document.getElementById('sbj-room-note') as HTMLInputElement).value = room.note;
        this.SetImage();
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
     */
    private SetButtonDisabled() {

        let isDisabled = ((document.getElementById('sbj-room-name') as HTMLInputElement).value.length === 0);
        (document.getElementById('sbj-room-append') as HTMLInputElement).disabled = isDisabled;
        (document.getElementById('sbj-room-update') as HTMLInputElement).disabled = isDisabled;
    }


    /**
     * 
     * @param controller 
     */
    private RoomUpdate(controller: RoomController) {

        let room = controller.Room;
        let nameElement = document.getElementById('sbj-room-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-room-tag') as HTMLInputElement;
        let textElement = document.getElementById('sbj-room-note') as HTMLInputElement;

        room.name = nameElement.value;
        room.tag = tagElement.value;
        room.note = textElement.value;
        controller.Model.UpdateRoom(room, () => {
            controller.NotifyRoomChange(room.hid);
            controller.CloseNotify();
        });
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
            });
        }
    }


    /**
     * 
     */
    public SetImage() {
        let img = this.Controller.Room.background;
        ImageInfo.SetCss("sbj-room-image", img);
    }

}
