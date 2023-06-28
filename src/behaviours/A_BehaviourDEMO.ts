import { Behaviour, SerializedNumber, Transform } from "../engine/engine";

//写完Behavior后，记得在src\main.ts中注册
export class A_BehaviourDEMO extends Behaviour {

    onStart(): void {
        this.gameObject.onClick = () => {
            console.log("Clickable");
        };
    }
    onUpdate() {
    }
}
