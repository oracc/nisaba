"use strict";
exports.__esModule = true;
exports.createResponseMessage = exports.createMultipart = void 0;
var mimemessage = require("mimemessage");
function createBaseMessage(contentType, isBinary) {
    if (isBinary === void 0) { isBinary = false; }
    var message = mimemessage.factory({
        contentType: contentType
    });
    if (isBinary) {
        message.contentTransferEncoding('binary');
    }
    message.header('MIME-Version', '1.0');
    return message;
}
function createEnvelope(filename, project) {
    var envelope = createBaseMessage('application/xop+xml; charset="utf-8"; type="application/soap+xml"', true);
    envelope.header('Content-ID', '<SOAP-ENV:Envelope>');
    envelope.body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n               <SOAP-ENV:Envelope\n                   xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\"\n                   xmlns:SOAP-ENC=\"http://www.w3.org/2003/05/soap-encoding\"\n                   xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n                   xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\n                   xmlns:xop=\"http://www.w3.org/2004/08/xop/include\"\n                   xmlns:xmime5=\"http://www.w3.org/2005/05/xmlmime\"\n                   xmlns:osc-data=\"http://oracc.org/wsdl/ows.xsd\"\n                   xmlns:osc-meth=\"http://oracc.org/wsdl/ows.wsdl\">\n                   <SOAP-ENV:Body>\n                       <osc-meth:Request>\n                           <osc-data:keys>\n                               <osc-data:key>atf</osc-data:key>\n                               <osc-data:key>" + project + "</osc-data:key>\n                               <osc-data:key>00atf/" + filename + "</osc-data:key>\n                           </osc-data:keys>\n                           <osc-data:data>\n                               <osc-data:item xmime5:contentType=\"*/*\">\n                                   <xop:Include href=\"cid:request_zip\"/>\n                               </osc-data:item>\n                           </osc-data:data>\n                       </osc-meth:Request>\n                   </SOAP-ENV:Body>\n               </SOAP-ENV:Envelope>";
    return envelope;
}
function createAttachment(content) {
    var attachment = createBaseMessage('*/*', true);
    attachment.header('Content-ID', '<request_zip>');
    attachment.body = content;
    return attachment;
}
function createMultipart(filename, project, encodedText) {
    // The exact header may be overwritten later anyway, so we don't need
    // to include all the details.
    var message = createBaseMessage('multipart/related; charset="utf-8"');
    message.body = [];
    message.body.push(createEnvelope(filename, project));
    message.body.push(createAttachment(encodedText));
    return message;
}
exports.createMultipart = createMultipart;
function createResponseMessage(responseID) {
    var envelope = createBaseMessage('application/soap+xml');
    envelope.body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n               <SOAP-ENV:Envelope\n                   xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\"\n                   xmlns:SOAP-ENC=\"http://www.w3.org/2003/05/soap-encoding\"\n                   xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n                   xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\n                   xmlns:xop=\"http://www.w3.org/2004/08/xop/include\"\n                   xmlns:xmime5=\"http://www.w3.org/2005/05/xmlmime\"\n                   xmlns:osc-data=\"http://oracc.org/wsdl/ows.xsd\"\n                   xmlns:osc-meth=\"http://oracc.org/wsdl/ows.wsdl\">\n                   <SOAP-ENV:Body>\n                       <osc-meth:Response>\n                           <osc-data:keys>\n                               <osc-data:key>" + responseID + "</osc-data:key>\n                           </osc-data:keys>\n                       </osc-meth:Response>\n                   </SOAP-ENV:Body>\n               </SOAP-ENV:Envelope>";
    return envelope;
}
exports.createResponseMessage = createResponseMessage;
