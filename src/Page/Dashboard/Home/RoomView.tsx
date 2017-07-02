import HomeView from "./HomeView";

export default class RoomView extends HomeView {

    public IsEntrance(): boolean {
        return false;
    }

    public GetAddBtnTitle(): string {
        return "部屋の追加";
    }

    public GetAppendModeDialogTitle() {
        return "部屋の追加";
    }

    public GetEditModeDialogTitle() {
        return "部屋の変更";
    }

}

