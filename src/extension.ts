// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';

import uncommentHtmlBlock from './html';
import uncommentSlashBlock from './javascript';
import uncommentJSXBlock from './jsx';
import uncommentPythonBlock from './python';
import uncommentRubyBlock from './ruby';
import uncommentVueBlock from './vue';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('comment-block.uncomment', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No open text editor');
            return;
        }

        const position = editor.selection.active;
        const document = editor.document;
        const languageId = document.languageId;

        // Determine the action based on the language ID
        switch (languageId) {
            case 'typescript':
            case 'java':
            case 'cpp':
            case 'rust':
            case 'php':
            case 'c':
            case 'csharp':
            case 'plaintext':
            case 'css':
            case 'scss':
            case 'sass':
            case 'dart':
            case 'go':
            case 'swift':
            case 'kotlin':
            case 'scala':
                uncommentSlashBlock(editor, position);
                break;
            case 'javascript':
            case 'typescriptreact':
            case 'javascriptreact':
                uncommentJSXBlock(editor, position);
                break;
            case 'python':
            case 'yaml':
                uncommentPythonBlock(editor, position);
                break;
            case 'ruby':
                uncommentRubyBlock(editor, position);
                break;
            case 'html':
            case 'ejs':
            case 'xml':
            case 'markdown':
                uncommentHtmlBlock(editor, position);
                break;
            case 'vue':
                uncommentVueBlock(editor, position);
                break;
            // Add more cases here for other languages
            default:
                vscode.window.showWarningMessage(`Uncommenting not supported for ${languageId}`);
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
