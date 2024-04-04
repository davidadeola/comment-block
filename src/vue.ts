// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import * as vscode from 'vscode';

import { handleHtmlComments } from './html';
import { handleSlashSlashComments, handleSlashStarComments } from './javascript';

export default async function uncommentVueBlock(
    editor: vscode.TextEditor,
    position: vscode.Position,
) {
    await handleSlashSlashComments(editor, position);
    await handleSlashStarComments(editor, position);
    await handleHtmlComments(editor, position);
}
