import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { check, lemmatise } from '../../server/messages';


suite('Lemmatisation Test Suite', () => {
    vscode.window.showInformationMessage('Start lemmatisation tests.');

    suiteSetup(function (done) {
        // Wait for the server to become responsive before continuing
        this.timeout(8000);
        check().then(done);
    });

    for (const [file, project] of [['english', 'ztcc'], ['arabic', 'cams/gkab']]) {
        test(`Lemmatisation results for ${file}_no_lem.atf`, async () => {
            const text = fs.readFileSync(
                path.join(__dirname,
                          `../../../src/test/suite/input/${file}_no_lem.atf`)).toString();
            const server_result = await lemmatise(`${file}_no_lem.atf`, project, text);
            const lemmatised_text = fs.readFileSync(
                path.join(__dirname,
                          `../../../src/test/suite/reference/${file}_with_lem.atf`)).toString().replace(/\r\n/g, '\n');

            assert(!server_result.contains_errors());
            assert.strictEqual(server_result.atf_content, lemmatised_text);
        });
    }

    for (const [file, project] of [['english', 'ztcc'], ['arabic', 'cams/gkab']]) {
        test(`Lemmatisation results for ${file}_with_lem.atf`, async () => {
            const text = fs.readFileSync(
                path.join(__dirname,
                          `../../../src/test/suite/reference/${file}_with_lem.atf`)).toString().replace(/\r\n/g, '\n');
            const server_result = await lemmatise(`${file}_with_lem.atf`, project, text);

            assert(!server_result.contains_errors());
            assert.strictEqual(text, server_result.atf_content);
        });
    }

    test('Lemmatisation results when there are errors', async () => {
        const text = fs.readFileSync(
            path.join(__dirname,
                      '../../../src/test/suite/input/english_broken.atf')).toString();
        const server_result = await lemmatise('english_broken.atf', 'ztcc', text);

        assert(server_result.contains_errors());
    });
});
