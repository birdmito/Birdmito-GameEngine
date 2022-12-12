import {
    isPointInRectangle,
    Matrix,
    matrixAppendMatrix,
    matrixInvert,
    Point,
    pointAppendMatrix
} from "../math";
import yaml from "js-yaml";

//获取画布
const canvas = document.getElementById("game") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

let behaviourMap = new Map<string, typeof Behaviour>();
export function registerBehaviour(behaviour: typeof Behaviour) {
    behaviourMap.set(behaviour.name.replace("_", ""), behaviour); //注册Behaviour
}

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
//定义加载文本函数
function loadText(url: string) {
    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
            resolve(xhr.responseText);
        };
        xhr.send();
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
    parent: GameObject | null = null;   //父对象
    children: GameObject[] = [];   //子对象
    behaviours: Behaviour[] = [];    //Behavior组件组
    renderer: RendererBehaviour | null = null;      //渲染器
    onClick: Function | undefined;        //点击判断

    constructor() {
        this.addBehaviour(new Transform());
    }

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
        if (behaviour instanceof RendererBehaviour) {   //判断是否是渲染器
            this.renderer = behaviour;
        }
        this.behaviours.push(behaviour);
        behaviour.gameObject = this;
        behaviour.onStart();
    }
    //是否有某个Behavior组件
    hasBehaviour(behaviour: typeof Behaviour) {
        for (const b of this.behaviours) {
            if (b instanceof behaviour) {
                return true;
            }
        }
        return false;
    }
    //获取Behavior组件
    getBehaviour<T extends typeof Behaviour>(behaviourClass: T): InstanceType<T> {    //根据类名获取Behavior组件
        for (const behaviour of this.behaviours) {
            if (behaviour instanceof behaviourClass) {    //判断是否是某个类的实例
                return behaviour as InstanceType<T>;    //返回该类型实例
            }
        }
        throw new Error('Behaviour ${behaviourClass.name} not found');
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
    onUpdate() {

        //调用所有Behavior组件
        for (const behaviour of this.behaviours) {
            behaviour.onUpdate();
        }

        //绘制子对象
        for (const child of this.children) {
            child.onUpdate();
        }
    };

    //点击方法
    hitTest(point: Point): GameObject | null {   //点击判断
        for (let i = this.children.length - 1; i >= 0; i--) {    //画家算法，从后往前遍历
            const child = this.children[i];
            const childTransform = child.getBehaviour(Transform);
            const invertChildMatrix = matrixInvert(childTransform.localMatrix);
            const pointInLocal = pointAppendMatrix(point, invertChildMatrix);
            const hitTestResult = child.hitTest(pointInLocal);
            if (hitTestResult) {
                return hitTestResult;
            }
        }
        const bounds = this.renderer ?      //判断是否有渲染器（三目运算符）
            this.renderer.getBounds() : //获取渲染组件的边界（多态）
            { x: 0, y: 0, width: 0, height: 0 }; //因为局部矩阵是相对于父对象的，所以这里返回的是相对于父对象的坐标，x/y都是0
        if (isPointInRectangle(point, bounds)) {
            return this;
        }
        return null;
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
export class RendererBehaviour extends Behaviour {  //渲染器组件,提供getBounds方法实现子类的多态
    getBounds() {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
}

export const SerializeField: PropertyDecorator = (target, key) => {  //装饰器，用于序列化
    const targetConstructor = target.constructor as any;
    targetConstructor.metadatas = targetConstructor.metadatas || [];
    targetConstructor.metadatas.push({ key });
}
export class Transform extends Behaviour {
    //初始Transform信息
    @SerializeField
    x = 0;
    @SerializeField
    y = 0;
    @SerializeField
    scaleX = 1;
    @SerializeField
    scaleY = 1;
    @SerializeField
    rotation = 0;  //旋转度数

    localMatrix = new Matrix();     //局部矩阵
    globalMatrix = new Matrix();        //全局矩阵

    onUpdate(): void {
        //更新矩阵
        this.localMatrix.updateFromTransformProperties(
            this.x,
            this.y,
            this.scaleX,
            this.scaleY,
            this.rotation
        );

        const parent = this.gameObject.parent;
        //更新全局矩阵
        if (parent) {
            const parentTransform = parent.getBehaviour(Transform); //获取父对象的Transform组件用于读取全局矩阵
            this.globalMatrix = matrixAppendMatrix(this.localMatrix, parentTransform.globalMatrix);
        } else {
            this.globalMatrix = this.localMatrix;
        }
    }
}
export class BitmapRenderer extends RendererBehaviour {
    @SerializeField
    image: string = "";

    onUpdate(): void {
        const transform = this.gameObject.getBehaviour(Transform);
        //设置变换
        context.setTransform(
            transform.globalMatrix.a,
            transform.globalMatrix.b,
            transform.globalMatrix.c,
            transform.globalMatrix.d,
            transform.globalMatrix.tx,
            transform.globalMatrix.ty
        );

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

export class TextRenderer extends RendererBehaviour {
    //定义初始内容
    @SerializeField
    text = "Hello world";
    textWidth = 0;

    onUpdate(): void {
        const transform = this.gameObject.getBehaviour(Transform);
        //设置变换
        context.setTransform(
            transform.globalMatrix.a,
            transform.globalMatrix.b,
            transform.globalMatrix.c,
            transform.globalMatrix.d,
            transform.globalMatrix.tx,
            transform.globalMatrix.ty
        );

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
//------------------------------------------------------------
export class GameEngine {
    rootDisplayObject = new GameObject();   //根对象
    onUpdate: Function | undefined;     //游戏逻辑
    Startup: Function | undefined;
    async start(sceneUrl: string) {
        //引擎启动->加载图片资源->加载场景->解析并创建场景->开始渲染
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

        const imageList = ["./images/meme.jpg"];    //图片列表
        for (const item of imageList) {    //加载图片
            await loadImage(item);
        }
        //反序列化
        const content = await loadText(sceneUrl);  //加载场景配置文件
        const sceneData = yaml.load(content);    //解析场景配置文件
        const rootContainer = createGameObject(sceneData);  //创建场景
        this.rootDisplayObject.addChild(rootContainer);       //将容器添加到根对象中

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
        this.rootDisplayObject.onUpdate();
        // for (const RenderObject of rootDisplayObject) {
        //     RenderObject.draw(context);
        // }

        //绘制边框
        context.setTransform(1, 0, 0, 1, 0, 0);  //重置矩阵
        DrawGraphics();

        requestAnimationFrame(() => this.render());
    }

    serialize() {
        const data = extractGameObject(this.rootDisplayObject.children[0]);
        const text = yaml.dump(data,
            {
                'styles': {
                    '!!null': 'canonical' // dump null as ~
                },
                noCompatMode: true,     //不使用兼容模式,解决y序列化后变成'y'的问题
                //'sortKeys': true        // sort object keys
            });

        return text;
    }
}

export function createGameObject(data: any): GameObject {       //封装
    const gameObject = new GameObject();
    for (const behaviourData of data.behaviours) {   //遍历创建behaviours
        const className = behaviourData.type;
        const behaviourClass = behaviourMap.get(className)!;        //多态
        const behaviour = gameObject.hasBehaviour(behaviourClass) ?
            gameObject.getBehaviour(behaviourClass) : new behaviourClass();  //如果已经存在该组件，则不再创建
        for (const key in behaviourData.properties) {
            (behaviour as any)[key] = behaviourData.properties[key];
        }
        gameObject.addBehaviour(behaviour);
    }
    for (const childData of data.children || []) {    //递归创建子对象,children可能不存在
        const child = createGameObject(childData);
        gameObject.addChild(child);
    }
    //console.log(gameObject);
    return gameObject;
}
export function extractGameObject(gameObject: GameObject): any {   //反序列化
    const data: any = {
        behaviours: [],
        children: [],
    };
    for (const behaviour of gameObject.behaviours) {
        const properties: any = {};
        const behaviourConstructor = behaviour.constructor as any;
        //console.log(behaviourConstructor.metadatas);
        for (const metadata of behaviourConstructor.metadatas || []) {   //仅显示有@SerializeField的属性
            properties[metadata.key] = (behaviour as any)[metadata.key];
        }
        data.behaviours.push({
            type: behaviour.constructor.name.replace("_", ""),
            properties,
        });
    }
    for (const child of gameObject.children) {
        data.children.push(extractGameObject(child));
    }
    return data;
}
