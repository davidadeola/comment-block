import * as vscode from 'vscode';

async function handleDocStringComments(editor: vscode.TextEditor, position: vscode.Position) {
    const document = editor.document;

    let startLine = position.line;
    let endLine = position.line;

    while (startLine >= 0 && !document.lineAt(startLine).text.includes('"""')) {
        startLine--;
    }

    while (endLine < document.lineCount && !document.lineAt(endLine).text.includes('"""')) {
        endLine++;
    }

    try {
        const success = await editor.edit((editBuilder) => {
            const startLineText = document.lineAt(startLine).text;
            const endLineText = document.lineAt(endLine).text;

            // Handle the scenario where the start and end are on the same line
            if (startLine === endLine) {
                // eslint-disable-next-line unicorn/prefer-string-replace-all
                const newText = startLineText.replace(/"""/g, '');
                editBuilder.replace(document.lineAt(startLine).range, newText);
            } else {
                // Remove the start of the block comment
                const newTextStart = startLineText.replace(/"""/, '');
                editBuilder.replace(document.lineAt(startLine).range, newTextStart);

                // Remove the end of the block comment
                const newTextEnd = endLineText.replace(/"""/, '');
                editBuilder.replace(document.lineAt(endLine).range, newTextEnd);
            }
        });
        if (success) {
            vscode.window.showInformationMessage('Python block comment uncommented successfully!');
        } else {
            vscode.window.showErrorMessage('Failed to uncomment Python block comment');
        }
    } catch (error) {
        console.error(error);
    }
}

async function handlePoundComments(editor: vscode.TextEditor, position: vscode.Position) {
    const document = editor.document;

    let startLine = position.line;
    let endLine = position.line;

    while (startLine >= 0 && document.lineAt(startLine).text.trim().startsWith('#')) {
        startLine--;
    }
    startLine++; // Adjust because the loop exits one line before the actual start.

    while (endLine < document.lineCount && document.lineAt(endLine).text.trim().startsWith('#')) {
        endLine++;
    }
    endLine--; // Adjust because the loop exits one line after the actual end.

    try {
        const success = await editor.edit((editBuilder) => {
            for (let i = startLine; i <= endLine; i++) {
                const line = document.lineAt(i);
                // Replace the '#' at the start of the line with an empty string, trimming any whitespace immediately after the '#'
                const newText = line.text.replace(/^\s*#\s?/, '');
                editBuilder.replace(line.range, newText);
            }
        });
        if (success) {
            vscode.window.showInformationMessage('Python line comments uncommented successfully!');
        } else {
            vscode.window.showErrorMessage('Failed to uncomment Python line comments');
        }
    } catch (error) {
        console.error(error);
    }
}

export default async function uncommentPythonBlock(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    await handlePoundComments(editor, position);
    await handleDocStringComments(editor, position);
}
