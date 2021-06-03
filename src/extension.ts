// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getExtensionLogger } from '@vscode-logging/logger';

// Logging output channel
const nisabaOutputChannel = vscode.window.createOutputChannel("Nisaba");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Set up logging with `@vscode-logging/logger`
    const extLogger = getExtensionLogger({
        extName: "Nisaba",
        level: "info", // See LogLevel type in @vscode-logging/types for possible logLevels
        logPath: context.logPath, // The logPath is only available from the `vscode.ExtensionContext`
        logOutputChannel: nisabaOutputChannel, // OutputChannel for the logger
        sourceLocationTracking: false,
        logConsole: true // define if messages should be logged to the console
    });

    extLogger.info('Congratulations, your extension "ucl-rsdg" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('ucl-rsdg.helloWorld', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        const str = 'Hello VS Code from ucl-rsdg!';
        vscode.window.showWarningMessage(str);
        extLogger.info(str);
    });

    context.subscriptions.push(disposable);

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
&X001001 = JCS 48, 089
#project: cams/gkab
#atf: lang akk-x-stdbab
#atf: use unicode
#atf: use math
@tablet
@obverse

1.      [MU] 1.03-KAM {iti}AB GE₆ U₄ 2-KAM
#lem: šatti[year]N; n; Ṭebetu[1]MN; mūša[at night]AV; ūm[day]N; n

2.      [{m}]{d}60--EN-šu₂-nu a-lid
#lem: Anu-belšunu[1]PN; alid[born]AJ +.

$ ruling
# I've added various things for test purposes

3.      U₄!-BI? 20* [(ina)] 9.30 ina(DIŠ) MAŠ₂!(BAR)
#lem: ūmišu[day]N; Šamaš[1]DN; ina[in]PRP; n; +ina[in]PRP$; Suhurmašu[Goatfish]CN
#note: Note to line.

4.      <30> <(ina)> 12 GU U₄-ME-šu₂ GID₂-MEŠ{{ir-ri-ku}}
#lem: Sin[1]DN; ina[at]PRP; n; Gula[1]'CN; ūmūšu[day]N; +arāku[be(come) long]V$irrikū +.; irrikū[be(come) long]V

5.      BABBAR# ina SAG GIR₂.TAB ma-ma NUN qat₂-[su DAB]{+bat}
#lem: +Peṣu[White Star//Jupiter]CN'CN$; ina[in]PRP; rēš[head]N; Zuqaqipu[Scorpion]CN; +mamman[somebody]XP$mamma; rubâ[prince]N; +qātu[hand]N$qātsu; iṣabbat[seize]V +.

6.      [{lu₂}TUR] ina#? GU KI dele-bat a-lid DUMU#-MEŠ TUKU
#lem: šerru[(young) child]N; ina[in]PRP; Gula[1]'CN; itti[with]PRP; Delebat[Venus]CN; alid[born]AJ; mārī[son]N; irašši[acquire]V +.

7.      [GU₄].U₄ ina MAŠ₂ GENNA ina MIN<(MAŠ₂)>
#lem: Šihṭu[Mercury]CN; ina[in]PRP; Suhurmašu[Goatfish]CN +.; Kayyamanu[Saturn]CN; ina[in]PRP; Suhurmašu[Goatfish]CN

8.      [AN] ina ALLA <<ALLA>>
#lem: Ṣalbatanu[Mars]CN; ina[in]PRP; Alluttu[Crab]CN +.

9.    $BI x X |DU.DU| |GA₂×AN| |DU&DU| |LAGAB&LAGAB| DU@g GAN₂@t 4(BAN₂)@v
#lem: u; u; X; X; X; X; X; X; X; n

@reverse
$ reverse blank

@translation parallel ar project
@obverse

1. في شتة ٦٣ في شهر تبت، يوم ٢
2. Anu-belšunu ولد.
3. في هذا اليوم كين Šamaš في برج الجدي.
4. كان Sin في ١٢ Gula.  سكون ايامه طويلة.
5. النجم الابيض في راس برج ال عقرب.  سيستولى احد يد الامير.
6.  ولد الوليد في Gula مع Delebat. سيحذ اولاد.
7. زئبق في برج الجدي. زحل في برج الجدي.
8. المريخ في برج الشرتان.
</body>
</html>`;
    }
}
