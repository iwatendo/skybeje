import Sender from "../Container/Sender";

/*
 *  ServiceReciver
 */
export interface IServiceReceiver {

    Receive(conn: PeerJs.DataConnection, sender: Sender);

}