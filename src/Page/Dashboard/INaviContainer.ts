

export interface DragAction { (): void }

export interface INaviContainer {

    //  描画処理
    Refresh();

    //  外部からのドラッグ処理
    OnDragFromOutside(event: DragEvent);

    //  外部からドラッグされた時の処理
    SetDragFromOutsideAction(action: DragAction);

}
