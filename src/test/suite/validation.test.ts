import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ServerResult } from '../../client/server_result';
import { SOAPClient } from '../../client/SOAP_client';
import { validate } from '../../server/messages';


suite('Validation Test Suite', () => {
    vscode.window.showInformationMessage('Start validation tests.');

    test('Server results test when errors exist', async() => {
        //TODO Do we need the href html labels to make these errors clickable?
        const expected_user_log = fs.readFileSync(path.join(
          __dirname,'../../../src/test/suite/reference/user_log_error.log'),
          'utf-8').trim(); // trim to avoid editor adding \n
        const expected_val_errors = {
           '6': 'unknown block token: tableta',
           '44': 'o 4: translation uses undefined label'
        };
        const expected_summary_line = "ATF processor ox issued 2 warnings and 0 notices";

        // Load sample oracc log that comes from server when using Nammu
        const oracc_log = fs.readFileSync(
          path.join(__dirname,
                    '../../../src/test/suite/input/error_oracc.log'),
          'utf-8');
        const server_result = new ServerResult(oracc_log);

        // NB: The server response will always have \n as line separators!
        assert.equal(server_result.get_user_log('/fake/path/error_belsunu.atf'), expected_user_log);
        // There's no sensible way to compare dictionaries, JSON.stringify
        // seemed the most straight forward
        assert.strictEqual(JSON.stringify(server_result.validation_errors),  JSON.stringify(expected_val_errors));
        assert.equal(server_result.summary_line, expected_summary_line);
        assert(server_result.contains_errors());
    });

    test('Server results test when no errors exist', async() => {
        //TODO Do we need the href html labels to make these errors clickable?
        const expected_user_log = fs.readFileSync(
          path.join(__dirname,
                    '../../../src/test/suite/reference/user_log_no_errors.log'),
          'utf-8').trim(); // trim to avoid editor adding \n
        const expected_val_errors = {};
        const expected_summary_line = "";

        // Load sample oracc log that comes from server when using Nammu
        const oracc_log = fs.readFileSync(
          path.join(__dirname,
                    '../../../src/test/suite/input/oracc_no_errors.log'),
          'utf-8');
        const server_result = new ServerResult(oracc_log, ""); //We don't care about request.log for now

        assert.equal(server_result.get_user_log('whatever'), expected_user_log);
        // There's no sensible way to compare dictionaries, JSON.stringify
        // seemed the most straight forward
        assert(JSON.stringify(server_result.validation_errors) == JSON.stringify(expected_val_errors));
        assert.equal(server_result.summary_line, expected_summary_line);
        assert(!server_result.contains_errors());
    });

    test('Validation results for error_belsunu.atf', async () => {
      const text = fs.readFileSync(
        path.join(__dirname,
                  '../../../src/test/suite/input/error_belsunu.atf')).toString();
      const server_result = await validate('error_belsunu.atf', 'cams/gkab', text);
      const expected_val_errors = {
         '6': 'unknown block token: tableta',
         '44': 'o 4: translation uses undefined label'
      };
      const expected_summary_line = "ATF processor ox issued 2 warnings and 0 notices";
      assert.deepStrictEqual(server_result.validation_errors, expected_val_errors);
      assert.strictEqual(server_result.summary_line, expected_summary_line);
    });

    test('SOAP client constructor test', async () => {
        const belsunu = fs.readFileSync(path.join(__dirname,'../../../src/test/suite/input/belsunu.atf'), 'utf-8');
        const client = new SOAPClient("./input/belsunu.atf", belsunu);
        assert(client.atf_filename == "belsunu.atf");
        assert(client.atf_text == belsunu);
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
