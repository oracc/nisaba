import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getProjectCode } from '../../atf_model';

suite('ATF Model Test Suite', () => {
    vscode.window.showInformationMessage('Start ATF tests.');

    [["belsunu.atf", "cams/gkab"], ["AD6_164.atf", "adsd/adart6"]]
        .forEach(function ([fileName, projectCode]) {
            test(`Extract project code correctly for ${fileName}`, async() => {
                const text = fs.readFileSync(
                    path.join(__dirname,
                              `../../../src/test/suite/input/${fileName}`)).toString();
                assert.strictEqual(getProjectCode(text), projectCode);
            });
        })

});
