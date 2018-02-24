interface OnMsg { (meg: string): void }


export default class MessageChannelUtil {

    private static _ports = new Map<string, MessagePort>();
    private static _msg: string;


    /**
     * 
     * @param func 
     */
    public static SetOwner() {
        var port: MessagePort;
        window.onmessage = (e: MessageEvent) => {
            let key = e.data;
            port = e.ports[0];
            if (port) {
                this._ports.set(key, port);
                port.postMessage(this._msg);
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
     */
    public static Post(value: string) {
        this._msg = value;
        this._ports.forEach((port, key) => {
            port.postMessage(value);
        });
    }


    /**
     * 
     * @param onmsg 
     */
    public static SetReceiver(key: string, onmsg: OnMsg) {
        var mc = new MessageChannel();
        var port = mc.port1;
        window.parent.postMessage(key, location.origin, [mc.port2]);
        port.onmessage = (e) => { onmsg(e.data); }
    }


    /**
     * 
     * @param key 
     */
    public static RemoveReceiver(key: string) {
        window.parent.postMessage(key, location.origin);
    }

}