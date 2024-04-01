import * as vscode from 'vscode';

import handleJSXComments from './jsx';

export async function handleSlashSlashComments(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    const document = editor.document;

    let startLine = position.line;
    let endLine = position.line;
    const totalLines = document.lineCount;

    while (startLine >= 0 && document.lineAt(startLine).text.trim().startsWith('//')) {
        startLine--;
    }
    startLine++;

    while (endLine < totalLines && document.lineAt(endLine).text.trim().startsWith('//')) {
        endLine++;
    }
    endLine--;

    try {
        const success = await editor.edit((editBuilder) => {
            for (let i = startLine; i <= endLine; i++) {
                const line = document.lineAt(i);
                editBuilder.replace(line.range, line.text.replace(/^(\s*)\/\/\s?/, '$1'));
            }
        });

        if (success) {
            console.log('Success');
        } else {
            vscode.window.showErrorMessage('Failed to uncomment the block');
        }
    } catch (error) {
        console.error(error);
    }
}

export async function handleSlashStarComments(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    const document = editor.document;

    let startLine = position.line;
    let endLine = position.line;

    while (startLine >= 0 && !document.lineAt(startLine).text.includes('/**')) {
        startLine--;
    }

    while (endLine < document.lineCount && !document.lineAt(endLine).text.includes('*/')) {
        endLine++;
    }

    try {
        const success = await editor.edit((editBuilder) => {
            // Remove the block comment start (`/**`) and end (`*/`) delimiters
            const startLineText = document.lineAt(startLine).text;
            const endLineText = document.lineAt(endLine).text;
            editBuilder.replace(document.lineAt(startLine).range, startLineText.replace('/**', ''));
            editBuilder.replace(document.lineAt(endLine).range, endLineText.replace('*/', ''));

            // Uncomment each line within the block
            for (let i = startLine + 1; i < endLine; i++) {
                const line = document.lineAt(i);
                editBuilder.replace(line.range, line.text.replace(/^\s*\*\s?/, ''));
            }
        });

        if (success) {
            console.log('Success');
        } else {
            vscode.window.showErrorMessage('Failed to uncomment the block');
        }
    } catch (error) {
        console.error(error);
    }
}

export default async function uncommentJavaScriptBlock(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    await handleSlashSlashComments(editor, position);
    await handleSlashStarComments(editor, position);
    await handleJSXComments(editor, position);
}
