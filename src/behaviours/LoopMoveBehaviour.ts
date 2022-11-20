import { Behaviour, Transform } from "../engine/engine";

export class LoopMoveBehaviour extends Behaviour {
    isClick = false;
    velocity = 1;
    moveRange = 1920 - 659; //移动范围 = 画布宽度 - 物体宽度
    moveDistance = 0; //物体移动距离

    onStart(): void {
        this.gameObject.onClick = () => {
            console.log("LoopMoveBehaviour");
            this.isClick = !this.isClick;
        };
    }
    onUpdate() {
        const transform = this.gameObject.getBehaviour(Transform);
        //如果开始就运动，否则暂停
        if (this.isClick) {
            if (this.moveDistance >= this.moveRange) { //如果移动距离大于移动范围，则反向移动
                this.velocity = -this.velocity;
                this.moveDistance = 0;
            }
            //物体新位置 = 物体原位置 + 每帧移动位置;
            transform.x = transform.x + this.velocity;
            this.moveDistance += Math.abs(this.velocity);
        }
    }
}
