import { default as fetch }from 'node-fetch';
import { createMultipart, createResponseMessage, extractLogs, getMultipartBody, getResponseCode } from './mime';
import { ServerResult } from '../client/server_result';
import * as vscode from 'vscode';
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

export async function validate(filename: string, project: string, text: string): Promise<ServerResult> {
    // TODO replace this with appropriate commands and reponse ID params
    const fullMessage = createMultipart("atf", filename, project, text);
    log('info', fullMessage.toString());
    const body = getMultipartBody(fullMessage);
    const boundary = fullMessage.contentType().params.boundary;

    const host = "http://build-oracc.museum.upenn.edu";
    const port = 8085;

    const headers = {
        'Connection': 'close',
        'MIME-Version': '1.0',
        // TODO: What if boundary contains a "? Do we need to escape it?
        'Content-Type': `multipart/related; charset="utf-8"; type="application/xop+xml"; start="<SOAP-ENV:Envelope>"; start-info="application/soap+xml"; boundary="${boundary}"`,
        // TODO: Should this be the whole body or only part? Compare with Nammu.
        'Content-Length': String(Buffer.byteLength(body))
    }

    const options = {
        method: 'POST',
        headers: headers,
        body: body
    }

    let responseID: string;
    try {
        const response = await fetch(`${host}:${port}`, options);
        if (response.status != 200) {
            vscode.window.showWarningMessage(`Request failed! Status: ${response.status}`);
        } else {
            responseID = getResponseCode(await response.text());
        }
    } catch (err) {
        log('error', `Problem getting response from server: ${err}`);
        vscode.window.showErrorMessage(
            "Problem getting response from server, see log for details.");
        return;  // Should return an empty result?
    }
    log('info', `Got response code ${responseID}`);

    let finalResult: Map<string, string>;
    try {
        await commandSuccessful(responseID, host);
        log('info', `Request ${responseID} is done.`);
        // Send Response message
        const ourResponse = createResponseMessage(responseID).toString({noHeaders: true});
        finalResult = await getFinalResult(ourResponse, host, port);
        //log('info', finalResult);
    } catch (err) {
        vscode.window.showErrorMessage(
            "Problem getting response from server, see log for details.")
        log('error', `A problem has occurred: ${err}`);
        return;  // Should return an empty result?
    }

    return new ServerResult(finalResult.get('oracc.log'),
                            finalResult.get('request.log'));
}


async function commandSuccessful(responseID: string, url: string): Promise<void> {
    let attempts = 0;
    const max_attempts = 10;
    while (attempts < max_attempts) {
        attempts += 1;
        const response = await fetch(`${url}/p/${responseID}`);
        const text = await response.text();
        switch (text.trim()) { // Message includes a trailing new line character
            case 'done': // done processing
                return;
            case 'err_stat':
                log('error', `Received err_stat for request ${responseID}.`);
                throw `The server encountered an error while validating.
                    Please contact the Oracc server admin to look into this problem.`;
            case 'run':
                if (attempts < max_attempts) {
                    log('info', 'Server working on request.');
                    break;
                } else {
                    throw `The Oracc server was unable to elaborate response
                    for request with id ${responseID}. Please contact the
                    Oracc server admin to look into this problem.`;
                }
            default:
                // TODO: Raise this properly
                log('error', `Unexpected message from server: ${text.trim()}`);
                throw `Unexpected message from server: ${text.trim()}`;
        }
    }
}


async function getFinalResult(message: string, url: string, port: number) {
    const response = await fetch(
        `${url}:${port}`,
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
