// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('comment-block.uncomment', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No open text editor');
            return;
        }

        const position = editor.selection.active;
        const document = editor.document;

        console.log(position);
        console.log(document.languageId);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
