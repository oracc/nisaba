import * as vscode from 'vscode';
import * as os from 'os';

export class PreviewPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: PreviewPanel | undefined;

    public static readonly viewType = 'nisabaPreview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _document: vscode.TextDocument;

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (PreviewPanel.currentPanel) {
            PreviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            PreviewPanel.viewType,
            'Nisaba Preview',
            vscode.ViewColumn.Beside,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._document = vscode.window.activeTextEditor.document;
        this._update();

        // Update the webview based on text changes
        vscode.workspace.onDidChangeTextDocument(
            e => {
                if (e.document.uri.toString() === this._document.uri.toString()) {
                    this._update();
                }
            },
            null,
            this._disposables);


        // Update when the user switches to a new editor
        vscode.window.onDidChangeActiveTextEditor(
            e => { 
                this._document = e.document;
                this._update();
            },
            null,
            this._disposables);

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
        PreviewPanel.currentPanel = undefined;

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
        this._updateForPreview(webview);
    }

    private _updateForPreview(webview: vscode.Webview) {
        this._panel.title = "Oracc Preview";
        this._panel.webview.html = this._getHtmlForWebview(webview, this._document);
    }

    private _getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument) {
        // document can be undefined if the last active editor was closed
        const lines = document ? this._getBodyForWebview(document) : [];
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
<title>Nisaba Preview</title>
</head>
<body>
${lines.join(os.EOL)}
</body>
</html>`;
    }

    private _getBodyForWebview(document: vscode.TextDocument): string[] {
        let arabic = false;
        const lines = document.getText().split(os.EOL);
        for (let i = 0; i < lines.length; i++) {
            // `dir` tag: by default we assume left-to-right
            let dir = "dir=\"ltr\"";
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
        return lines
    }
}
