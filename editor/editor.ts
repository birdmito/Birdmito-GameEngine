const changeModeButton = document.getElementById("change-mode-button")!;

changeModeButton.addEventListener("click", async () => {
    const currentMode = await editor.executeCommand({ command: "getCurrentMode" });
    const newMode = currentMode === "play" ? "edit" : "play";
    editor.changeMode(newMode);
});

//保存场景
const saveSceneButton = document.getElementById("save-scene-button")!;
saveSceneButton.addEventListener("click", async () => {
    const serializedScene = await editor.executeCommand({ command: "getSerializedScene" });
    console.log(serializedScene);
    await editor.saveScene("./scene.yaml", serializedScene);
});

//层级树可视化
class HierarchyTreeView {
    private root: HTMLElement;

    constructor() {
        this.root = document.getElementById("hierarchy-tree-view")!;
    }

    async update() {
        type HierachyData = {
            id: number;
            name: string;
            children?: HierachyData[];
        };

        //const info = await editor.getAllGameObjectsInfo();
        const info = await editor.executeCommand({ command: "getAllGameObjectsInfo" });

        function createTreeView(data: HierachyData): HTMLElement {
            const ul = document.createElement("ul");
            ul.addEventListener("click", (event) => {
                console.log(data.id);
                inspectorView.update(data.id);
                event.stopPropagation();    //阻止事件冒泡
            });
            const span = document.createElement("span");
            span.innerText = data.name;
            const li = document.createElement("li");
            li.appendChild(span);
            if (data.children) {
                data.children.forEach(child => {
                    li.appendChild(createTreeView(child));
                });
            }
            ul.appendChild(li);

            return ul;
        }

        const hierarchy = createTreeView(info);
        this.root.appendChild(hierarchy);
    }
}

//属性面板可视化
class InspectorView {
    private root: HTMLElement;

    constructor() {
        this.root = document.getElementById("inspector-view")!;
    }

    async update(id: number) {

        const viewModel = await editor.executeCommand({ command: "getGameObjectInfo", param: { id } });
        this.root.innerHTML = "";

        //生成html语句
        const div = document.createElement("div");
        const nameLabel = document.createElement("span");
        nameLabel.innerText = "name: ";
        div.appendChild(nameLabel);
        const nameInput = document.createElement("input");
        nameInput.value = viewModel.name;
        nameInput.addEventListener("change", async () => { });
        div.appendChild(nameInput);
        for (const behaviour of viewModel.behaviours) {
            const behaviourDiv = document.createElement("details");
            const behaviourSummary = document.createElement("summary");
            behaviourSummary.innerText = behaviour.name;
            behaviourDiv.appendChild(behaviourSummary);
            for (const property of behaviour.properties) {
                const propertyDiv = document.createElement("div");
                const propertyNameLabel = document.createElement("span");
                propertyNameLabel.innerText = property.name + ": ";
                propertyDiv.appendChild(propertyNameLabel);
                const propertyInput = document.createElement("input");
                propertyInput.value = property.value.toString();
                console.log(property);
                propertyInput.addEventListener("change", async () => { });
                propertyDiv.appendChild(propertyInput);
                behaviourDiv.appendChild(propertyDiv);
                propertyInput.addEventListener("change", async () => {
                    let value: any = propertyInput.value;
                    if (property.type === "number") {
                        value = Number(value);
                    }
                    editor.executeCommand({
                        command: "modifyBehaviourProperty",
                        param: {
                            id,
                            behaviourName: behaviour.name,
                            propertyName: property.name,
                            value
                        }
                    });
                });
            }
            div.appendChild(behaviourDiv);
        }

        this.root.appendChild(div);
    }
}


let hierarchyTreeView: HierarchyTreeView;
let inspectorView: InspectorView;

setTimeout(() => {
    hierarchyTreeView = new HierarchyTreeView();
    hierarchyTreeView.update();
    inspectorView = new InspectorView();
}, 1000);

