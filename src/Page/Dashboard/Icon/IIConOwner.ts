import * as Personal from "../../../Base/IndexedDB/Personal";


/**
 * アイコンデータ更新用インターフェイス
 */
export interface IIConOwner {

    GetIconList(): Array<Personal.Icon>;

    UpdateIcon(icon: Personal.Icon);

    DeleteIcon(icon: Personal.Icon);

    ChangeIconOrder(icons: Array<Personal.Icon>);

}
