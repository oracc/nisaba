/* eslint-disable */
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { validate } from '../../server/messages';
import { ServerResult} from '../../client/server_result';


suite('Validation Test Suite', () => {
    vscode.window.showInformationMessage('Start validation tests.');

    test('Server results test', async() => {

        assert(true);
    })

    test('HTTP validate test', async () => {

        // Load salmple text to run Validation
        const belsunu_text = fs.readFileSync(path.join(__dirname,'../../../src/test/suite/reference/belsunu.atf')).toString();

        // Placeholder for testing ATF validation, at the moment it always
        // returns true
        assert(validate('belsunu.atf', 'cams/gkab', belsunu_text));

    });

    test('HTTP Request headers', async () => {

        const reference_headers = {"connection":"close",
            "mime-version":"1.0",
            "content-type":"multipart/related; charset=\"utf-8\"; type=\"application/xop+xml\"; start=\"<SOAP-ENV:Envelope>\"; start-info=\"application/soap+xml\"; boundary=\"9y71P6cm\"",
            "host":"build-oracc.museum.upenn.edu:8085",
            "content-length":5664}

        // TODO get headers from validation's request object
        assert(true);

    });

    test('HTTP Request body', async () => {

        // TODO get request object from validation

        // // Load the a goal HTTP request file to compare with.
        // const goal_request = fs.readFileSync(path.join(__dirname,'../../../src/test/suite/soap_files/request_envelope.xml')).toString();

        // assert.strictEqual(goal_request, request);
        assert(true);

    });
});
