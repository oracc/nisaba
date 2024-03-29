import * as path from 'path';

import { lemmatise, ServerFunction, validate } from './server/messages';

import * as vscode from 'vscode';
import * as nisabaLogger from './logger';
import { handleResult, initView } from './view';
import { PreviewPanel } from './preview';
import { getProjectCode } from './atf_model';
import { GlossaryDocumentSymbolProvider } from './glo_outline';
import { run_oracc } from './oracc_cmd';

// Logging output channel
const nisabaOutputChannel = vscode.window.createOutputChannel("Nisaba");
// Document selector for glossary (`*.glo`) files
const glossaryDocumentSelector: vscode.DocumentSelector = { language: 'glo' };

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    nisabaLogger.initLogging(nisabaOutputChannel);
    initView();

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.validateAtf', () => {
            workWithServer("validate", validate);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.oraccCheckGloss', () => {
            run_oracc(['check', 'gloss']);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.oraccCheckTexts', () => {
            run_oracc(['check', 'texts']);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.oraccMerge', () => {
            const editor = vscode.window.activeTextEditor;
            // Get the "language" argument for `oracc merge` from the base name
            // of the current glossary file.
            const language = path.parse(editor.document.fileName).name;
            // TODO: if there is a programmatic way to access the list of valid
            // languages in glossaries we could validate the language here.
            run_oracc(['merge', language]);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.oraccBuildCorpus', () => {
            run_oracc(['build', 'corpus']);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.oraccBuildClean', () => {
            run_oracc(['build', 'clean']);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.oraccHarvest', () => {
            run_oracc(['harvest']);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ucl-rsdg.aboutNisaba', () => {
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
        })
    );

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

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            glossaryDocumentSelector, new GlossaryDocumentSymbolProvider()
        )
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
    const fileName = path.basename(editor.document.fileName);
    const fileContent = editor.document.getText();
    let fileProject: string;
    // The server would not show errors when validating/lemmatising the file if
    // it doesn't have the `.atf` extension.  We could work around this
    // limitation, but not setting the extension correctly is likely an error
    // anyway, so we enforce it to when submitting tasks to the server.
    if (!fileName.endsWith(".atf")) {
        vscode.window.showErrorMessage(`The file should have .atf extension,
                                        but it is called "${fileName}".
                                        Please rename it.`);
        return;
    }
    try {
        nisabaLogger.debug(`Extracting project code for ${fileName}`);
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
