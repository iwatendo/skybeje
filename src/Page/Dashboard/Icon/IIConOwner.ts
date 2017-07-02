import * as Personal from "../../../Base/IndexedDB/Personal";


/**
 * アイコンデータを保持クラスの為のインターフェイス
 */
export interface IIConOwner {

    GetIconList(): Array<Personal.Icon>;

    UpdateIcon(icon: Personal.Icon);

    DeleteIcon(icon: Personal.Icon);

    ChangeIconOrder(icons: Array<Personal.Icon>);

}
