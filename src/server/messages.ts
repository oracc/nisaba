import * as vscode from 'vscode';
import { ServerResult } from '../client/server_result';
import { SOAPClient } from '../client/SOAP_client';

// The interface of functions which have to send information to the server
// (for convenience in typing in other files)
export type ServerFunction = (filename: string, project: string, text: string) => Promise<ServerResult>;

export async function validate(filename: string, project: string, text: string): Promise<ServerResult> {
    const client = new SOAPClient(filename, project, text);
    try {
        const result = await client.executeCommand("atf");
        return result;
    } catch (err) {
        const errMsg = `An error has occurred:
            ${err}
            The log may contain more details.
            `;
        vscode.window.showErrorMessage(errMsg);
    }
}


export async function lemmatise(filename: string, project: string, text: string): Promise<ServerResult> {
    const client = new SOAPClient(filename, project, text);
    try {
        const result = await client.executeCommand("lem");
        return result;
    } catch (err) {
        const errMsg = `An error has occurred:
            ${err}
            The log may contain more details.
            `;
        vscode.window.showErrorMessage(errMsg);
    }
}
