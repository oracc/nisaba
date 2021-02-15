import mimemessage = require('mimemessage');

function createBaseMessage(contentType: string, isBinary = false) {
    let message = mimemessage.factory({
        contentType
    });
    if (isBinary) {
        message.contentTransferEncoding('binary');
    }
    message.header('MIME-Version', '1.0');
    return message;
}

function createEnvelope(filename: string, project: string) {
    let envelope = createBaseMessage(
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
                           <osc-data:keys>
                               <osc-data:key>atf</osc-data:key>
                               <osc-data:key>${project}</osc-data:key>
                               <osc-data:key>00atf/${filename}</osc-data:key>
                           </osc-data:keys>
                           <osc-data:data>
                               <osc-data:item xmime5:contentType="*/*">
                                   <xop:Include href="cid:request_zip"/>
                               </osc-data:item>
                           </osc-data:data>
                       </osc-meth:Request>
                   </SOAP-ENV:Body>
               </SOAP-ENV:Envelope>`;
    return envelope;
}

function createAttachment(content: string) {
    let attachment = createBaseMessage('*/*', true);
    attachment.header('Content-ID', '<request_zip>');
    attachment.body = content;
    return attachment;
}

export function createMultipart(filename: string, project: string, encodedText: string) {
    
    let multipartOptions = {
        charset: 'utf-8',
        type: 'application/xop+xml',
        start: '<SOAP-ENV:Envelope>',
        'start-info': 'application/soap+xml',
        boundary: '==========boundary========'
    }

    let message = createBaseMessage(
        'multipart/related; charset="utf-8"; type="application/xop+xml"; start="<SOAP-ENV:Envelope>"; start-info="application/soap+xml"; boundary="==========boundary========"'
    );
    message.body = [];
    message.body.push(createEnvelope(filename, project));
    message.body.push(createAttachment(encodedText));
    return message;
}

