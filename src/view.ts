import * as vscode from 'vscode';
import * as nisabaLogger from './logger'
import { ServerResult } from './client/server_result';


// How we want to style the lines containing validation errors
let lineErrorStyle: vscode.TextEditorDecorationType;

/**
 * Do any display-related setup we need for the extension.
 */
export function initView(): void {
    lineErrorStyle = vscode.window.createTextEditorDecorationType({
        textDecoration: "underline red wavy"
    });
}

/**
 * Displays the results of a validation or lemmatisation operation in the GUI.
 *
 * @param result -- a ServerResult returned by e.g. `validate`
 */
 export function handleResult(result: ServerResult): void {
    // Show a popup with the status of the result
    if (result.contains_errors()) {
        vscode.window.showErrorMessage(
            'Validation identified errors. See log for details.');
    } else {
        vscode.window.showInformationMessage('Validation successful.');
    }
    // Show the log in the console and the log file
    nisabaLogger.info(result.get_user_log());
    // Highlight the lines with errors, after clearing any existing highlights
    const editor = vscode.window.activeTextEditor;
    editor.setDecorations(lineErrorStyle, []);
    if (result.contains_errors()) {
        // We create an array of DecorationOptions, each of them specifying
        // a single line (as a Range) and a message to be displayed on hover
        const highlightOptions: vscode.DecorationOptions[] = [];
        for (const [line, error] of Object.entries(result.validation_errors)) {
            const line_num = Number(line) - 1;  // lines in API start from 0
            highlightOptions.push({
                range: editor.document.lineAt(line_num).range,
                hoverMessage: new vscode.MarkdownString(error)
            });
        }
        // is this better?
        /*
        const highlightOptions = Object.entries(result.validation_errors).map(
            ([line_number, error]) => ({
                // line numbers in the editor API start from 0
                range: editor.document.lineAt(Number(line_number) - 1).range,
                hoverMessage: new vscode.MarkdownString(error)
            })
        )
        */
        editor.setDecorations(lineErrorStyle, highlightOptions);
    }

}
