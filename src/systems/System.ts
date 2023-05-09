import { BitmapRenderer, GameEngine, GameObject, imageCache, TextRenderer, Transform } from "../engine/engine";
import { isPointInRectangle, matrixAppendMatrix, matrixInvert, Point, pointAppendMatrix } from "../math";

export class System {
    gameEngine!: GameEngine;
    rootGameObject!: GameObject;
    onStart() { }

    onUpdate() { }

    onEnd() { }
}

//变换系统
export class TransformSystem extends System {
    onUpdate(): void {
        visitChildren(this.rootGameObject, (child) => {
            //将原来Transform中的onUpdate()方法中的代码移到这里了
            const transform = child.getBehaviour(Transform);
            //更新矩阵
            transform.localMatrix.updateFromTransformProperties(
                transform.x,
                transform.y,
                transform.scaleX,
                transform.scaleY,
                transform.rotation
            );

            const parent = child.parent;
            //更新全局矩阵
            if (parent) {
                const parentTransform = parent.getBehaviour(Transform); //获取父对象的Transform组件用于读取全局矩阵
                transform.globalMatrix = matrixAppendMatrix(transform.localMatrix, parentTransform.globalMatrix);
            } else {
                transform.globalMatrix = transform.localMatrix;
            }
        });
    }
}

//Behaviour生命周期系统
export class BehaviourLifecycleSystem extends System {
    onUpdate(): void {
        visitChildren(this.rootGameObject, (child) => {
            //将原来Behaviour中的onUpdate()方法中的代码移到这里了
            //调用所有Behavior组件
            for (const behaviour of child.behaviours) {
                behaviour.onUpdate();
            }
        });
    }
}

//鼠标控制系统
export class MouseControlSystem extends System {
    onStart(): void {
        window.addEventListener("click", (e) => {
            console.log(e.clientX, e.clientY);
            const point = { x: e.clientX, y: e.clientY };
            const hitTestResult = this.hitTest(this.rootGameObject, point);
            let current = hitTestResult;
            //scene
            // A
            // |-- B
            // |--|-- C
            // |-- D
            //冒泡机制,点击C，会触发C，B，A的点击事件
            while (current) {
                if (current.onClick) {
                    current.onClick();
                }
                current = current.parent;
            }
        });
    }

    hitTest(gameObject: GameObject, point: Point): GameObject | null {   //点击判断
        for (let i = gameObject.children.length - 1; i >= 0; i--) {    //画家算法，从后往前遍历
            const child = gameObject.children[i];
            const childTransform = child.getBehaviour(Transform);
            const invertChildMatrix = matrixInvert(childTransform.localMatrix);
            const pointInLocal = pointAppendMatrix(point, invertChildMatrix);
            const hitTestResult = this.hitTest(child, pointInLocal);
            if (hitTestResult) {
                return hitTestResult;
            }
        }
        const bounds = gameObject.renderer  //判断是否有渲染器（三目运算符）
            ? gameObject.renderer.getBounds()    //获取渲染组件的边界（多态）
            : { x: 0, y: 0, width: 0, height: 0 }; //因为局部矩阵是相对于父对象的，所以这里返回的是相对于父对象的坐标，x/y都是0
        if (isPointInRectangle(point, bounds)) {
            return gameObject;
        }
        return null;
    }
}

