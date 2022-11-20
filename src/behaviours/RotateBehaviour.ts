import { Behaviour, Transform } from "../engine/engine";

export class RotateBehaviour extends Behaviour {
    velocity = 0;
    currentVelocity = 0;

    onStart(): void {
        this.currentVelocity = this.velocity;
    }
    onUpdate() {
        const transform = this.gameObject.getBehaviour(Transform);
        transform.rotation += this.currentVelocity;
    }
}
