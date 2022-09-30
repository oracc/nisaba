import * as os from 'os';
import * as vscode from 'vscode';

export const LetterKind = vscode.SymbolKind.Function;
export const EntryKind = vscode.SymbolKind.Variable;
// Placeholder letter which is used to collect entries which aren't under a `@letter` tag.
export const LetterNoLetter = {letter: '(no letter)', line: 0};

export function glossaryGetSymbols(text: string): vscode.DocumentSymbol[] {
    const lines = text.split(os.EOL);
    const letters = [LetterNoLetter];
    const symbols: vscode.DocumentSymbol[] = [];
    for (let idx = 0; idx < lines.length; idx++) {
        const match = lines[idx].match(/^@letter (?<letter>[a-zA-Z]+)$/);
        if (match) {
            letters.push({letter: match.groups.letter, line: idx});
        }
    }
    for (let idx = 0; idx < letters.length; idx++) {
        // Determine the end line of the letter.  If this is the last letter,
        // the end of the letter is the end of the whole text.
        let letter_endline = lines.length - 1;
        if (idx < letters.length - 1) {
            letter_endline = letters[idx + 1].line - 1;
        }
        // Create the letter and add it to the list of symbols
        const letter = new vscode.DocumentSymbol(
            letters[idx].letter, '', LetterKind,
            new vscode.Range(letters[idx].line, 0, letter_endline, lines[letter_endline].length),
            // Magic number explanation: the line `@letter X` will have the `X` letter
            // starting at column 8.
            new vscode.Range(letters[idx].line, 8, letters[idx].line, 8+letters[idx].letter.length),
        );
        const children: vscode.DocumentSymbol[] = [];
        // Find entries within the letter
        for (let jdx = letters[idx].line; jdx <= letter_endline; jdx++) {
            const match_entry = lines[jdx].match(/^@entry (?<entry>.*)$/);
            if (match_entry) {
                // Find the end line of the entry by searching `@end entry` forward.  When
                // we're done, break out of the search and move on.
                let entry_endline = jdx;
                for (let kdx = jdx; kdx <= letter_endline; kdx++) {
                    if (lines[kdx].match(/^@end entry$/)) {
                        entry_endline = kdx;
                        break;
                    }
                }
                // Push entry to the parent letter.
                children.push(
                    new vscode.DocumentSymbol(
                        match_entry.groups.entry, letter.name, EntryKind,
                        // Magic numbers explanation:
                        // The line `@end entry` is 10-character wide.
                        // In the line `@entry ...`, the entry name starts at column 7.
                        new vscode.Range(jdx, 0, entry_endline, 10),
                        new vscode.Range(jdx, 7, jdx, lines[jdx].length),
                    )
                );
            }
        }
        // Don't add the letter if it is a "no letter" and it doesn't actually have children.
        if (letters[idx].letter != LetterNoLetter.letter || children.length != 0) {
            letter.children = children;
            symbols.push(letter);
        }
    }
    return symbols;
}

export class GlossaryDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument, token: vscode.CancellationToken):
    vscode.DocumentSymbol[] {
        if (token.isCancellationRequested) {
            return;
        }
        return glossaryGetSymbols(document.getText());
    }
}
