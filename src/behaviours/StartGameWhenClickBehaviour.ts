import { Behaviour, SerializedNumber, Transform } from "../engine/engine";

export class StartGameWhenClickBehaviour extends Behaviour {
    //点击后开始游戏
    isClick = false;
    onStart(): void {
        this.gameObject.onClick = () => {
            console.log("Clickable");
            this.isClick = true;
            
        };
    }
    onUpdate() {
        if (this.isClick) {
            const transform = this.gameObject.getBehaviour(Transform);
        }
    }
}
