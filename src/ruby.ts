import * as vscode from 'vscode';

async function handleBeginEndComments(editor: vscode.TextEditor, position: vscode.Position) {
    const document = editor.document;

    let startLine = position.line;
    let endLine = position.line;

    while (startLine >= 0 && !document.lineAt(startLine).text.trim().startsWith('=begin')) {
        startLine--;
    }

    while (
        endLine < document.lineCount &&
        !document.lineAt(endLine).text.trim().startsWith('=end')
    ) {
        endLine++;
    }

    try {
        const success = await editor.edit((editBuilder) => {
            // Remove the '=begin' and '=end' lines entirely
            const rangeBegin = new vscode.Range(
                startLine,
                0,
                startLine,
                document.lineAt(startLine).text.length,
            );
            editBuilder.delete(rangeBegin);

            const rangeEnd = new vscode.Range(
                endLine,
                0,
                endLine,
                document.lineAt(endLine).text.length,
            );
            editBuilder.delete(rangeEnd);
        });
        if (success) {
            vscode.window.showInformationMessage(
                'Ruby multiline comments uncommented successfully!',
            );
        } else {
            vscode.window.showErrorMessage('Failed to uncomment Ruby multiline comments');
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

export default async function uncommentRubyBlock(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    await handleBeginEndComments(editor, position);
    await handlePoundComments(editor, position);
}
