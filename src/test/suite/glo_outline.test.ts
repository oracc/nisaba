import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { glossaryGetSymbols, EntryKind, LetterKind } from '../../glo_outline';

suite('Outline Test Suite', () => {
    test('Glossary outline', () => {
        const input_file = path.join(__dirname, '../../../src/test/suite/input/grammar_example.glo');
        const text = fs.readFileSync(input_file).toString();

        // Obtain the list of symbols with our function
        const symbols = glossaryGetSymbols(text);

        // Create the expected list of symbols
        const expected_symbols: vscode.DocumentSymbol[] = [];
        const letter_A = new vscode.DocumentSymbol(
            'A', '', LetterKind,
            new vscode.Range(6, 0, 16, 0),
            new vscode.Range(6, 8,  6, 9),
        );
        letter_A.children.push(
            new vscode.DocumentSymbol(
                'abahšinnu [stalk] N', 'A', EntryKind,
                new vscode.Range(8, 0, 15, 10),
                new vscode.Range(8, 7,  8, 26),
            )
        );
        expected_symbols.push(letter_A);
        const letter_M = new vscode.DocumentSymbol(
            'M', '', LetterKind,
            new vscode.Range(17, 0, 32, 0),
            new vscode.Range(17, 8, 17, 9),
        );
        letter_M.children.push(
            new vscode.DocumentSymbol(
                'maš [goat] N', 'M', EntryKind,
                new vscode.Range(19, 0, 24, 10),
                new vscode.Range(19, 7, 19, 19),
            )
        );
        letter_M.children.push(
            new vscode.DocumentSymbol(
                'maš [interest] N', 'M', EntryKind,
                new vscode.Range(26, 0, 31, 10),
                new vscode.Range(26, 7, 26, 23),
            )
        );
        expected_symbols.push(letter_M);

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
