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

        // let startLine = position.line;
        // while (startLine >= 0 && document.lineAt(startLine).text.trim().startsWith('//')) {
        //     startLine--;
        // }
        // startLine++; // Adjust because loop decrements one past the actual start

        // let endLine = position.line;
        // const totalLines = document.lineCount;
        // while (endLine < totalLines && document.lineAt(endLine).text.trim().startsWith('//')) {
        //     endLine++;
        // }
        // endLine--; // Adjust because loop increments one past the actual end

        // let startLine = position.line;
        // while (startLine >= 0 && !document.lineAt(startLine).text.includes('/**')) {
        //     startLine--;
        // }

        // let endLine = position.line;
        // while (endLine < document.lineCount && !document.lineAt(endLine).text.includes('*/')) {
        //     endLine++;
        // }

        let startLine = position.line;
        while (startLine >= 0 && !document.lineAt(startLine).text.includes('{/*')) {
            startLine--;
        }

        let endLine = position.line;
        while (endLine < document.lineCount && !document.lineAt(endLine).text.includes('*/}')) {
            endLine++;
        }

        // editor
        //     .edit((editBuilder) => {
        //         for (let i = startLine; i <= endLine; i++) {
        //             const line = document.lineAt(i);
        //             editBuilder.replace(line.range, line.text.replace(/^(\s*)\/\/\s?/, '$1'));
        //         }
        //     })
        //     .then((success) => {
        //         if (success) {
        //             vscode.window.showInformationMessage('Block uncommented successfully!');
        //         } else {
        //             vscode.window.showErrorMessage('Failed to uncomment the block');
        //         }
        //     });

        // editor
        //     .edit((editBuilder) => {
        //         // Remove the block comment start (`/**`) and end (`*/`) delimiters
        //         const startLineText = document.lineAt(startLine).text;
        //         const endLineText = document.lineAt(endLine).text;
        //         editBuilder.replace(
        //             document.lineAt(startLine).range,
        //             startLineText.replace('/**', ''),
        //         );
        //         editBuilder.replace(document.lineAt(endLine).range, endLineText.replace('*/', ''));

        //         // Uncomment each line within the block
        //         for (let i = startLine + 1; i < endLine; i++) {
        //             const line = document.lineAt(i);
        //             editBuilder.replace(line.range, line.text.replace(/^\s*\*\s?/, ''));
        //         }
        //     })
        //     .then((success) => {
        //         if (success) {
        //             vscode.window.showInformationMessage('Block uncommented successfully!');
        //         } else {
        //             vscode.window.showErrorMessage('Failed to uncomment the block');
        //         }
        //     });

        editor
            .edit((editBuilder) => {
                for (let i = startLine; i <= endLine; i++) {
                    const line = document.lineAt(i);
                    let newText = line.text;
                    if (i === startLine) {
                        // Start of the comment block
                        newText = newText.replace('{/*', '');
                    }
                    if (i === endLine) {
                        // End of the comment block
                        newText = newText.replace('*/}', '');
                    }
                    // For single-line comments, both replacements will happen in one line
                    editBuilder.replace(line.range, newText);
                }
            })
            .then((success) => {
                if (success) {
                    vscode.window.showInformationMessage(
                        'JSX comment block uncommented successfully!',
                    );
                } else {
                    vscode.window.showErrorMessage('Failed to uncomment JSX comment block');
                }
            });

        context.subscriptions.push(disposable);
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
