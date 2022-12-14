declare namespace editor {
    export function changeMode(mode: "play" | "edit"): Promise<void>;

    export function getCurrentMode(): Promise<"play" | "edit">;
}

declare namespace runtime {
    export function handleGetCurrentMode(callback: Function);
}