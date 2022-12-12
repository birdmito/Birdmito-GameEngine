import { Behaviour, SerializeField, Transform } from "../engine/engine";

export class MoveWhenClickBehaviour extends Behaviour {
    @SerializeField
    isClick = false;
    @SerializeField
    velocity = 1;
    @SerializeField
    currentVelocity = 0;

    onStart(): void {
        this.gameObject.onClick = () => {
            console.log("Clickable");
            this.isClick = true;
            this.currentVelocity = this.velocity;
        };
    }
    onUpdate() {
        if (this.isClick) {
            const transform = this.gameObject.getBehaviour(Transform);
            transform.x += this.currentVelocity;
        }
    }
}
