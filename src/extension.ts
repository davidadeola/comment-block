/* eslint-disable regexp/no-super-linear-backtracking */
// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('comment-block.uncomment', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const { document, selection } = editor;
        const cursorPosition = selection.active;

        // Find the beginning and end of the comment block
        const { startLine, endLine } = findCommentBlockBounds(document, cursorPosition);

        // Uncomment the entire block
        await editor.edit((editBuilder) => {
            for (let line = startLine; line <= endLine; line++) {
                const text = document.lineAt(line).text;
                const uncommentedText = uncommentLine(text);
                editBuilder.replace(document.lineAt(line).range, uncommentedText);
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
        line.trim().startsWith('*') || // Handles single line comments within a block comment (e.g., JSX)
        line.trim().startsWith('{/*') || // JSX block comments
        line.trim().endsWith('*/}') // JSX block comments
    );
}

function uncommentLine(line: string): string {
    let uncommentedText = line;

    // Handle different comment styles
    if (line.startsWith('//')) {
        uncommentedText = line.replace(/^\s*\/\/\s?/, ''); // Remove '//' from the beginning of the line
    } else if (line.startsWith('/*')) {
        uncommentedText = uncommentedText.replace(/^\s*\/\*\*?\s?/, ''); // Remove '/*' or '/**' from the beginning of the line
        uncommentedText = uncommentedText.replace(/\*+\/\s*$/, ''); // Remove '*/' from the end of the line
    } else if (line.startsWith('*')) {
        uncommentedText = line.replace(/^\s*\*\s?/, ''); // Remove '*' from the beginning of the line within a block comment
    } else if (line.trim().startsWith('{/*')) {
        // Regular expression to match the entire block comment including its contents
        const commentRegex = /^\s*\{\/\*\s*(.*?)\s*\*+\/\s*\}$/;

        // Use the regular expression to replace the entire block comment with its contents
        uncommentedText = uncommentedText.replace(commentRegex, '$1');
    } else if (line.trim().endsWith('*/}')) {
        // Regular expression to match the entire block comment including its contents
        const commentRegex = /^\s*(.*?)\s*\*+\/\s*\}$/;

        // Use the regular expression to replace the entire block comment with its contents
        uncommentedText = uncommentedText.replace(commentRegex, '$1');
    }

    return uncommentedText;
}

// This method is called when your extension is deactivated
export function deactivate() {}
