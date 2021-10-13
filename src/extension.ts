import { basename } from 'path';

import { validate } from './server/messages';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as nisabaLogger from './logger';
import { handleResult, initView } from './view';
import { PreviewPanel } from './preview';
import { getProjectCode } from './atf_model';

// Logging output channel
const nisabaOutputChannel = vscode.window.createOutputChannel("Nisaba");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    nisabaLogger.initLogging(nisabaOutputChannel);
    initView();

    const disposable2 = vscode.commands.registerCommand('ucl-rsdg.validateAtf', async () => {
        const editor = vscode.window.activeTextEditor;
        const fileName = basename(editor.document.uri.fsPath);
        const fileContent = editor.document.getText();
        let fileProject: string;
        try {
            fileProject = getProjectCode(fileContent);
        } catch (err) {
            vscode.window.showErrorMessage(`Could not validate: ${err}`);
            return;
        }
        // The validate function is currently not mapped to the appropriate logging functions
        const result = await validate(fileName,fileProject,fileContent);
        handleResult(result, editor);
        });

    context.subscriptions.push(disposable2);

    const disposable3 = vscode.commands.registerCommand('ucl-rsdg.aboutNisaba', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        const test1 = 'This is a test message!';
        vscode.window.showWarningMessage(test1);
        nisabaLogger.warn(test1);
    });

    context.subscriptions.push(disposable3);

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.arabicPreview', () => {
            PreviewPanel.createOrShow(context.extensionUri);
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
    nisabaLogger.stopLogging();
}
