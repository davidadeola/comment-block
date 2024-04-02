import * as vscode from 'vscode';

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

    while (startLine >= 0 && !document.lineAt(startLine).text.includes('/*')) {
        startLine--;
    }

    while (endLine < document.lineCount && !document.lineAt(endLine).text.includes('*/')) {
        endLine++;
    }

    try {
        const success = await editor.edit((editBuilder) => {
            for (let i = startLine; i <= endLine; i++) {
                const line = document.lineAt(i);
                let newText = line.text;

                // Apply transformations only if the line is within the comment block
                if (i === startLine && i === endLine) {
                    // Handle single-line comment block
                    newText = newText.replace(/^\s*\/\*\s*/, '').replace(/\s*\*\/\s*$/, '');
                } else if (i === startLine) {
                    // Start of the comment block
                    newText = newText.replace(/^\s*\/\*\s*/, '');
                } else if (i === endLine) {
                    // End of the comment block
                    newText = newText.replace(/\s*\*\/\s*$/, '');
                } else {
                    // Middle lines of the comment block
                    // Remove leading whitespace followed by an asterisk, if present
                    newText = newText.replace(/^\s*\*\s*/, '');
                }
                newText = newText.replace(/^\s*\*\s*/, '');

                // Replace the line with the new text, ensuring no unnecessary whitespace
                editBuilder.replace(line.range, newText);
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

export default async function uncommentSlashBlock(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    await handleSlashSlashComments(editor, position);
    await handleSlashStarComments(editor, position);
}
