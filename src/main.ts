import {
    Behaviour,
    BitmapRenderer,
    GameEngine,
    GameObject,
    TextRenderer,
    Transform
} from "./engine/engine";

// function Move(e: { clientX: any; clientY: any; }, rootDisplayObject: GameObject) {
//     console.log(e.clientX, e.clientY);
//     const point = { x: e.clientX, y: e.clientY };
//     const hitTestResult = rootDisplayObject.hitTest(point);
//     if (hitTestResult) {
//         hitTestResult.onClick && hitTestResult.onClick();
//     }
// }

class MoveWhenClickBehaviour extends Behaviour {
    isClick = false;
    velocity = 1;
    currentVelocity = 0;

    onStart(): void {
        this.gameObject.onClick = () => {
            console.log("Clickable");
            this.isClick = true;
            this.currentVelocity = this.velocity;
        }
    }
    onUpdate() {
        if (this.isClick) {
            const transform = this.gameObject.getBehaviour(Transform);
            transform.x += this.currentVelocity;
        }
    }
}
class RotateBehaviour extends Behaviour {
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
class LoopMoveBehaviour extends Behaviour {     //往复运动
    isClick = false;
    velocity = 1;
    moveRange = 1920 - 659;     //移动范围 = 画布宽度 - 物体宽度
    moveDistance = 0;       //物体移动距离

    onStart(): void {
        this.gameObject.onClick = () => {
            console.log("LoopMoveBehaviour");
            this.isClick = !this.isClick;
        }
    }
    onUpdate() {
        const transform = this.gameObject.getBehaviour(Transform);
        //如果开始就运动，否则暂停
        if (this.isClick) {
            if (this.moveDistance >= this.moveRange) {   //如果移动距离大于移动范围，则反向移动
                this.velocity = -this.velocity;
                this.moveDistance = 0
            }
            //物体新位置 = 物体原位置 + 每帧移动位置;
            transform.x = transform.x + this.velocity;
            this.moveDistance += Math.abs(this.velocity);
        }
    }
}
class GameStartupBehaviour extends Behaviour {      //游戏场景内容管理Behaviour

    onStart(): void {
        //游戏场景内容
        //---------------------------------------------------------------
        const bitmap1 = new GameObject();
        const bitmap1Renderer = new BitmapRenderer();
        bitmap1Renderer.image = "./images/meme.jpg";
        bitmap1.addBehaviour(bitmap1Renderer);
        const loopMoveBehaviour1 = new LoopMoveBehaviour();
        loopMoveBehaviour1.velocity = 2;
        bitmap1.addBehaviour(loopMoveBehaviour1);

        const bitmap2 = new GameObject();
        const bitmap2Renderer = new BitmapRenderer();
        bitmap2Renderer.image = "./images/meme.jpg";
        const bitmap2Transform = bitmap2.getBehaviour(Transform);
        bitmap2Transform.y = 658;
        bitmap2.onClick = () => {
            console.log("image2-click");
        }
        bitmap2.addBehaviour(bitmap2Renderer);

        const text1 = new GameObject();
        const text1Renderer = new TextRenderer();
        text1Renderer.text = "MainRole";
        const move1 = new MoveWhenClickBehaviour();     //实例以调整速度
        move1.velocity = 2;
        const rotate1 = new RotateBehaviour();        //实例以调整速度
        rotate1.velocity = 2;
        text1.addBehaviour(text1Renderer);
        text1.addBehaviour(move1);    //添加组件
        text1.addBehaviour(rotate1);    //添加组件

        const text2 = new GameObject();
        const text2Transform = text2.getBehaviour(Transform);
        const text2Renderer = new TextRenderer();
        text2Transform.x = text2Transform.y = 658;
        text2Renderer.text = "Birdmito";
        text2.addBehaviour(text2Renderer);
        text2.onClick = () => {
            console.log("text2-click");
        }

        const gameObjectContainer = this.gameObject;  //容器可以包含多个子物体（类似于Unity空父级物体）
        const gameObjectContainerTransform = gameObjectContainer.getBehaviour(Transform);
        gameObjectContainer.addChild(bitmap1);
        gameObjectContainer.addChild(bitmap2);
        gameObjectContainer.addChild(text1);
        gameObjectContainer.addChild(text2);
        gameObjectContainerTransform.rotation = 0;
        gameObjectContainer.onClick = () => {
            console.log("container-click");
        }
    }
}


//游戏引擎实例
//---------------------------------------------------------------
const gameEngine = new GameEngine();
const rootContainer = new GameObject();
rootContainer.addBehaviour(new GameStartupBehaviour());
gameEngine.rootDisplayObject.addChild(rootContainer);       //将容器添加到根对象中
gameEngine.start();