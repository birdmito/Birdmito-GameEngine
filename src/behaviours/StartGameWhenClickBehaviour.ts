import { Behaviour, SerializedNumber, Transform, instantiate } from "../engine/engine";
import { SceneManagementSystem } from "../systems/SceneManagementSystem";

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
            
        }
    }
}
