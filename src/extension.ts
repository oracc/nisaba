import { validate } from './server/messages';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';
import * as nisabaLogger from './logger';

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
            CatCodingPanel.createOrShow(context.extensionUri);
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}



class CatCodingPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: CatCodingPanel | undefined;

    public static readonly viewType = 'catCoding';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (CatCodingPanel.currentPanel) {
            CatCodingPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            CatCodingPanel.viewType,
            'Cat Coding',
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            () => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        CatCodingPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._updateForCat(webview);
    }

    private _updateForCat(webview: vscode.Webview) {
        this._panel.title = "Oracc Preview";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const lines = vscode.window.activeTextEditor.document.getText().split(os.EOL);
        var arabic = false;
        for (let i = 0; i < lines.length; i++) {
            // `dir` tag: by default we assume left-to-right
            var dir = "dir=\"ltr\"";
            if (lines[i].match(/^@translation .* ar/)) {
                // We start an Arabic translation
                arabic = true;
            }
            if (arabic && lines[i].match(/^\d+\..*/)) {
                // We're inside Arabic translation and this is a text line: set
                // `dir` to right-to-left.
                dir = "dir=\"rtl\"";
            }
            lines[i] = lines[i].replace(/^(.*)$/, `<p ${dir}>$1</p>`);
        }
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">

<!--
Use a content security policy to only allow loading images from https or from our extension directory,
and only allow scripts that have a specific nonce.
-->
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:;">

<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cat Coding</title>
</head>
<body>
${lines.join(os.EOL)}
</body>
</html>`;
    }
}
