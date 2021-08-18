import mimemessage = require('mimemessage');
import * as AdmZip from 'adm-zip';
import { parseString } from 'xml2js';

/**
 * A wrapper around mimemessage.Entity, for better access and control of encoding.
 *
 * This will wrap a multipart MIME message, comprising a SOAP envelope
 * and a binary-encoded zip file containing the ATF text.
 */
export class MultipartMessage {
    boundary: string;
    envelope: string;
    attachment: Buffer;
    _message: mimemessage.Entity;

    /**
     * Create an initial request for validation or lemmatisation.
     *
     * @param command The type of command to send, "atf" or "lem"
     * @param filename The name of the ATF file to process
     * @param project The Oracc project the file belongs to
     * @param text The text of the ATF file
     */
    constructor(command: string, filename: string,
                project: string, text: string) {
        // The exact header may be overwritten later anyway, so we don't need
        // to include all the details.
        const message = createBaseMessage(
            'multipart/related; charset="utf-8"'
        );
        const keys = createEnvelopeKeys(command, filename, project, null);
        const data = createEnvelopeData(null);
        this.envelope = createEnvelopePart(keys, data);
        message.body = [];
        message.body.push(this.envelope);
        // Now for the attachment...
        // First create the body of the message, since we'll need some information
        // from it to create the headers
        const zip = new AdmZip();
        // text.length does not account for the encoding, so using that will allocate
        // less memory that required and truncate the text in the zip!
        zip.addFile(`00atf/${filename}`, Buffer.alloc(Buffer.byteLength(text), text));
        // Use the ISO-8859-1 encoding, to ensure we don't misinterpret the zip contents.
        this.attachment = zip.toBuffer();
        message.body.push(createAttachment(this.attachment.toString('latin1')));
        this._message = message;
        this.boundary = message.contentType().params.boundary;
    }

    /**
    * Get the body of this request in the right format for sending.
    *
    * The returned Buffer can be used in the body of an HTTP request to the
    * Oracc server.
    *
    * @returns A Buffer with the message contents correctly encoded
    */
    getBody(): Buffer {
        // Build the message manually so we can control the encoding of the zip.
        // This is mimicking what the mimemessage package does.
        const sep = "\r\n";
        const body: Buffer = Buffer.concat([
            Buffer.from('--' + this.boundary + sep),
            // We may not need this? Holdover from Nammu (changing all line endings to \r\n)
            Buffer.from(this._message._body[0].toString().replace(/\r\n/g, "\n").replace("\n", "\r\n")),
            Buffer.from('\r\n' + '--' + this.boundary + sep),
            Buffer.from(this._message._body[1].toString(), 'latin1'),
            Buffer.from(sep + '--' + this.boundary + '--')
        ]);
        return body;
    }

    /**
     * Get the headers of this request.
     *
     * @returns An object that can be used as the headers of an HTTP request
     */
    getHeaders() {
        // TODO Can we avoid computing the body twice, apart from storing it?
        return {
            'Connection': 'close',
            'MIME-Version': '1.0',
            // TODO: What if boundary contains a "? Do we need to escape it?
            'Content-Type': `multipart/related; charset="utf-8"; type="application/xop+xml"; start="<SOAP-ENV:Envelope>"; start-info="application/soap+xml"; boundary="${this.boundary}"`,
            // TODO: Should this be the whole body or only part? Compare with Nammu.
            'Content-Length': String(Buffer.byteLength(this.getBody()))
        }
    }
}

function createBaseMessage(contentType: string, isBinary = false) {
    const message = mimemessage.factory({
        contentType
    });
    if (isBinary) {
        message.contentTransferEncoding('binary');
    }
    message.header('MIME-Version', '1.0');
    return message;
}

function createEnvelopeKeys(command: string, filename: string,
                            project: string, responseID: string){
    let keys: string;
    if (responseID == null){
        keys = `<osc-data:keys>
                        <osc-data:key>${command}</osc-data:key>
                        <osc-data:key>${project}</osc-data:key>
                        <osc-data:key>00atf/${filename}</osc-data:key>
                    </osc-data:keys>`;
    }
    else {
        keys = `<osc-data:keys>
                                <osc-data:key>${responseID}</osc-data:key>
                            </osc-data:keys>`;
    }
    return keys;
}

function createEnvelopeData(responseID: string){
    let data = ""; // the final request does not have any data
    if (responseID == null){
        data =  `<osc-data:data>
                        <osc-data:item xmime5:contentType="*/*">
                            <xop:Include href="cid:request_zip"/>
                        </osc-data:item>
                    </osc-data:data>`
    }
    return data;
}

