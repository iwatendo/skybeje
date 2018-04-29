

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

    public static SetColered(elementName: string, value: boolean) {

        let element = (document.getElementById(elementName) as HTMLInputElement);
        if (value) {
            element.classList.add('mdl-button--colored');
        }
        else {
            element.classList.remove('mdl-button--colored');
        }
    }

    /**
     * 
     * @param textElement 
     * @param fieldEleemntName 
     * @param value 
     * @param useInvalid 
     */
    public static SetTextField(textElementName: string, fieldElementName: string, value: string, useInvalid: boolean = false) {

        let textElement = document.getElementById(textElementName) as HTMLInputElement;
        let fieldElement = document.getElementById(fieldElementName);

        if (textElement && fieldElement) {

            value = (value ? value : "");
            textElement.value = value;

            if (value.length > 0) {
                if (useInvalid) fieldElement.classList.remove('is-invalid');
                fieldElement.classList.add('is-dirty');
            }
            else {
                if (useInvalid) fieldElement.classList.add('is-invalid');
                fieldElement.classList.remove('is-dirty');
            }
        }
    }


}
