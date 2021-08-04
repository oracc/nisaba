/* eslint-disable */
const AdmZip = require('adm-zip'); // It seems this has to be imported old-style
import { request } from 'http';
import { MultipartMessage } from '../server/mime';


export class HTTP_request {
    /* Builds an HTTP GET or POST request that ORACC's server understands to send
    and retrieve ATF data.*/

    url: string; // Server URL
    method: string; // This can be GET or POST
    request: Object;

    constructor(url: string, method: string, command: string, project: string,
                atf_filename: string, atf_text: string) {
        this.url = url;
        this.method = method;
        this.request = this.create_request_message(command, project,
                                                   atf_filename, atf_text);
    }

    create_request_message(command: string, project: string,
                           atf_filename: string, atf_text: string) {
        /* Send attachment to server containing ATF file and necessary data to
        run given command (validate, lemmatise, etc).*/
        //let responseID: string;
        // First create the body of the message, since we'll need some information
        // from it to create the headers
        const encodedText = this.zip_atf(atf_filename, atf_text);
        const fullMessage = new MultipartMessage(command, atf_filename, project,
                                            encodedText);
        //const body = fullMessage.toString({noHeaders: true});
        const boundary = fullMessage.boundary;

        const headers = {
            'Connection': 'close',
            'MIME-Version': '1.0',
            // TODO: What if boundary contains a "?" Do we need to escape it?
            'Content-Type': `multipart/related; charset="utf-8"; type="application/xop+xml"; start="<SOAP-ENV:Envelope>"; start-info="application/soap+xml"; boundary="${boundary}"`,
            // TODO: Also add Content-Length here
        }
        const options = {
            host: "build-oracc.museum.upenn.edu",
            port: 8085,
            method: 'POST',
            headers: headers,
        }
        return request(options);
    }

    zip_atf(atf_filename: string, atf_text: string) {
        /* The server expects the data to be sent in a zip file containing
        the atf file inside a "00atf" folder. */
        const zip = new AdmZip();
        // text.length does not account for the encoding, so using that will allocate
        // less memory that required and truncate the text in the zip!
        zip.addFile(`00atf/${atf_filename}`,
                    Buffer.alloc(Buffer.byteLength(atf_text), atf_text));
        const encodedText = zip.toBuffer();
        return encodedText;
    }

}
