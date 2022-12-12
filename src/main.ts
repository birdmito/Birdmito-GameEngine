import {
    BitmapRenderer,
    GameEngine,
    registerBehaviour,
    TextRenderer,
    Transform
} from "./engine/engine";
import { MoveWhenClickBehaviour } from "./behaviours/MoveWhenClickBehaviour";
import { RotateBehaviour } from "./behaviours/RotateBehaviour";
import { LoopMoveBehaviour } from "./behaviours/LoopMoveBehaviour";

//每添加一个Behaviour，都需要在这里注册
//------------------------------------------------------------
registerBehaviour(Transform);
registerBehaviour(BitmapRenderer);
registerBehaviour(TextRenderer);

registerBehaviour(MoveWhenClickBehaviour);
registerBehaviour(RotateBehaviour);
registerBehaviour(LoopMoveBehaviour);

//游戏引擎实例
//---------------------------------------------------------------
const gameEngine = new GameEngine();
gameEngine.start("./scene.yaml");

window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        console.log("space");
        console.log(gameEngine.serialize());
    }
});