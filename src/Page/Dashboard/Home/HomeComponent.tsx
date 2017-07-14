import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import { DialogMode } from "../../../Base/Common/AbstractDialogController";
import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import ImageInfo from "../../../Base/Container/ImageInfo";

import { DragAction } from "../INaviContainer";
import ImageDialogController from "../ImageDialogController";
import HomeItemComponent from "./HomeItemComponent";
import HomeImageComponent from "./HomeImageComponent";
import HomeEditDialogController from "./HomeEditDialog/HomeEditDialogController";
import HomeView from "./HomeView";


/**
 * プロパティ
 */
export interface HomeProp {
    controller: HomeView;
    rooms: Array<Home.Room>;
}


/**
 * 
 */
export interface HomeStat {
    rooms: Array<Home.Room>;
}


export default class HomeComponent extends React.Component<HomeProp, HomeStat> {


    private _selectedRoom: string = '';

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: HomeProp, context?: any) {
        super(props, context);

        if (this.props.rooms.length > 0) {
            Order.Sort(this.props.rooms);
            this._selectedRoom = this.props.rooms[0].hid;
        }

        this.state = {
            rooms: props.rooms,
        };
    }


    public render() {

        this.state.rooms.sort((a, b) => (a.order - b.order));

        let HomeListNodes = this.state.rooms.map((room) => {
            let isSelect = (this._selectedRoom === room.hid);
            return (<HomeItemComponent key={room.hid} owner={this} room={room} isSelect={isSelect} />);
        });

        let room: Home.Room = this.state.rooms.find((n) => (n.hid === this._selectedRoom));
        let key = (room ? room.hid : '');

        return (
            <div className="sbj-split">

                <div className="sbj-split-left">
                    <div className="mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnClick_AddHome.bind(this)}>
                            <i className='material-icons'>add</i>
                            &nbsp;ルーム追加&nbsp;
                        </button>
                        <ul className="mdl-list">
                            {HomeListNodes}
                        </ul>
                    </div>
                </div>

                <div className="sbj-split-right" id='sbj-split-right-img'>
                    <HomeImageComponent key={key} owner={this} room={room} />
                </div>

            </div>
        );
    }


    private NewRoom(): Home.Room {
        let newRoom = new Home.Room();
        newRoom.hid = StdUtil.CreateUuid();
        newRoom.name = "";
        newRoom.tag = "";
        newRoom.text = "";
        newRoom.order = Order.New(this.state.rooms);
        newRoom.background = new ImageInfo();

        return newRoom;
    }


    /**
     * 部屋の追加
     */
    public OnClick_AddHome(event) {
        let prop = this.props;
        let dialog = new HomeEditDialogController(null);

        dialog.Show(DialogMode.Append, this.NewRoom(), (room) => {
            this.props.controller.UpdateRoom(room);
            this.state.rooms.push(room);
            this.SelectRoom(room);
        });

    }


    /**
     * 部屋の選択
     */
    public SelectRoom(room: Home.Room) {
        this._selectedRoom = room.hid;
        this.setState({ rooms: this.state.rooms }, () => {
            this.props.controller.SetImageCss(room);
        });

    }


    /**
     * 部屋の削除処理
     */
    public DeleteRoom(room: Home.Room) {
        this.setState({
            rooms: this.state.rooms.filter((n => n.hid !== room.hid)),
        });
        this.props.controller.DeleteRoom(room);
    }


    /**
     * 部屋情報変更時処理
     */
    public UpdateRoom(room: Home.Room) {

        let newRoomList = this.state.rooms.filter((n => n.hid !== room.hid));
        newRoomList.push(room);

        this.setState({ rooms: newRoomList });
        this.props.controller.SetImageCss(room);
        this.props.controller.UpdateRoom(room);
    }


    /**
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
        this.props.controller.SetDragFromOutsideAction(action);
    }


    /**
     * 部屋の並び順変更
     */
    public ChangeRoomOrder(rooms: Array<Home.Room>) {

        this.setState({
            rooms: this.state.rooms,
        }, () => {
            this.state.rooms.forEach(cur => {
                this.props.controller.UpdateRoom(cur);
            });
        });
    }

}
