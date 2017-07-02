
import HomeView from "./HomeView";


export default class EntranceView extends HomeView {

    public IsEntrance(): boolean {
        return true;
    }

    public GetAddBtnTitle(): string {
        return "招待状の追加";
    }


    public GetAppendModeDialogTitle() {
        return "招待状の追加";
    }


    public GetEditModeDialogTitle() {
        return "招待状の変更";
    }

}

