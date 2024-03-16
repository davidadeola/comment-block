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
        while (startLine > 0 && isCommentLine(document.lineAt(startLine).text)) {
            startLine--;
        }

        // Find the end of the block
        while (endLine < document.lineCount - 1 && isCommentLine(document.lineAt(endLine).text)) {
            endLine++;
        }

        // Comment style used in the code
        // const commentStyle = getCommentStyle(document.lineAt(startLine).text);

        // uncomment the entire block
        vscode.window.activeTextEditor?.edit((editBuilder) => {
            for (let line = startLine; line <= endLine; line++) {
                const text = document.lineAt(line).text.trim();
                if (isCommentLine(text)) {
                    let uncommentedText = text;
                    if (text.startsWith('//')) {
                        uncommentedText = text.replace(/^\s*\/\/\s?/, ''); // Remove '//' from the beginning of the line
                    } else if (text.startsWith('/*')) {
                        uncommentedText = text.replace(/^\s*\/\*\*?\s?/, ''); // Remove '/*' or '/**' from the beginning of the line
                        uncommentedText = uncommentedText.replace(/\*+\/\s*$/, ''); // Remove '*/' from the end of the line
                    } else if (text.startsWith('*')) {
                        uncommentedText = text.replace(/^\s*\*\s?/, ''); // Remove '*' from the beginning of the line
                    } else if (text.startsWith('{/*')) {
                        uncommentedText = text.replace(/^\s*\{\/\*\s?/, ''); // Remove '{/*' from the beginning
                        uncommentedText = uncommentedText.replace(/\s*\*\/\}$/, ''); // Remove '*/}' from the end
                        uncommentedText = uncommentedText.replace(/\s*\/\/\s?/, ''); // Remove trailing '//' if present
                    }
                    // Remove trailing slash '/' if present
                    uncommentedText = uncommentedText.replace(/\s*\/\}?$/, '');
                    editBuilder.replace(document.lineAt(line).range, uncommentedText);
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

function isCommentLine(line: string): boolean {
    return (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.trim().startsWith("'") ||
        line.trim().startsWith('{/*') // Check for JSX block comments
    );
}
// This method is called when your extension is deactivated
export function deactivate() {}
