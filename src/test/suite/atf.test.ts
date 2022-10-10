import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getProjectCode } from '../../atf_model';

suite('ATF Model Test Suite', () => {
    vscode.window.showInformationMessage('Start ATF tests.');

    [["belsunu.atf", "cams/gkab"], ["AD6_164.atf", "adsd/adart6"], ["na-archival.atf", "cams/gkab"]]
        .forEach(function ([fileName, projectCode]) {
            test(`Extract project code correctly for ${fileName}`, async() => {
                const text = fs.readFileSync(
                    path.join(__dirname,
                              `../../../src/test/suite/input/${fileName}`)).toString();
                assert.strictEqual(getProjectCode(text), projectCode);
            });
        });

    [["two_projects.atf", 2], ["no_project.atf", 0]]
        .forEach(function ([fileName, numCodes]) {
            test(`Getting project fails when ${numCodes} codes present`, async() => {
                const text = fs.readFileSync(
                    path.join(__dirname,
                              `../../../src/test/suite/input/${fileName}`)).toString();
                assert.throws(() => getProjectCode(text));
            });
        });

});
