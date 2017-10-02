

export interface ISWPeer {
    //  
    OnOpen();

    //  
    OnError(err);

    //  
    OnClose();
}


export default class SWPeer {

    private _peer: any;

    constructor(sender: ISWPeer) {
        SWPeer.GetApiKey((apikey) => {
            let peer = new Peer({ key: apikey, debug: 1 });
            peer.on('open', () => {
                sender.OnOpen();
            });

            peer.on('error', (e) => {
                sender.OnError(e);
            });

            peer.on('close', () => {
                sender.OnClose();
            });

            this._peer = peer;
        });
    }


    /**
     * 
     */
    public PeerId(): string {
        return (this._peer ? this._peer.id : "");
    }


    /**
     * SkyWayのAPIキーが記述されたファイルを読み込みます
     */
    public static GetApiKey(callback) {

        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    try {
                        let skyway = JSON.parse(xmlhttp.responseText);
                        callback(skyway.apikey);
                        return;
                    }
                    catch (e) {
                        let errMsg = "skyway.json\n" + e.toString();
                        alert(errMsg);
                    }
                }
                else {
                    alert("skyway.json not found.");
                }
            }
        }
        xmlhttp.open("GET", "/skyway.json", true);
        xmlhttp.send();
    }

}
