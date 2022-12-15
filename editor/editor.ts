const changeModeButton = document.getElementById("change-mode-button")!;

changeModeButton.addEventListener("click", async () => {
    const currentMode = await editor.executeCommand({ command: "getCurrentMode" });
    const newMode = currentMode === "play" ? "edit" : "play";
    editor.changeMode(newMode);
});

class HierarchyTreeView {
    private root: HTMLElement;

    constructor() {
        this.root = document.getElementById("hierarchy-tree-view")!;
    }

    async update() {
        type HierachyData = {
            name: string;
            children?: HierachyData[];
        };

        //const info = await editor.getAllGameObjectsInfo();
        const info = await editor.executeCommand({ command: "getAllGameObjectsInfo" });

        function createTreeView(data: HierachyData): HTMLElement {
            const ul = document.createElement("ul");
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

setTimeout(() => {
    const hierarchyTreeView = new HierarchyTreeView();
    hierarchyTreeView.update();
}, 1000);