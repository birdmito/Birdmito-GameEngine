import { Behaviour, SerializedNumber, Transform } from "../engine/engine";

export class RotateBehaviour extends Behaviour {
    @SerializedNumber
    velocity = 0;
    @SerializedNumber
    currentVelocity = 0;

    onStart(): void {
        this.currentVelocity = this.velocity;
    }
    onUpdate() {
        const transform = this.gameObject.getBehaviour(Transform);
        transform.rotation += this.currentVelocity;
    }
}
