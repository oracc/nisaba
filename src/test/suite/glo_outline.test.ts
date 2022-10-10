import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { glossaryGetSymbols, EntryKind, LetterKind, LetterNoLetter } from '../../glo_outline';

suite('Outline Test Suite', () => {
    test('Glossary outline', () => {
        const input_file = path.join(__dirname, '../../../src/test/suite/input/grammar_example.glo');
        const text = fs.readFileSync(input_file).toString();

        // Obtain the list of symbols with our function
        const symbols = glossaryGetSymbols(text);

        // Create the expected list of symbols
        const expected_symbols: vscode.DocumentSymbol[] = [];
        const noLetter = new vscode.DocumentSymbol(
            LetterNoLetter.letter, '', LetterKind,
            new vscode.Range(0, 0, 10,  0),
            new vscode.Range(0, 8,  0, 19),
        );
        noLetter.children.push(
            new vscode.DocumentSymbol(
                'a [the sign A₂] N', LetterNoLetter.letter, EntryKind,
                new vscode.Range(6, 0, 9, 10),
                new vscode.Range(6, 7, 6, 24),
            )
        );
        expected_symbols.push(noLetter);
        const letter_A = new vscode.DocumentSymbol(
            'A', '', LetterKind,
            new vscode.Range(11, 0, 21, 0),
            new vscode.Range(11, 8, 11, 9),
        );
        letter_A.children.push(
            new vscode.DocumentSymbol(
                'abahšinnu [stalk] N', 'A', EntryKind,
                new vscode.Range(13, 0, 20, 10),
                new vscode.Range(13, 7, 13, 26),
            )
        );
        expected_symbols.push(letter_A);
        const letter_M = new vscode.DocumentSymbol(
            'M', '', LetterKind,
            new vscode.Range(22, 0, 37, 0),
            new vscode.Range(22, 8, 22, 9),
        );
        letter_M.children.push(
            new vscode.DocumentSymbol(
                'maš [goat] N', 'M', EntryKind,
                new vscode.Range(24, 0, 29, 10),
                new vscode.Range(24, 7, 24, 19),
            )
        );
        letter_M.children.push(
            new vscode.DocumentSymbol(
                'maš [interest] N', 'M', EntryKind,
                new vscode.Range(31, 0, 36, 10),
                new vscode.Range(31, 7, 31, 23),
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
