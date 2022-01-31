import * as vscode from 'vscode';
import * as nisabaLogger from './logger.js'
import { ServerResult } from './client/server_result.js';


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
 * @param editor -- the TextEditor in which to display the errors
 */
export function handleResult(result: ServerResult, editor: vscode.TextEditor): void {
    const process = result.contains_lemmata() ? "Lemmatisation" : "Validation"
    if (result.contains_errors()) {
        // Show a popup with the status of the result
        vscode.window.showErrorMessage(
            `${process} identified errors. See log for details.`);
        // Highlight the lines with errors
        // We create an array of DecorationOptions, each of them specifying
        // a single line (as a Range) and a message to be displayed on hover
        const highlightOptions = Object.entries(result.validation_errors).map(
            ([line_number, error]) => ({
                // line numbers in the editor API start from 0
                range: editor.document.lineAt(Number(line_number) - 1).range,
                hoverMessage: new vscode.MarkdownString(error)
            })
        )
        // Any old highlights will be cleared before the new ones are applied
        editor.setDecorations(lineErrorStyle, highlightOptions);
    } else {
        // Show a success popup and clear all highlights
        vscode.window.showInformationMessage(`${process} successful.`);
        editor.setDecorations(lineErrorStyle, []);
    }
    // Show the log in the console and the log file
    nisabaLogger.info(result.get_user_log(editor.document.fileName));

    // If lemmatising, update the contents of the entire editor with the result
    if (result.contains_lemmata()) {
        // Create a range that covers the whole document. There doesn't seem to be
        // an API method. This looks more robust instead of using the text length.
        const wholeRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.lineAt(editor.document.lineCount - 1).range.end)
        editor.edit( editBuilder => {
            editBuilder.replace(wholeRange, result.atf_content);
        })
    }
}