function createEnvelopePart(keys: string, data: string) {
    const envelope = createBaseMessage(
        'application/xop+xml; charset="utf-8"; type="application/soap+xml"',
        true);
    envelope.header('Content-ID', '<SOAP-ENV:Envelope>');
    envelope.body = createEnvelope(keys, data, false);
    return envelope;
}

/**
 * Get a SOAP envelope that can be used as its own message or in a multipart message.
 * @param keys The <osc-data:keys> element
 * @param data  The <osc-data:data> element
 * @param isResponse true if we are getting the result, false if initial request
 * @returns The body of the envelope
 */
function createEnvelope(keys: string, data: string, isResponse: boolean): string {
    const osc_meth_type = isResponse ? "Response" : "Request";
    return `<?xml version="1.0" encoding="UTF-8"?>
        <SOAP-ENV:Envelope
            xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
            xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:xop="http://www.w3.org/2004/08/xop/include"
            xmlns:xmime5="http://www.w3.org/2005/05/xmlmime"
            xmlns:osc-data="http://oracc.org/wsdl/ows.xsd"
            xmlns:osc-meth="http://oracc.org/wsdl/ows.wsdl">
            <SOAP-ENV:Body>
                <osc-meth:${osc_meth_type}>
                    ${keys}
                    ${data}
                </osc-meth:${osc_meth_type}>
            </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>`;
}

function createAttachment(content: string) {
    const attachment = createBaseMessage('*/*', true);
    attachment.header('Content-ID', '<request_zip>');
    attachment.body = content;
    return attachment;
}

export function createResponseMessage(responseID: string) {
    const envelope = createBaseMessage('application/soap+xml');
    envelope.body = createEnvelope(
        createEnvelopeKeys(null, null, null, responseID),
        createEnvelopeData(responseID),
        true
    )
    return envelope;
}

/**
 * Parse a response to get the code for a validation or lemmatisation request.
 *
 * @param xmlResponse The server's initial response (assuming success)
 * @returns The code that can be used to retrieve the results of this request
 */
export function getResponseCode(xmlResponse: string): string {
    let code: string;
    parseString(xmlResponse, (err, res) => {
        const response = res['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['osc-meth:RequestResponse'][0];
        code = response['osc-data:keys'][0]['osc-data:key'][0];
    })
    return code;
}

/**
 * Parse the final server response and extract the logs from it.
 *
 * @param response The complete response as received from the server
 * @returns A map from filenames to their contents (logs)
 */
export function extractLogs(response: Buffer): Map<string,string> {
    // If we convert the Buffer to text, the data becomes corrupted.
    // Therefore, we have to do some operations on the text, but also work
    // with the Buffer directly.
    /// This mostly involves slicing it to get a subset of the data.
    // The key property is that, apart from the zip data, all other
    // characters take up 1 entry in the buffer, so we can mix indices
    // between the text and then raw buffer.

    // The response message contains 3 parts, separated by a barrier.
    // First we work with the text to extract that last part.
    const barrierRegEx = /--==.*==/;  // exact barrier changes every time
    const barrier = response.toString().match(barrierRegEx)[0]
    // Find where second-to-last barrier appears (last is at the very end of the message)
    const lastSwitch = response.slice(0, response.length - barrier.length).lastIndexOf(barrier);
    // Start from right after the end of that barrier,
    // and also remove the very last barrier and the trailing '--' for convenience
    const lastPart = response.slice(lastSwitch + barrier.length,
                                    response.length - barrier.length - 2);

    // Now that we have the last part, we want to get the data of the zip file.
    // The last part starts with a number of header lines, separated by '\r\n`.
    // The data of interest comes after 5 such lines (incl. an empty line).
    // Work with the text to find how many positions we have to skip.
    const lineSep = '\r\n';
    const segmentsToSkip = 5;
    const segmentSizes = lastPart.toString().split(lineSep).map(e => e.length);
    // Skip all the first 5 segments (including their line changes)
    const charsToSkip = segmentSizes.slice(0, segmentsToSkip).reduce((x, y) => x + y, 0) + segmentsToSkip * lineSep.length;

    // Now we know where the zip data starts. It ends just before a final '\r\n'.
    // We can finally read it as a zip file.
    const zipBuffer = lastPart.slice(charsToSkip, lastPart.length - lineSep.length)
    const zip = new AdmZip(zipBuffer);
    // Read all the files in the zip and return their names and contents
    const fileMap = new Map<string, string>();
    zip.getEntries().forEach( e => {
        fileMap.set(e.name, zip.readAsText(e));
    })
    return fileMap;
}
