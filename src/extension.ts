// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('comment-block.uncomment', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const { document, selection } = editor;
        const cursorPosition = selection.active;

        // Find the beginning and end of the comment block
        const { startLine, endLine } = findCommentBlockBounds(document, cursorPosition);

        // Uncomment the entire block
        vscode.window.activeTextEditor?.edit((editBuilder) => {
            for (let line = startLine; line <= endLine; line++) {
                const text = document.lineAt(line).text.trim();
                if (isCommentLine(text)) {
                    const uncommentedText = uncommentLine(text);
                    editBuilder.replace(document.lineAt(line).range, uncommentedText);
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

function findCommentBlockBounds(
    document: vscode.TextDocument,
    cursorPosition: vscode.Position,
): { startLine: number; endLine: number } {
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

    return { startLine, endLine };
}

function isCommentLine(line: string): boolean {
    return (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.trim().startsWith('{/*') || // JSX block comments
        line.trim().startsWith('"""') // Python multiline comments
    );
}

function uncommentLine(line: string): string {
    let uncommentedText = line;
    if (line.startsWith('//')) {
        uncommentedText = line.replace(/^\s*\/\/\s?/, ''); // Remove '//' from the beginning of the line
    } else if (line.startsWith('/*')) {
        uncommentedText = line.replace(/^\s*\/\*\*?\s?/, ''); // Remove '/*' or '/**' from the beginning of the line
        uncommentedText = uncommentedText.replace(/\*+\/\s*$/, ''); // Remove '*/' from the end of the line
    } else if (line.startsWith('*')) {
        uncommentedText = line.replace(/^\s*\*\s?/, ''); // Remove '*' from the beginning of the line
    } else if (line.startsWith('{/*')) {
        uncommentedText = line.replace(/^\s*\{\/\*\s?/, ''); // Remove '{/*' from the beginning of the line
        uncommentedText = uncommentedText.replace(/\s*\*+\/\s*\}$/, ''); // Remove '*/}' from the end of the line
    } else if (line.startsWith('"""')) {
        uncommentedText = line.replace(/^\s*"""/, ''); // Remove '"""' from the beginning of the line
        uncommentedText = uncommentedText.replace(/"""\s*$/, ''); // Remove '"""' from the end of the line
    }
    // Remove trailing slash '/' if present
    uncommentedText = uncommentedText.replace(/\s*\/$/, '');
    return uncommentedText;
}

// This method is called when your extension is deactivated
export function deactivate() {}
