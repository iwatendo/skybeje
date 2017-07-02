import HomeInstanceController from "../HomeInstanceController";
import RoomManager from "./RoomManager";
import ServantManager from "./ServantManager";
import ChatManager from "./ChatManager";


export default class ManagerController {

    public Room: RoomManager;
    public Chat: ChatManager;
    public Servant: ServantManager;


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeInstanceController, callback) {

        this.Room = new RoomManager(controller);
        this.Chat = new ChatManager(controller, this.Room, callback);
        this.Servant = new ServantManager(controller, this.Room);
    }

}