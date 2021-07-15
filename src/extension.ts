import { validate } from './server/messages';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as nisabaLogger from './logger';
import { PreviewPanel } from './preview';

// Logging output channel
const nisabaOutputChannel = vscode.window.createOutputChannel("Nisaba");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    nisabaLogger.initLogging(nisabaOutputChannel);

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
        // The code you place here will be executed every time your command is 
        const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
        const fileProject = "cams/gkab";
        const fileContent = vscode.window.activeTextEditor.document.getText();
        // The validate function is currently not mapped to the appropriate logging functions
        validate(filePath,fileProject,fileContent);
        });

    context.subscriptions.push(disposable2);

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
