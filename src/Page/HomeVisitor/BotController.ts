
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";
import * as Timeline from "../../Base/IndexedDB/Timeline";

import WebRTCService from "../../Base/Common/WebRTCService";

import HomeVisitorController from "./HomeVisitorController";
import BotUtil from "../../Base/Util/BotUtil";
import { ChatMessageSender } from "./HomeVisitorContainer";


export default class BotController {

    private Controller: HomeVisitorController = null;

    private _lastTime: number = 0;


    /**
     * コンストラクタ
     * @param serviceController
     */
    public constructor(controller: HomeVisitorController) {
        this.Controller = controller;
        this._lastTime = 0;
    }


    /**
     * チェックタイムライン
     * @param tlmsgs 
     */
    public CheckTimeline(tlmsgs: Array<Timeline.Message>) {

        //  古いメッセージが来るケースもある為
        //  BOT判定済みの最終発言メッセージの時間を保持しておく
        tlmsgs.forEach(tlmsg => {
            if (this._lastTime < tlmsg.ctime) {
                this._lastTime = tlmsg.ctime;
                this.CheckTimeLine(tlmsg);
            }
        });
    }


    /**
     * 
     * @param tlmsg 
     */
    public CheckTimeLine(tlmsg: Timeline.Message) {

        this.Controller.UseActor.ActorPeers.map(ap => {

            let actor = ap.actor;
            
            //  仮実装
            if (actor.tag === "dicebot") {
                this.DiceBotCheckMessage(actor, tlmsg);
            }
        });
    }


    /**
     * Diceボット
     * @param dicebot 
     * @param tlmsgs 
     */
    public DiceBotCheckMessage(actor: Personal.Actor, tlmsg: Timeline.Message) {

        if (tlmsg.aid !== actor.aid) {
            let result = BotUtil.Dice(tlmsg.text);
            if (result) {
                let sender = new ChatMessageSender();
                sender.aid = actor.aid;
                sender.iid = (actor.iconIds.length === 0 ? "" : actor.iconIds[0]);
                sender.name = actor.name;
                sender.text = result;
                sender.peerid = this.Controller.PeerId;
                WebRTCService.OwnerSend(sender);
            }
        }
    }

}