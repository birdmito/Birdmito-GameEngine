import { Behaviour, SerializeField, Transform } from "../engine/engine";

export class RotateBehaviour extends Behaviour {
    @SerializeField
    velocity = 0;
    @SerializeField
    currentVelocity = 0;

    onStart(): void {
        this.currentVelocity = this.velocity;
    }
    onUpdate() {
        const transform = this.gameObject.getBehaviour(Transform);
        transform.rotation += this.currentVelocity;
    }
}
