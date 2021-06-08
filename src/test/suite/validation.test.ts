import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { validate } from '../../server/messages';
import { ServerResult } from '../../client/server_result';
import { SOAPClient } from '../../client/SOAP_client';


suite('Validation Test Suite', () => {
    vscode.window.showInformationMessage('Start validation tests.');

    test('Server results test for error_belsunu.atf', async() => {
        //TODO Do we need the href html labels to make these errors clickable?
        const expected_user_log = fs.readFileSync(path.join(
          __dirname,'../../../src/test/suite/reference/user_log_error.log'),
          'utf-8').trim(); // trim to avoid editor adding \n
        const expected_val_errors = {
            '0': 'ATF processor ox issued 2 warnings and 0 notices',
            '6': 'unknown block token: tableta',
            '44': 'o 4: translation uses undefined label'
        };

        // TODO Replace this with the actual content of the oracc log that
        // comes from the server - check in Nammu
        const oracc_log = fs.readFileSync(
          path.join(__dirname,
                    '../../../src/test/suite/input/error_oracc.log'),
          'utf-8');
        const server_result = new ServerResult(oracc_log);

        // There's no sensible way to compare dictionaries, JSON.stringify
        // seemed the most straight forward
        assert(JSON.stringify(server_result.user_log) == JSON.stringify(expected_user_log));
        assert(JSON.stringify(server_result.validation_errors) === JSON.stringify(expected_val_errors));
    });

    test('Server results test for belsunu.atf', async() => {
        //TODO Do we need the href html labels to make these errors clickable?
        const expected_user_log = fs.readFileSync(
          path.join(__dirname,
                    '../../../src/test/suite/reference/user_log_no_errors.log'),
          'utf-8').trim(); // trim to avoid editor adding \n
        const expected_val_errors = {};

        // TODO Replace this with the actual content of the oracc log that comes from the server - check in Nammu
        const oracc_log = fs.readFileSync(
          path.join(__dirname,
                    '../../../src/test/suite/input/oracc_no_errors.log'),
          'utf-8');
        const server_result = new ServerResult(oracc_log, ""); //We don't care about request.log for now

        console.log("server_result.user_log:");
        console.log(JSON.stringify(server_result.user_log));
        console.log("expected_user_log:");
        console.log(JSON.stringify(expected_user_log));

        // There's no sensible way to compare dictionaries, JSON.stringify
        // seemed the most straight forward
        assert.equal(JSON.stringify(server_result.user_log), JSON.stringify(expected_user_log));
        assert(JSON.stringify(server_result.validation_errors) == JSON.stringify(expected_val_errors));
    });

    test('SOAP client constructor test', async () => {
        const belsunu = fs.readFileSync(path.join(__dirname,'../../../src/test/suite/input/belsunu.atf'), 'utf-8');
        const client = new SOAPClient("./input/belsunu.atf", belsunu);
        assert(client.atf_filename == "belsunu.atf");
        assert(client.atf_text == belsunu);
    });

    test('HTTP validate test', async () => {

        // Load salmple text to run Validation
        const belsunu_text = fs.readFileSync(path.join(__dirname,'../../../src/test/suite/reference/belsunu.atf'), 'utf-8');

        // Placeholder for testing ATF validation, at the moment it always
        // returns true
        assert(validate('belsunu.atf', 'cams/gkab', belsunu_text));

    });

    test('HTTP Request headers', async () => {

        // const reference_headers = {"connection":"close",
        //     "mime-version":"1.0",
        //     "content-type":"multipart/related; charset=\"utf-8\"; type=\"application/xop+xml\"; start=\"<SOAP-ENV:Envelope>\"; start-info=\"application/soap+xml\"; boundary=\"9y71P6cm\"",
        //     "host":"build-oracc.museum.upenn.edu:8085",
        //     "content-length":5664}

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
