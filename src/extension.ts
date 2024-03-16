// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('comment-block.uncomment', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const selection = editor.selection;
        const cursorPosition = selection.active;

        let startLine = cursorPosition.line;
        let endLine = cursorPosition.line;

        // Find the beginning of the block
        while (startLine > 0 && document.lineAt(startLine).isEmptyOrWhitespace) {
            startLine--;
        }

        // Find the end of the block
        while (endLine < document.lineCount - 1 && document.lineAt(endLine).isEmptyOrWhitespace) {
            endLine++;
        }
        vscode.window.showInformationMessage(
            'Hello World from Awesome VSCode Extension Boilerplate!',
        );
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
