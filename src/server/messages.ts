import * as AdmZip from 'adm-zip';
import { default as fetch }from 'node-fetch';
import { request } from 'http';
import { createMultipart, createResponseMessage, extractLogs, getResponseCode } from './mime';
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

const oracc_log = `00atf/error_belsunu.atf:6:X001001: unknown block token: tableta
00atf/error_belsunu.atf:44:X001001: o 4: translation uses undefined label
ATF processor ox issued 2 warnings and 0 notices
`;

export async function validate(filename: string, project: string, text: string): Promise<ServerResult> {
    // First create the body of the message, since we'll need some information
    // from it to create the headers
    const zip = new AdmZip();
    // text.length does not account for the encoding, so using that will allocate
    // less memory that required and truncate the text in the zip!
    zip.addFile(`00atf/${filename}`, Buffer.alloc(Buffer.byteLength(text), text));
    const encodedText = zip.toBuffer().toString();
    // TODO replace this with appropriate commands and reponse ID params
    const fullMessage = createMultipart("atf", filename, project, encodedText);
    log('info', fullMessage.toString());
    let body = fullMessage.toString({noHeaders: true});
    // We probably don't need this? It's to convert all line endings to \r\n because reasons (see Nammu)
    body = body.replace("\r\n", "\n").replace("\n", "\r\n");
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
        responseID = await fetch(
            `${host}:${port}`, options)
            .then((res) => {
                if (res.status != 200) {
                    vscode.window.showWarningMessage(`Request failed! Status: ${res.status}`);
                } else {
                    return res.text();
                }
            })
            .then((text) => getResponseCode(text));
    } catch (err) {
        log('error', `Problem getting response from server: ${err}`);
        vscode.window.showErrorMessage(
            "Problem getting response from server, see log for details.");
    }
    log('info', `Got response code ${responseID}`);

    const completed = await commandSuccessful(responseID, host);
    if (completed) {
        log('info', `Request ${responseID} is done.`);
        // Send Response message
        const ourResponse = createResponseMessage(responseID).toString({noHeaders: true});
        const finalResult = await getFinalResult(ourResponse, host, port);
        log('info', finalResult);
    } else {
        log('error', 'Unsuccessful getting response.')
    }
    
    //TODO this is just a placeholder
    return new ServerResult(oracc_log);
}


async function commandSuccessful(responseID: string, url: string): Promise<boolean> {
    let attempts = 0;
    const max_attempts = 10;
    while (attempts < max_attempts) {
        attempts += 1;
        let result = await fetch(`${url}/p/${responseID}`)
            .then((res) => res.text())
            // Message includes a trailing new line character)
            .then((text) => text.trim());
        switch (result) {
            case 'done': // done processing
                return true;
            case 'err_stat':
                // TODO: Raise this properly
                log('error', 'Error getting response from server.');
                return false;
            case 'run':
                if (attempts < max_attempts) {
                    log('info', 'Server working on request.');
                    break;
                } else {
                    log('error', `Could not get response after ${max_attempts} attempts.`);
                    return false;
                }
            default:
                // TODO: Raise this properly
                log('error', 'Unexpected message from server.');
                return false;
        }
    }
}


function getFinalResult(message: string, url: string, port: number): Promise<string> {
    return new Promise((resolve) => {
        const req = request({host: url, port: port, timeout: 5000, method: 'POST'});
        const responseParts: Buffer[] = []
        req.on('response', (res) => {
            res.on('data', (chunk: Buffer) => {
                // The response may come in chunks. We can't be sure it's done
                // until the end event is fired.
                responseParts.push(chunk);
            });
            res.on('end', () => {
                log('info', 'Complete response received');
                const allLogs = extractLogs(Buffer.concat(responseParts));
                allLogs.forEach( (contents, name) => {
                    log('info', `${name}`)
                    log('info', `${contents}`)
                });
                return resolve(allLogs.get('oracc.log'));
            });
        });
        req.on('error', (err) => {
            console.error('Something went wrong');
            return resolve(err.message);
        })
        req.write(message);
        req.end();
    })
}
