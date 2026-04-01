/**
 * Email parser utility for Gmail API messages.
 */

function parseGmailMessage(messageData) {
    const { id, threadId, internalDate, payload } = messageData;
    const headers = payload.headers;

    // 1. Extract Headers
    const subject = getHeader(headers, 'Subject') || '(No Subject)';
    const from = getHeader(headers, 'From') || '';
    const dateStr = getHeader(headers, 'Date') || new Date(parseInt(internalDate)).toUTCString();

    // 2. Parse Sender and Domain
    const { sender, senderDomain } = parseSender(from);

    // 3. Extract Body (Plain Text)
    const body = getBody(payload);

    return {
        gmailMessageID: id,
        threadID: threadId,
        subject,
        sender,
        senderDomain,
        body,
        receivedAt: new Date(dateStr)
    };
}

function getHeader(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : null;
}

function parseSender(fromHeader) {
    // Normalizes "First Last <email@domain.com>" or just "email@domain.com"
    const emailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([^\s<]+@[^\s>]+)/);
    const email = emailMatch ? emailMatch[1] : fromHeader;
    const domainMatch = email.match(/@([^@]+)$/);
    const domain = domainMatch ? domainMatch[1] : 'unknown';

    return {
        sender: email,
        senderDomain: domain
    };
}

function getBody(payload) {
    let body = "";

    if (payload.parts) {
        // Multipart message: Look for 'text/plain'
        const textPart = findPart(payload.parts, 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
            body = decodeBase64(textPart.body.data);
        } else {
            // Fallback: If no plain text, check nested parts
            body = payload.parts.map(part => getBody(part)).join("\n");
        }
    } else if (payload.body && payload.body.data) {
        // Single part message
        body = decodeBase64(payload.body.data);
    }

    return body.trim();
}

function findPart(parts, mimeType) {
    for (const part of parts) {
        if (part.mimeType === mimeType) {
            return part;
        }
        if (part.parts) {
            const nested = findPart(part.parts, mimeType);
            if (nested) return nested;
        }
    }
    return null;
}

function decodeBase64(data) {
    // Gmail uses URL-safe base64: replace '-' with '+' and '_' with '/'
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
}

module.exports = {
    parseGmailMessage
};
