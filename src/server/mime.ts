import mimemessage = require('mimemessage');
import * as AdmZip from 'adm-zip';

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
    let data = "";
    if (responseID == null){
        data =  `<osc-data:data>
                    <osc-data:item xmime5:contentType="*/*">
                        <xop:Include href="cid:request_zip"/>
                    </osc-data:item>
                </osc-data:data>`
    }
    return data;
}

function createEnvelope(keys: string, data: string) {
    const envelope = createBaseMessage(
        'application/xop+xml; charset="utf-8"; type="application/soap+xml"',
        true);
    envelope.header('Content-ID', '<SOAP-ENV:Envelope>');
    envelope.body = `<?xml version="1.0" encoding="UTF-8"?>
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
                       <osc-meth:Request>
                            ${keys}
                            ${data}
                       </osc-meth:Request>
                   </SOAP-ENV:Body>
               </SOAP-ENV:Envelope>`;
    return envelope;
}

function createAttachment(content: string) {
    const attachment = createBaseMessage('*/*', true);
    attachment.header('Content-ID', '<request_zip>');
    attachment.body = content;
    return attachment;
}

export function createMultipart(command: string, filename: string,
                                project: string, encodedText: string,
                                responseID: string) {
    // The exact header may be overwritten later anyway, so we don't need
    // to include all the details.
    const message = createBaseMessage(
        'multipart/related; charset="utf-8"'
    );
    const keys = createEnvelopeKeys(command, filename, project, responseID);
    const data = createEnvelopeData(responseID);
    message.body = [];
    message.body.push(createEnvelope(keys, data));
    if (responseID == null) {
        message.body.push(createAttachment(encodedText));
    }
    return message;
}

export function createResponseMessage(responseID: string) {
    const envelope = createBaseMessage( 'application/soap+xml');
    envelope.body = `<?xml version="1.0" encoding="UTF-8"?>
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
                       <osc-meth:Response>
                           <osc-data:keys>
                               <osc-data:key>${responseID}</osc-data:key>
                           </osc-data:keys>
                       </osc-meth:Response>
                   </SOAP-ENV:Body>
               </SOAP-ENV:Envelope>`;
    return envelope;
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
    let fileMap = new Map<string, string>();
    zip.getEntries().forEach( e => {
        fileMap.set(e.name, zip.readAsText(e));
    })
    return fileMap;
}
