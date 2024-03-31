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
            // Get the common leading whitespace before the block comment starts
            const startLineText = document.lineAt(startLine).text;
            const leadingWhitespace = startLineText.match(/^\s*/)?.[0] || '';

            // Remove the block comment start (`<!--`) and end (`-->`) delimiters
            const startLineTextTrimmed = startLineText.replace(/^\s*<!--\s*/, '');
            const endLineTextTrimmed = document.lineAt(endLine).text.replace(/\s*-->\s*$/, '');

            // Adjust indentation for each line within the block
            for (let i = startLine + 1; i < endLine; i++) {
                const line = document.lineAt(i);
                const lineText = line.text.trim();
                const adjustedLineText = leadingWhitespace + lineText;

                editBuilder.replace(line.range, adjustedLineText);
            }

            // Handle the start and end lines separately
            editBuilder.replace(
                document.lineAt(startLine).range,
                startLineTextTrimmed.startsWith(leadingWhitespace)
                    ? startLineTextTrimmed.slice(leadingWhitespace.length)
                    : startLineTextTrimmed,
            );
            editBuilder.replace(
                document.lineAt(endLine).range,
                endLineTextTrimmed.startsWith(leadingWhitespace)
                    ? endLineTextTrimmed.slice(leadingWhitespace.length)
                    : endLineTextTrimmed,
            );
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
