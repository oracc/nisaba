import { ServerResult } from '../client/server_result.js';
import { SOAPClient } from '../client/SOAP_client.js';

// The interface of functions which have to send information to the server
// (for convenience in typing in other files)
export type ServerFunction = (filename: string, project: string, text: string) => Promise<ServerResult>;

export async function validate(filename: string, project: string, text: string): Promise<ServerResult> {
    const client = new SOAPClient(filename, project, text);
    const result = await client.executeCommand("atf");
    return result;
}


export async function lemmatise(filename: string, project: string, text: string): Promise<ServerResult> {
    const client = new SOAPClient(filename, project, text);
    const result = await client.executeCommand("lem");
    return result;
}
