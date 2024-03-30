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

        let startLine = position.line;
        while (startLine >= 0 && document.lineAt(startLine).text.trim().startsWith('//')) {
            startLine--;
        }
        startLine++; // Adjust because loop decrements one past the actual start

        let endLine = position.line;
        const totalLines = document.lineCount;
        while (endLine < totalLines && document.lineAt(endLine).text.trim().startsWith('//')) {
            endLine++;
        }
        endLine--; // Adjust because loop increments one past the actual end

        editor
            .edit((editBuilder) => {
                for (let i = startLine; i <= endLine; i++) {
                    const line = document.lineAt(i);
                    editBuilder.replace(line.range, line.text.replace(/^(\s*)\/\/\s?/, '$1'));
                }
            })
            .then((success) => {
                if (success) {
                    vscode.window.showInformationMessage('Block uncommented successfully!');
                } else {
                    vscode.window.showErrorMessage('Failed to uncomment the block');
                }
            });

        context.subscriptions.push(disposable);
    });
}
