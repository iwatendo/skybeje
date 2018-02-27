import IServiceController from "../IServiceController";

interface OnMsg { (meg: string): void }


export default class MessageChannelUtil {

    private static _ownerPort: MessagePort = null;
    private static _ports = new Map<string, MessagePort>();
    private static _msg: string;


    /**
     * 
     * @param func 
     */
    public static SetOwner(onmsg: OnMsg) {
        var port: MessagePort;
        window.onmessage = (e: MessageEvent) => {
            let key = e.data;
            port = e.ports[0];
            if (port) {
                this._ports.set(key, port);
                port.postMessage(this._msg);
                port.onmessage = (e) => {
                    onmsg(e.data);
                }
            }
            else {
                if (this._ports.has(key)) {
                    this._ports.delete(key);
                }
            }
        }
    }


    /**
     * 
     * @param controller 
     * @param onmsg 
     */
    public static SetChild(controller: IServiceController, onmsg: OnMsg) {
        var mc = new MessageChannel();
        var port = mc.port1;
        let key = controller.ControllerName();
        if (controller.SwPeer) {
            key += controller.SwPeer.PeerId;
        }
        window.parent.postMessage(key, location.origin, [mc.port2]);
        port.onmessage = (e) => { onmsg(e.data); }
        this._ownerPort = port;
    }


    /**
     * 
     * @param key 
     */
    public static RemoveChild(key: string) {
        window.parent.postMessage(key, location.origin);
    }



    /**
     * 
     */
    public static Post(value: string) {
        this._msg = value;
        this._ports.forEach((port, key) => {
            port.postMessage(value);
        });
    }


    /**
     * 
     * @param value 
     */
    public static PostOwner(value: string) {
        this._ownerPort.postMessage(value);
    }

}