import { Matrix, matrixAppendMatrix, Point, Rectangle, isPointInRectangle, matrixInvert, pointAppendMatrix } from "./math";

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



function Move(e: { clientX: any; clientY: any; }, rootDisplayObject: GameObject) {
    console.log(e.clientX, e.clientY);
    const point = { x: e.clientX, y: e.clientY };
    const hitTestResult = rootDisplayObject.hitTest(point);
    if (hitTestResult) {
        hitTestResult.onClick && hitTestResult.onClick();
    }
    //判断是否点击了对象
    // for (let i = rootDisplayObject.length - 1; i >= 0; i--) {    //画家算法，从后往前遍历
    //     const RenderObject = rootDisplayObject[i];
    //     const Bounds = RenderObject.getBounds();

    //     if (isPointInRectangle(point, Bounds)) {
    //         if (RenderObject.onClick) {
    //             RenderObject.onClick();
    //         }

    //         break;
    //     }
    // }
}


//定义基类
class GameObject {
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

    //绘制函数
    draw(context: CanvasRenderingContext2D) {
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
class Bitmap extends GameObject {
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
class TextField extends GameObject {
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

//定义游戏引擎类
class GameEngine {
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
            //执行游戏逻辑
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

//定义render动画函数
let MoveRange = 0;
let MoveDist = 1;
let isStarted = false;

const bitmap1 = new Bitmap();
bitmap1.image = "./images/meme.jpg";
bitmap1.onClick = () => {         //...原则
    console.log("image1-click");

    if (isStarted) {
        isStarted = false;
    }
    else {
        isStarted = true;
    }
}
const bitmap2 = new Bitmap();
bitmap2.image = "./images/meme.jpg";
bitmap2.y = 658;
bitmap2.onClick = () => {
    console.log("image2-click");
}
const text1 = new TextField();
text1.text = "BJUT";
text1.onClick = () => {
    console.log("text1-click");
}
const text2 = new TextField();
text2.x = text2.y = 658;
text2.text = "Birdmito";
text2.onClick = () => {
    console.log("text2-click");
}

const container = new GameObject();
container.addChild(bitmap1);
container.addChild(bitmap2);
container.addChild(text1);
container.addChild(text2);
container.rotation = 45;
container.onClick = () => {
    console.log("container-click");
}


//游戏引擎实例
const gameEngine = new GameEngine();
gameEngine.rootDisplayObject.addChild(container);       //将容器添加到根对象中
//开始时调用
gameEngine.Startup = function () {
    console.log("Hello world");
}
//每帧调用
gameEngine.onUpdate = function () {
    console.log("enter frame");

    //如果开始就运动，否则暂停
    if (isStarted) {
        if (MoveRange >= (canvas.width - 659)) {
            MoveDist = -MoveDist;
            MoveRange = 0
        }
        //imageX = imageX + MoveDist;
        bitmap1.x = bitmap1.x + MoveDist;
        MoveRange++;
    }

}

//实例开始运行
gameEngine.start();