import * as vscode from 'vscode';
import { default as fetch }from 'node-fetch';
import { createResponseMessage, extractLogs, getResponseCode, MultipartMessage, ServerAction } from '../server/mime';
import { ServerResult } from './server_result';
import { log } from '../logger';

/*
1. Gather all the information for the message from the text (start with hardcoded)
3. Create the message
4. Figure out address, port etc and send message
5. Parse response to get ID
6. Poll server (GET at /p/<responseID>) until done
7. Send "response" message to server
8. Unpack response to get validation results
*/

export class SOAPClient {
    url: string = "http://build-oracc.museum.upenn.edu";
    port: number = 8085;
    atf_filename: string;
    atf_text: string;
    atf_project: string;
    responseID: string;

    constructor(atf_name: string, atf_project: string, atf_text: string) {
        this.atf_text = atf_text;
        this.atf_filename = atf_name;
        this.atf_project = atf_project;
        this.atf_text = atf_text;
    }

    async executeCommand(command: ServerAction): Promise<ServerResult> {
        try {
            this.responseID = await this.sendInitialRequest(command);
            log('debug', `Got response code ${this.responseID}`);
            await this.serverComplete();
            log('info', `Request ${this.responseID} is done.`);
            const finalResult = await this.retrieveReponse();
            return new ServerResult(finalResult.get('oracc.log'),
                                    finalResult.get('request.log'));
        } catch (err) {
            log('error', `Error during communication with server: ${err}`);
            vscode.window.showErrorMessage(
                "Problem getting response from server, see log for details.");
            return;  // Should return an empty result?
        }
    }

    async sendInitialRequest(command): Promise<string> {
        const fullMessage = new MultipartMessage(command, this.atf_filename,
                                                 this.atf_project, this.atf_text);
        log('debug', fullMessage.toString());
        const body = fullMessage.getBody();

        const headers = fullMessage.getHeaders();

        const options = {
            method: 'POST',
            headers: headers,
            body: body
        }

        try {
            const response = await fetch(`${this.url}:${this.port}`, options);
            if (response.status != 200) {
                throw `Request failed! Status: ${response.status}`;
            }
            return getResponseCode(await response.text());
        } catch (err) {
            log('error', `Problem getting response from server: ${err}`);
            throw err;
        }
    }

    async serverComplete(): Promise<void> {
        let attempts = 0;
        const max_attempts = 10;
        while (attempts < max_attempts) {
            attempts += 1;
            const response = await fetch(`${this.url}/p/${this.responseID}`);
            const text = await response.text();
            switch (text.trim()) { // Message includes a trailing new line character
                case 'done': // done processing
                    return;
                case 'err_stat':
                    log('error', `Received err_stat for request ${this.responseID}.`);
                    throw `The server encountered an error while validating.
                        Please contact the Oracc server admin to look into this problem.`;
                case 'run':
                    if (attempts < max_attempts) {
                        log('info', 'Server working on request.');
                        break;
                    } else {
                        throw `The Oracc server was unable to elaborate response
                        for request with id ${this.responseID}. Please contact the
                        Oracc server admin to look into this problem.`;
                    }
                default:
                    log('error', `Unexpected message from server: ${text.trim()}`);
                    throw `Unexpected message from server: ${text.trim()}`;
            }
        }
    }

    async retrieveReponse(): Promise<Map<string, string>> {
        const message = createResponseMessage(this.responseID).toString({noHeaders: true});
        const response = await fetch(
            `${this.url}:${this.port}`,
            {method: 'POST', body: message}
        );
        const responseContents = await response.buffer();
        const allLogs = extractLogs(responseContents);
        allLogs.forEach( (contents, name) => {
                log('info', `${name}`)
                log('info', `${contents}`)
            });
        return allLogs;
    }

}
