import { Behaviour, SerializedNumber, SerializedString, Transform, instantiate } from "../engine/engine";

export class PrefabBehaviour extends Behaviour {
    @SerializedString
    prefabUrl = "";

    async onStart() {
       this.gameObject.addChild(await instantiate(this.prefabUrl));
    }
    onUpdate() {
        
    }
}
