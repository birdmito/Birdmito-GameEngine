declare namespace editor {
    type Command = {
        command: string;
        param?: any;
    };

    export function changeMode(mode: "play" | "edit"): Promise<void>;

    export function saveScene(url: string, data: string): Promise<void>;

    export function executeCommand(command: Command): Promise<any>;
}

declare namespace runtime {
    export function handleExecuteCommand(): void;

    export function registerCommand(commandName: string, command: Function): void;
}