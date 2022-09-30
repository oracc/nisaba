import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vsctm from 'vscode-textmate';
import * as oniguruma from 'vscode-oniguruma';

/**
 * Utility to read a file as a promise
 */
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => error ? reject(error) : resolve(data));
    })
}

function test_grammar(grammar, input_file, expected_scopes) {
    const text = fs.readFileSync(input_file).toString().split(os.EOL)

    let ruleStack = vsctm.INITIAL;
    for (let i = 0; i < text.length; i++) {
        const line = text[i];
        const lineTokens = grammar.tokenizeLine(line, ruleStack);
        for (let j = 0; j < lineTokens.tokens.length; j++) {
            const token = lineTokens.tokens[j];
            assert.strictEqual(token.scopes[token.scopes.length-1], expected_scopes[i][j]);
        }
        ruleStack = lineTokens.ruleStack;
    }
}

const wasmBin = fs.readFileSync(path.join(__dirname, '../../../node_modules/vscode-oniguruma/release/onig.wasm')).buffer;
const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
    return {
        createOnigScanner(patterns) { return new oniguruma.OnigScanner(patterns); },
        createOnigString(s) { return new oniguruma.OnigString(s); }
    };
});

// Create a registry that can create a grammar from a scope name.
const registry = new vsctm.Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: (scopeName) => {
        if (scopeName === 'source.atf') {
            const grammar_path = path.join(__dirname, '../../../syntaxes/atf.tmLanguage.json')
            return readFile(grammar_path).then(data => vsctm.parseRawGrammar(data.toString(), grammar_path))
        } else if (scopeName === 'source.glo') {
            const grammar_path = path.join(__dirname, '../../../syntaxes/glo.tmLanguage.json')
            return readFile(grammar_path).then(data => vsctm.parseRawGrammar(data.toString(), grammar_path))
        }
        console.log(`Unknown scope name: ${scopeName}`);
        return null;
    }
});

suite('Grammar Test Suite', () => {
    test('ATF tokenization test', async () => {

        // Load the ATF grammar and any other grammars included by it async.
        const grammar = await registry.loadGrammar('source.atf');

        const input_file = path.join(__dirname, '../../../src/test/suite/input/grammar_example.atf')
        // List of expected scopes in the input file, line by line
        const expected_scopes = [
            ['keyword.other.ampersand.atf'],
            ['support.class.hash.atf', 'source.atf'],
            ['support.class.hash.atf', 'source.atf'],
            ['support.class.hash.atf', 'source.atf'],
            ['support.class.hash.atf', 'source.atf'],
            ['keyword.control.at.atf'],
            ['keyword.control.at.atf'],
            ['variable.language.text.atf', 'source.atf'],
            ['support.class.hash.atf', 'source.atf'],
            ['keyword.control.at.atf', 'source.atf'],
            ['keyword.control.at.atf'],
            ['source.atf'],
            ['variable.language.text.atf', 'source.atf'],
            // Trailing newline character
            ['source.atf']
        ]

        test_grammar(grammar, input_file, expected_scopes);
    });
    test('Glossaries tokenization test', async () => {

        // Load the ATF grammar and any other grammars included by it async.
        const grammar = await registry.loadGrammar('source.glo');

        const input_file = path.join(__dirname, '../../../src/test/suite/input/grammar_example.glo')
        // List of expected scopes in the input file, line by line
        const expected_scopes = [
            ['support.class.at.glo', 'source.glo'], // Project
            ['support.class.at.glo', 'source.glo'], // Lang
            ['support.class.at.glo', 'source.glo'], // Name
            ['source.glo'],
            ['support.class.at.glo', 'source.glo'], // Proplist
            ['source.glo'],
            ['keyword.other.entry.glo', 'source.glo'], // a [the sign A₂] N
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.other.entry.glo', 'source.glo'],
            ['source.glo'],
            ['support.class.at.glo', 'source.glo'], // Letter A
            ['source.glo'],
            ['keyword.other.entry.glo', 'source.glo'], // Entry abahšinnu [stalk] N
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.other.entry.glo', 'source.glo'],
            ['source.glo'],
            ['support.class.at.glo', 'source.glo'], // Letter M
            ['source.glo'],
            ['keyword.other.entry.glo', 'source.glo'], // Entry maš [goat] N
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.other.entry.glo', 'source.glo'],
            ['source.glo'],
            ['keyword.other.entry.glo', 'source.glo'], // Entry maš [interest] N
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.control.at.glo', 'source.glo'],
            ['keyword.other.entry.glo', 'source.glo'],
            ['source.glo'],
            ['source.glo'], // Trailing newline character
        ]

        test_grammar(grammar, input_file, expected_scopes);

    });
});
