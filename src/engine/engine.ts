import {
    isPointInRectangle,
    Matrix,
    matrixAppendMatrix,
    matrixInvert,
    Point,
    pointAppendMatrix
} from "../math";
import yaml from "js-yaml";
import { BehaviourLifecycleSystem, Canvas2DRenderingSystem, EditorModeSystem, EditorSystem, MouseControlSystem, System, TransformSystem, WebGLRenderingSystem } from "../systems/System";

//获取画布
const canvas = document.getElementById("game") as HTMLCanvasElement;

let behaviourMap = new Map<string, typeof Behaviour>();
export function registerBehaviour(behaviour: typeof Behaviour) {
    behaviourMap.set(behaviour.name.replace("_", ""), behaviour); //注册Behaviour
}

//#region load Functions
//定义图片缓存
export const imageCache = new Map();
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
//#endregion load Functions

//游戏对象类（GameObject...）
//-----------------------------------------------------------------
//#region GameObject
export class GameObject {   //经过ECS重构后的GameObject成为微内核，仅提供多叉树和Behavior的基本操作
    parent: GameObject | null = null;   //父对象
    children: GameObject[] = [];   //子对象
    behaviours: Behaviour[] = [];    //Behavior组件组
    renderer: RendererBehaviour | null = null;      //渲染器
    onClick: Function | undefined;        //点击判断

    constructor() { }

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
}
//#endregion GameObject

//Unity-like架构：采取组合优先原则，Behaviour是组件，GameObject是实体
//---------------------------------------------------------------
//#region Behaviour

//#region @Serialized
export const SerializedNumber: PropertyDecorator = (target, key) => {  //装饰器，用于序列化
    const targetConstructor = target.constructor as any;
    targetConstructor.metadatas = targetConstructor.metadatas || [];
    targetConstructor.metadatas.push({ key, type: 'number' });
}
export const SerializedString: PropertyDecorator = (target, key) => {  //装饰器，用于序列化
    const targetConstructor = target.constructor as any;
    targetConstructor.metadatas = targetConstructor.metadatas || [];
    targetConstructor.metadatas.push({ key, type: 'string' });
}
//#endregion @Serialized

export class Behaviour {
    gameObject!: GameObject;

    //is called when the game is started
    onStart() { }

    //is called every frame
    onUpdate() { }

    //is called when the game is ended
    onEnd() { }
}

export class Transform extends Behaviour {
    //初始Transform信息
    @SerializedNumber
    x = 0;
    @SerializedNumber
    y = 0;
    @SerializedNumber
    scaleX = 1;
    @SerializedNumber
    scaleY = 1;
    @SerializedNumber
    rotation = 0;  //旋转度数

    localMatrix = new Matrix();     //局部矩阵
    globalMatrix = new Matrix();        //全局矩阵
}

//#region Renderer
export class RendererBehaviour extends Behaviour {  //渲染器组件,提供getBounds方法实现子类的多态
    getBounds() {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
}
export class BitmapRenderer extends RendererBehaviour {
    @SerializedString
    image: string = "";

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
    @SerializedString
    text = "Hello world";
    textWidth = 0;

    getBounds() {
        return {
            x: 0,       //因为局部矩阵是相对于父对象的，所以这里返回的是相对于父对象的坐标，x/y都是0
            y: 0,
            width: this.textWidth,
            height: 30,
        };
    }
}
//#endregion Renderer

//#endregion Behaviour

//定义游戏引擎类
//------------------------------------------------------------
export class GameEngine {
    rootGameObject = new GameObject();   //根对象
    systems: System[] = [];     //系统列表

    mode: "play" | "edit" = "play";    //引擎模式

    async start(sceneUrl: string) {
        //引擎启动->加载图片资源->加载场景->解析并创建场景->开始渲染

        const mode = new URL(window.location.href).searchParams.get("mode");  //获取URL参数
        if(mode === "edit"||mode === "play") {
            this.mode = mode;
        }
        else{
            throw new Error("mode must be 'edit' or 'play'");
        }

        this.rootGameObject.addBehaviour(new Transform());

        const imageList = ["./images/meme.jpg"];    //图片列表
        for (const item of imageList) {    //加载图片
            await loadImage(item);
        }

        //添加系统
        this.addSystem(new TransformSystem());  //添加变换系统
        this.addSystem(new Canvas2DRenderingSystem(canvas));  //添加Canvas2D渲染系统
        //this.addSystem(new WebGLRenderingSystem(canvas));  //添加WebGL渲染系统
        if (this.mode === "play") {
            this.addSystem(new BehaviourLifecycleSystem());  //添加行为生命周期系统
        }
        else if (this.mode === "edit") {
            this.addSystem(new EditorModeSystem());  //添加编辑模式系统
        }
        this.addSystem(new EditorSystem());  //添加编辑器系统
        this.addSystem(new MouseControlSystem()); //添加鼠标控制系统
        //系统初始化
        for (const system of this.systems) {
            system.onStart();
        }

        //反序列化
        const content = await loadText(sceneUrl);  //加载场景配置文件
        this.unserialize(content);  //解析场景配置文件

        requestAnimationFrame(() => this.onUpdate());

    }

    addSystem(system: System) {
        system.rootGameObject = this.rootGameObject; //传入游戏根对象
        system.gameEngine = this;   //传入游戏引擎
        this.systems.push(system);
    }

    onUpdate() {
        //系统更新
        for (const system of this.systems) {
            system.onUpdate();
        }

        requestAnimationFrame(() => this.onUpdate());
    }

    unserialize(content: string) {
        const sceneData = yaml.load(content);    //解析场景配置文件
        const rootContainer = createGameObject(sceneData);  //创建场景
        this.rootGameObject.addChild(rootContainer);       //将容器添加到根对象中
    }
    serialize(): string {
        const data = extractGameObject(this.rootGameObject.children[0]);
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

//#region Serialization and Deserialization Functions
export function createGameObject(data: any): GameObject {       //封装
    const gameObject = new GameObject();
    for (const behaviourData of data.behaviours) {   //遍历创建behaviours
        const className = behaviourData.type;
        const behaviourClass = behaviourMap.get(className)!;        //多态
        const behaviour = gameObject.hasBehaviour(behaviourClass)
            ? gameObject.getBehaviour(behaviourClass)
            : new behaviourClass();  //如果已经存在该组件，则不再创建

        const behaviourCosntructor = behaviourClass as any;
        const metadatas = behaviourCosntructor.metadatas || [];
        for (const metadata of metadatas) {
            const key = metadata.key;
            const value = behaviourData.properties[key];
            if (metadata.type === "number" && typeof value != "number") {
                throw new Error(behaviourData.type + '的' + key + '属性不是number类型');  //类型检查(不知道为什么${}不行)
            }
            (behaviour as any)[key] = value;
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
//#endregion Serialization and Deserialization Functions