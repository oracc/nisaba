import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { MultipartMessage, extractLogs } from '../../server/mime';

suite('Messages test suite', () => {

    let finalResponse: Buffer;
    const inputPath = path.join(__dirname, '../../../src/test/suite/input');
    const refPath = path.join(__dirname, '../../../src/test/suite/reference');
    // Our test input files have different names and paths than in the zip.
    // This maps them to their path in the repository.
    const filenameMapping = new Map([
        ['oracc.log', path.join(inputPath, 'error_oracc.log')],
        ['request.log', path.join(inputPath, 'request.log')]
    ])

    setup(() => {
        // Build up a response like what the server sends
        const boundary = '--==gOrqR+3DSoMsA7PEa1/q0p3KO1kYYQf4eLivJaycC+IC5XHTMG9Bw1L+qvXC==';
        const firstPart = `Content-Type: application/xop+xml; charset=utf-8; type="application/soap+xml"
        Content-Transfer-Encoding: binary
        Content-ID: <SOAP-ENV:Envelope>

        <?xml version="1.0" encoding="UTF-8"?>
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope" xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xop="http://www.w3.org/2004/08/xop/include" xmlns:xmime5="http://www.w3.org/2005/05/xmlmime" xmlns:osc-data="http://oracc.org/wsdl/ows.xsd" xmlns:osc-meth="http://oracc.org/wsdl/ows.wsdl">
        <SOAP-ENV:Body>
           <osc-meth:ResponseResponse>
               <osc-data:keys>
                   <osc-data:key>done</osc-data:key>
               </osc-data:keys>
               <osc-data:data>
                   <osc-data:item xmime5:contentType="*/*">
                   <xop:Include href="cid:id2"/>
               </osc-data:item>
           </osc-data:data>
        </osc-meth:ResponseResponse>
        </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>`
        // Headers in the second part (separated by '\r\n' in message)
        const headerLines = [
            'Content-Type: */*',
            'Content-Transfer-Encoding: binary',
            'Content-ID: <id2>'
        ]
        // Zipped contents in the second part
        const zip = new AdmZip();
        filenameMapping.forEach((pathInRepo, nameInZip) => {
            zip.addLocalFile(pathInRepo, '', nameInZip);
        })

        finalResponse = Buffer.concat([
            Buffer.from(boundary + '\r\n'),
            Buffer.from(firstPart + '\r\n'),
            Buffer.from(boundary + '\r\n'),
            Buffer.from(headerLines.join('\r\n') + '\r\n\r\n'),
            zip.toBuffer(),
            Buffer.from('\r\n' + boundary + '--')
        ]);

    })

    test('Extract server logs correctly', () => {
        // Check that we extract the same logs we put in
        const logs = extractLogs(finalResponse);
        filenameMapping.forEach((pathInRepo, nameInZip) => {
            assert.strictEqual(
                logs.get(nameInZip),
                fs.readFileSync(pathInRepo).toString()
            );
        });
    })

    test('Generate initial message correctly', () => {
        // Create the initial request to compare against the expected one
        const filename = "belsunu.atf"
        const text = fs.readFileSync(path.join(inputPath, filename)).toString();
        const msg = (new MultipartMessage("atf", filename, "cams/gkab", text))._message;
        const expected = fs.readFileSync(path.join(refPath, 'initial_request_belsunu')).toString();
        // We can't directly compare the results, because the date is encoded
        // in the zip files, so those will differ. We can compare them in parts though.
        // The boundary is the first 7 characters
        const expectedParts = expected.split('--uafdHS3v');
        // Compare the first part (SOAP envelope)
        const expectedSOAP = expectedParts[1]
                                // skip the first and last line change (not included in message)
                                .trim()
                                // ignore how line endings are encoded
                                .replace(/\r\n/g, "\n")
        assert.strictEqual(msg._body[0].toString().replace(/\r\n/g, "\n"),
                           expectedSOAP);
        // Get and compare the headers for the second part (zip attachment)
        const attachmentLines: string[] = msg._body[1].toString().split('\r\n');
        const numHeaders = 4;
        const attachmentHeaders = attachmentLines.slice(0, numHeaders);
        const expectedHeaders = expectedParts[2].trim().split(/\r?\n/).slice(0, numHeaders);
        // Need "deep" equality to compare array contents
        assert.deepStrictEqual(attachmentHeaders, expectedHeaders);
        // Get the zip contents, read as a zip file and compare with original text
        // There should only be one line but just in case \n happens to be in the encoded zip...
        const zipContents = Buffer.from(attachmentLines.slice(numHeaders + 1).join(""),
                                        'latin1');
        const zip = new AdmZip(zipContents);
        assert.strictEqual(zip.getEntry(`00atf/${filename}`).getData().toString(),
                           text);
    })

});
