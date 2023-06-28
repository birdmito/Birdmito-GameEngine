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
import { WorldBehaviour } from "./behaviours/WorldBehaviour";
import { PrefabBehaviour } from "./behaviours/PrefabBehaviour";
import { StartGameWhenClickBehaviour } from "./behaviours/StartGameWhenClickBehaviour";
import { CanvasBehaviour } from "./behaviours/CanvasBehaviour";

//每添加一个Behaviour，都需要在这里注册
//------------------------------------------------------------
registerBehaviour(Transform);
registerBehaviour(BitmapRenderer);
registerBehaviour(TextRenderer);

registerBehaviour(MoveWhenClickBehaviour);
registerBehaviour(RotateBehaviour);
registerBehaviour(LoopMoveBehaviour);
registerBehaviour(WorldBehaviour);
registerBehaviour(PrefabBehaviour);
registerBehaviour(StartGameWhenClickBehaviour);
registerBehaviour(CanvasBehaviour);

//游戏引擎实例
//---------------------------------------------------------------
const gameEngine = new GameEngine();
gameEngine.start("assets/prefabs/A_CanvasDemo.yaml");

window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        console.log("space");
        console.log(gameEngine.serialize());
    }
});