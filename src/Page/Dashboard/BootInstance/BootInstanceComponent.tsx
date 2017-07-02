import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";

import HomeItemComponent from "../Home/HomeItemComponent";
import ImageDialogController from "../ImageDialogController";
import { DragAction } from "../INaviContainer";
import BootInstanceView from "./BootInstanceView";
import BootInstanceItemComponent from "./BootInstanceItemComponent";


/**
 * プロパティ
 */
export interface BootInstanceProp {
    controller: BootInstanceView;
    rooms: Array<Home.Room>;
    bootDuplication: boolean;
}


/**
 * 
 */
export interface BootInstanceStat {
    rooms: Array<Home.Room>;
}


export default class BootInstanceComponent extends React.Component<BootInstanceProp, BootInstanceStat> {


    private _selectedRoom: string = '';

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: BootInstanceProp, context?: any) {
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
            return (<BootInstanceItemComponent key={room.hid} owner={this} room={room} isSelect={isSelect} />);
        });

        let room: Home.Room = this.state.rooms.find((n) => (n.hid === this._selectedRoom));
        let key = (room ? room.hid : '');

        let bootButton;

        if (this.props.bootDuplication) {
            bootButton = (
                <div>
                    <h6>起動済みホームインスタンスが検出されました。前回の接続時に正常終了しなかった場合にも検出される事があります。</h6>
                    <h6>以下の強制起動ボタンから起動可能です。</h6>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent sbj-start-instance" onClick={this.OnClick_HomeInstanceForceBoot.bind(this)}>
                        <i className='material-icons'>cast</i>
                        &nbsp;ホームインスタンスの強制起動&nbsp;
                    </button>
                </div>
            );
        }
        else {
            bootButton = (
                <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored sbj-start-instance" onClick={this.OnClick_HomeInstanceStart.bind(this)}>
                    <i className='material-icons'>cast</i>
                    &nbsp;ホームインスタンスの起動&nbsp;
                </button>
            );
        }

        return (
            <div className="sbj-split">

                <div className="sbj-split-left">
                    <div className="mdl-card__supporting-text">
                        {bootButton}
                        <ul className="mdl-list">
                            {HomeListNodes}
                        </ul>
                    </div>
                </div>

                <div className="sbj-split-right" id='sbj-split-right-img'>

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
     * 部屋の選択
     */
    public SelectRoom(room: Home.Room) {
        this._selectedRoom = room.hid;
        this.setState({ rooms: this.state.rooms }, () => {
            this.props.controller.SetImageCss(room);
        });

    }


    /**
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
    }


    /**
     * ホームインスタンス起動
     * @param event 
     */
    public OnClick_HomeInstanceStart(event) {
        let hid = this._selectedRoom;
        if (hid) {
            this.props.controller.StartHomeInstance(hid, false);
        }
    }


    /**
     * ホームインスタンスの強制起動
     * @param event 
     */
    public OnClick_HomeInstanceForceBoot(event) {
        let hid = this._selectedRoom;
        if (hid) {
            this.props.controller.StartHomeInstance(hid, true);
        }
    }

}