//编辑系统
export class EditorSystem extends System {
    onStart(): void {
        //命令逻辑
        const getAllGameObjectsInfo = () => {
            const object = this.rootGameObject.children[0];

            function extractGameObjectInfo(object: GameObject) {
                const result: any = {
                    id: object.id,
                    name: object.name + " " + object.id,
                    children: [],
                }
                for (const child of object.children) {
                    result.children.push(extractGameObjectInfo(child));
                }
                return result;
            }

            const result = extractGameObjectInfo(object);

            return result;
        }
        const getCurrentMode = () => {
            return this.gameEngine.mode;
        }
        const getGameObjectInfo = (param: { id: number }) => {
            const gameObject = GameObject.getGameObjectById(param.id)!;
            const viewModel = {
                name: gameObject.name,
                behaviours: gameObject.behaviours.map((behaviour) => {
                    const metadatas = (behaviour as any).constructor.metadatas || [];
                    return {
                        name: behaviour.constructor.name,
                        properties: metadatas.map((metadata: any) => {
                            return {
                                name: metadata.key,
                                type: metadata.type,
                                value: (behaviour as any)[metadata.key],
                            }
                        })
                    }
                },)
            };

            return viewModel;
        }
        const modifyBehaviourProperty = (param: {
            id: number,
            behaviourName: string,
            propertyName: string,
            value: any,
        }) => {
            const gameObject = GameObject.getGameObjectById(param.id)!;
            const behaviour = gameObject.behaviours.find((behaviour) => {
                return behaviour.constructor.name === param.behaviourName;
            });
            (behaviour as any)[param.propertyName] = param.value;
        }
        const getSerializedScene = () => {
            return this.gameEngine.serialize();
        }

        //注册命令
        registerCommand(getAllGameObjectsInfo);
        registerCommand(getCurrentMode);
        registerCommand(getGameObjectInfo);
        registerCommand(modifyBehaviourProperty);
        registerCommand(getSerializedScene);

        //执行命令
        runtime.handleExecuteCommand();
    }
}

//编辑器模式系统
export class EditorModeSystem extends System { }

//渲染系统(两种渲染方式：Canvas2D和WebGL)
//------------------------------------------------------
//#region RenderingSystem
//Canvas2D渲染系统
export class Canvas2DRenderingSystem extends System {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.context = canvas.getContext("2d")!;
    }

    onUpdate(): void {
        const context = this.context;
        const canvas = this.canvas;
        context.setTransform(1, 0, 0, 1, 0, 0);  //重置矩阵
        context.clearRect(0, 0, canvas.width, canvas.height);   //清空画布

        visitChildren(this.rootGameObject, (child) => {
            if (child.renderer) {  //如果有渲染器
                const transform = child.getBehaviour(Transform);
                //设置变换
                context.setTransform(
                    transform.globalMatrix.a,
                    transform.globalMatrix.b,
                    transform.globalMatrix.c,
                    transform.globalMatrix.d,
                    transform.globalMatrix.tx,
                    transform.globalMatrix.ty
                );

                if (child.renderer instanceof BitmapRenderer) {    //如果是位图渲染器
                    //将位图渲染器中的onUpdate()方法中的代码移到这里了
                    const texture = imageCache.get(child.renderer.image);

                    if (texture) {
                        context.drawImage(texture, 0, 0);
                    }
                }
                else if (child.renderer instanceof TextRenderer) { //如果是文本渲染器
                    //将文本渲染器中的onUpdate()方法中的代码移到这里了
                    const textRenderer = child.renderer;
                    //设置文本样式
                    context.font = "30px Arial";
                    context.fillStyle = "#000000";
                    context.textAlign = "left";
                    //context.fillText(this.text, this.x, this.y + 30);  //未采用局部矩阵时需要加上偏移量
                    context.fillText(textRenderer.text, 0, 30);             //加入局部坐标，采用局部矩阵时不需要加上偏移量（W7:01:01:25）
                    textRenderer.textWidth = context.measureText(textRenderer.text).width;  //获取文本宽度
                }
            }
        });

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
        context.setTransform(1, 0, 0, 1, 0, 0);  //重置矩阵
        DrawGraphics();
    }
}
//WebGL渲染系统
export class WebGLRenderingSystem extends System {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl")!;
    }

    onUpdate(): void {
        const gl = this.gl;
        const canvas = this.canvas;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.5, 0.3, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        visitChildren(this.rootGameObject, (child) => {
            if (child.renderer) {
                //渲染逻辑...
            }
        });
    }
}
//#endregion RenderingSystem

//递归遍历游戏对象树，通过回调函数实现多态
function visitChildren(gameObject: GameObject, callback: (gameObject: GameObject) => void) {
    callback(gameObject);
    //绘制子对象
    for (const child of gameObject.children) {
        visitChildren(child, callback);
    }
}
//注册命令
function registerCommand(command: Function) {
    runtime.registerCommand(command.name, command);
}