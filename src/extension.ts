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

    const disposable2 = vscode.commands.registerCommand('ucl-rsdg.validateAtf', () => {
        workWithServer("validate", validate);
        });

    context.subscriptions.push(disposable2);

    const disposable3 = vscode.commands.registerCommand('ucl-rsdg.aboutNisaba', () => {
        vscode.window.showInformationMessage(
            'Nisaba is an editor for ATF files. Click below for more information and guidance.',
            // Also show a button with "More information..."
            "More information...")
            .then( (chosenAction) => {
                // if the user has clicked on the button, open a browser at our page
                if (chosenAction != undefined) {
                    vscode.env.openExternal(
                        vscode.Uri.parse("https://github.com/oracc/nisaba/blob/master/docs/user_guide.md")
                    )
                }
            })
    });

    context.subscriptions.push(disposable3);

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
    try {
        const result = await callback(fileName,fileProject,fileContent);
        handleResult(result, editor);
    } catch (err) {
        const errMsg = `An error has occurred:
        ${err}
        The log may contain more details.
        `;
        vscode.window.showErrorMessage(errMsg);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    nisabaLogger.stopLogging();
}
