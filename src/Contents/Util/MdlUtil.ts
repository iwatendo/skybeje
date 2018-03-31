

export default class MdlUtil {

    /**
     * MDLのチェックボックスの「表示」と、「実際の値」に相違が発生しないようする為の処理
     * @param checkElementName 
     * @param checkLabelElementName 
     * @param checked 
     */
    public static SetChecked(checkElementName: string, checkLabelElementName: string, checked: boolean) {
        (document.getElementById(checkElementName) as HTMLInputElement).checked = checked;
        if (checked) {
            document.getElementById(checkLabelElementName).classList.add('is-checked');
        }
        else {
            document.getElementById(checkLabelElementName).classList.remove('is-checked');
        }
    }

}
