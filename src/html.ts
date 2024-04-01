import * as vscode from 'vscode';

export async function handleHtmlComments(editor: vscode.TextEditor, position: vscode.Position) {
    const document = editor.document;

    let startLine = position.line;
    let endLine = position.line;

    while (startLine >= 0 && !document.lineAt(startLine).text.includes('<!--')) {
        startLine--;
    }

    while (endLine < document.lineCount && !document.lineAt(endLine).text.includes('-->')) {
        endLine++;
    }

    try {
        const success = await editor.edit((editBuilder) => {
            // Remove `<!--` from the start line and `-->` from the end line
            const startReplacement = document.lineAt(startLine).text.replace(/<!--\s*/, '');
            const endReplacement = document.lineAt(endLine).text.replace(/\s*-->/, '');

            // Replace the lines with the updated text
            editBuilder.replace(document.lineAt(startLine).range, startReplacement);
            editBuilder.replace(document.lineAt(endLine).range, endReplacement);

            // Uncomment each line within the block
            for (let i = startLine + 1; i < endLine; i++) {
                const line = document.lineAt(i);
                editBuilder.replace(line.range, line.text);
            }
        });

        if (success) {
            vscode.window.showInformationMessage('HTML block uncommented successfully!');
        } else {
            vscode.window.showErrorMessage('Failed to uncomment the HTML block');
        }
    } catch (error) {
        console.error(error);
    }
}

export default async function uncommentHtmlBlock(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    await handleHtmlComments(editor, position);
}
