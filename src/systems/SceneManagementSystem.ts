import { GameEngine, loadText } from "../engine/engine";
import { System } from "./System";

export class SceneManagementSystem extends System{

    async loadScene(sceneUrl: string){
        const content = await loadText(sceneUrl);
        this.gameEngine.unserialize(content);
    }
}

