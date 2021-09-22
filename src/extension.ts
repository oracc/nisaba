import { basename } from 'path';

import { lemmatise, ServerFunction, validate } from './server/messages';

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

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable1 = vscode.commands.registerCommand('ucl-rsdg.helloWorld', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        const str = 'Hello VS Code from ucl-rsdg!';
        vscode.window.showWarningMessage(str);
        nisabaLogger.warn(str);
    });

    context.subscriptions.push(disposable1);

    const disposable2 = vscode.commands.registerCommand('ucl-rsdg.validateAtf', () => {
        workWithServer("validate", validate);
        });

    context.subscriptions.push(disposable2);

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.lemmatiseAtf', () => {
            workWithServer("lemmatise", lemmatise)
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.arabicPreview', () => {
            PreviewPanel.createOrShow(context.extensionUri);
        })
    );
}

/**
 * Base function for performing server-related tasks with the editor contents.
 *  
 * Will first get some basic information from the editor (filename, project
 * code, text contents), then call another function to communicate with
 * the server, and finally display the results of that communication.
 *
 * @param verb a textual description of the action, for reporting purposes
 * @param callback the function to call after getting the editor information
 */
async function workWithServer(verb: string, callback: ServerFunction): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const fileName = basename(editor.document.uri.fsPath);
    const fileContent = editor.document.getText();
    let fileProject: string;
    try {
        fileProject = getProjectCode(fileContent);
    } catch (err) {
        vscode.window.showErrorMessage(`Could not ${verb}: ${err}`);
        return;
    }
    // The validate function is currently not mapped to the appropriate logging functions
    const result = await callback(fileName,fileProject,fileContent);
    handleResult(result, editor);
}

// this method is called when your extension is deactivated
export function deactivate() {
    nisabaLogger.stopLogging();
}
