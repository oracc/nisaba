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
    const fileName = basename(editor.document.uri.fsPath);
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

async function getSymbols(document: vscode.TextDocument): Promise<vscode.SymbolInformation[]> {
    const symbols: vscode.SymbolInformation[] = [];
    symbols.push(
        new vscode.SymbolInformation(
            "A", vscode.SymbolKind.Function, "",
            new vscode.Location(document.uri, new vscode.Range(4, 8, 4, 9))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "a [the sign A₂] N", vscode.SymbolKind.Variable, "A",
            new vscode.Location(document.uri, new vscode.Range(6, 7, 6, 24))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "abahšinnu [stalk] N", vscode.SymbolKind.Variable, "A",
            new vscode.Location(document.uri, new vscode.Range(11, 7, 11, 26))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "B", vscode.SymbolKind.Function, "",
            new vscode.Location(document.uri, new vscode.Range(1984, 8, 1984, 9))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "bāʾeru [hunter] N", vscode.SymbolKind.Variable, "B",
            new vscode.Location(document.uri, new vscode.Range(1986, 7, 1986, 24))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "bâʾu [go along] V", vscode.SymbolKind.Variable, "B",
            new vscode.Location(document.uri, new vscode.Range(1992, 7, 1992, 24))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "D", vscode.SymbolKind.Function, "",
            new vscode.Location(document.uri, new vscode.Range(2946, 8, 2946, 9))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "daʾāmu [wander about] V", vscode.SymbolKind.Variable, "D",
            new vscode.Location(document.uri, new vscode.Range(2948, 7, 2948, 30))
        )
    );
    symbols.push(
        new vscode.SymbolInformation(
            "daʾīmu [lance] N", vscode.SymbolKind.Variable, "D",
            new vscode.Location(document.uri, new vscode.Range(2956, 7, 2956, 23))
        )
    );
    return symbols;
}

class GlossaryDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public async provideDocumentSymbols(
        document: vscode.TextDocument, token: vscode.CancellationToken):
    Promise<vscode.SymbolInformation[]> {
        return await getSymbols(document);
    }
}
