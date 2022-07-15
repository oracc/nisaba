import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { glossaryGetSymbols } from '../../glo_outline';

suite('Outline Test Suite', () => {
    test('Glossary outline', async () => {
        const input_file = path.join(__dirname, '../../../src/test/suite/input/grammar_example.glo');
        const text = fs.readFileSync(input_file).toString();

        // Obtain the list of symbols with our function
        const symbols = await glossaryGetSymbols(text);

        // Create the expected list of symbols
        const expected_symbols: vscode.DocumentSymbol[] = [];
        const letter_A = new vscode.DocumentSymbol(
            'A', '', vscode.SymbolKind.Function,
            new vscode.Range(6, 0, 30, 0),
            new vscode.Range(6, 8,  6, 9),
        );
        letter_A.children.push(
            new vscode.DocumentSymbol(
                'maš [goat] N', 'A', vscode.SymbolKind.Variable,
                new vscode.Range(8, 0, 13, 10),
                new vscode.Range(8, 7, 8,  19),
            )
        );
        letter_A.children.push(
            new vscode.DocumentSymbol(
                'maš [interest] N', 'A', vscode.SymbolKind.Variable,
                new vscode.Range(15, 0, 20, 10),
                new vscode.Range(15, 7, 15, 23),
            )
        );
        letter_A.children.push(
            new vscode.DocumentSymbol(
                'abahšinnu [stalk] N', 'A', vscode.SymbolKind.Variable,
                new vscode.Range(22, 0, 29, 10),
                new vscode.Range(22, 7, 22, 26),
            )
        );
        expected_symbols.push(letter_A);

        // Check the list of symbols matches the expectation
        for (let idx = 0; idx < symbols.length; idx++) {
            // We have to use `assert.deepStrictEqual` because with `assert.strictEqual` we
            // would get
            //
            //   AssertionError [ERR_ASSERTION]: Values have same structure but are not reference-equal
            //
            // See for example <https://stackoverflow.com/a/61638864/2442087>.
            assert.deepStrictEqual(symbols[idx], expected_symbols[idx]);
        }
    });
})
