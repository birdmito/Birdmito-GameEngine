import {
    isPointInRectangle,
    Matrix,
    matrixAppendMatrix,
    matrixInvert,
    Point,
    pointAppendMatrix
} from "../math";

//获取画布
const canvas = document.getElementById("game") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

//定义图片缓存
const imageCache = new Map();
//定义加载图片函数
function loadImage(url: string) {
    return new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            imageCache.set(url, image);
            resolve();
        };
        image.src = url;
    });
}
//定义绘制边框函数
function DrawGraphics() {
    context.moveTo(0, 0);
    context.lineTo(canvas.width, 0);
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.lineTo(0, 0);
    context.stroke();
    //context.fillStyle = "green";
    //context.fill();

}
//游戏对象类（GameObject...）
//-----------------------------------------------------------------
export class GameObject {
    //初始Transform信息
    x = 0;
    y = 0;
    scaleX = 1;
    scaleY = 1;
    rotation = 0;  //旋转度数
    localMatrix = new Matrix();     //局部矩阵
    globalMatrix = new Matrix();        //全局矩阵
    parent: GameObject | null = null;   //父对象
    children: GameObject[] = [];   //子对象
    private behaviours: Behaviour[] = [];    //Behavior组件组

    //多叉树方法
    addChild(child: GameObject) {   //添加子对象
        this.children.push(child);
        child.parent = this;
    }
    removeChild(child: GameObject) {   //移除子对象
        const index = this.children.indexOf(child);
        if (index >= 0) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    //添加Behavior组件（把变化的与不变化的分开，从子类中共通的提取到基类中）
    addBehaviour(behaviour: Behaviour) {
        this.behaviours.push(behaviour);
        behaviour.gameObject = this;
        behaviour.onStart();
    }
    //删除Behavior组件
    removeBehaviour(behaviour: Behaviour) {
        const index = this.behaviours.indexOf(behaviour);
        if (index >= 0) {
            this.behaviours.splice(index, 1);

            behaviour.onEnd();
        }
    }

    //绘制函数
    draw(context: CanvasRenderingContext2D) {

        for (const behaviour of this.behaviours) {
            behaviour.onUpdate();
        }

        //更新矩阵
        this.localMatrix.updateFromTransformProperties(
            this.x,
            this.y,
            this.scaleX,
            this.scaleY,
            this.rotation
        );
        //更新全局矩阵
        if (this.parent) {
            this.globalMatrix = matrixAppendMatrix(this.localMatrix, this.parent.globalMatrix);
        } else {
            this.globalMatrix = this.localMatrix;
        }
        //设置变换
        context.setTransform(
            this.globalMatrix.a,
            this.globalMatrix.b,
            this.globalMatrix.c,
            this.globalMatrix.d,
            this.globalMatrix.tx,
            this.globalMatrix.ty
        );
        //绘制子对象
        for (const child of this.children) {
            child.draw(context);
        }
    };

    //点击方法
    onClick: Function | undefined;        //点击判断
    hitTest(point: Point): GameObject | null {   //点击判断
        for (let i = this.children.length - 1; i >= 0; i--) {    //画家算法，从后往前遍历
            const child = this.children[i];
            const invertChildMatrix = matrixInvert(child.localMatrix);
            const pointInLocal = pointAppendMatrix(point, invertChildMatrix);
            const hitTestResult = child.hitTest(pointInLocal);
            if (hitTestResult) {
                return hitTestResult;
            }
        }
        const bounds = this.getBounds();
        if (isPointInRectangle(point, bounds)) {
            return this;
        }
        return null;
    }
    getBounds()     //获取边界（多态）
    {
        return { x: 0, y: 0, width: 0, height: 0 };     //因为局部矩阵是相对于父对象的，所以这里返回的是相对于父对象的坐标，x/y都是0
    }
}
//定义位图类
export class Bitmap extends GameObject {
    image: string = "";

    //定义位图的函数
    draw(context: CanvasRenderingContext2D) {
        super.draw(context);    //调用父类的函数
        const texture = imageCache.get(this.image);
        if (texture) {
            context.drawImage(texture, 0, 0);
        }
    }
    getBounds() {
        const texture = imageCache.get(this.image);
        return {
            x: 0,       //因为局部矩阵是相对于父对象的，所以这里返回的是相对于父对象的坐标，x/y都是0
            y: 0,
            width: texture.width,
            height: texture.height,
        };
    }
}
//定义文本类
export class TextField extends GameObject {
    //定义初始内容
    text = "Hello world";
    textWidth = 0;

    //定义文本的绘制函数
    draw(context: CanvasRenderingContext2D) {
        super.draw(context);    //调用父类的函数
        context.font = "30px Arial";
        context.fillStyle = "#000000";
        context.textAlign = "left";
        //context.fillText(this.text, this.x, this.y + 30);  //未采用局部矩阵时需要加上偏移量
        context.fillText(this.text, 0, 30);             //加入局部坐标，采用局部矩阵时不需要加上偏移量（W7:01:01:25）
        this.textWidth = context.measureText(this.text).width;  //获取文本宽度
    }
    getBounds() {
        return {
            x: 0,       //因为局部矩阵是相对于父对象的，所以这里返回的是相对于父对象的坐标，x/y都是0
            y: 0,
            width: this.textWidth,
            height: 30,
        };
    }
}

//Unity-like架构：采取组合优先原则，Behaviour是组件，GameObject是实体
//---------------------------------------------------------------
export class Behaviour {
    gameObject!: GameObject;

    //is called when the game is started
    onStart() { }

    //is called every frame
    onUpdate() { }

    //is called when the game is ended
    onEnd() { }
}

//定义游戏引擎类
//------------------------------------------------------------
export class GameEngine {
    rootDisplayObject = new GameObject();   //根对象
    onUpdate: Function | undefined;     //游戏逻辑
    Startup: Function | undefined;
    async start() {
        window.addEventListener("click", (e) => {
            console.log(e.clientX, e.clientY);
            const point = { x: e.clientX, y: e.clientY };
            const hitTestResult = this.rootDisplayObject.hitTest(point);
            let current = hitTestResult;
            //scene
            // A
            // |-- B
            // |--|-- C
            // |-- D
            //冒泡机制,点击C，会触发C，B，A，scene的点击事件
            while (current) {
                if (current.onClick) {
                    current.onClick();
                }
                current = current.parent;
            }
        });

        const imageList = ["./images/meme.jpg"];
        for (const item of imageList) {
            await loadImage(item);
        }

        if (this.Startup) {
            this.Startup();
        }

        requestAnimationFrame(() => this.render());

    }

    render() {
        //逐帧执行绘制
        context.setTransform(1, 0, 0, 1, 0, 0);  //重置矩阵
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (this.onUpdate) {
            this.onUpdate();
        }

        //执行引擎逻辑
        this.rootDisplayObject.draw(context);
        // for (const RenderObject of rootDisplayObject) {
        //     RenderObject.draw(context);
        // }

        //绘制边框
        context.setTransform(1, 0, 0, 1, 0, 0);  //重置矩阵
        DrawGraphics();

        requestAnimationFrame(() => this.render());
    }

}