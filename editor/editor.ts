const changeModeButton = document.getElementById("change-mode-button")!;

changeModeButton.addEventListener("click", async () => {
    const currentMode = await editor.getCurrentMode();
    const newMode = currentMode === "play" ? "edit" : "play";
    editor.changeMode(newMode);
});


