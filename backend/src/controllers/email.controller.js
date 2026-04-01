// Email controller


const prisma = require('../config/prisma');
const { getGmailClient } = require('../constants/gmailClient');
const { parseGmailMessage } = require('../utils/emailParser');

async function fetchEmails(req, res) {
    try {
        console.log("=== Entering fetchEmails for userId:", req.params.userId, "===");
        const userId = parseInt(req.params.userId, 10);
        if (!userId || isNaN(userId)) {
            console.log("Invalid userId detected");
            return res.status(400).send("Invalid User ID");
        }

        console.log("Attempting to find User in DB...");
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).send("User not found");
        }

        console.log("User found. Getting Gmail Client...");
        const gmailClient = await getGmailClient(user);

        console.log("Client created. Fetching 20 messages from Gmail API...");
        const response = await gmailClient.users.messages.list({
            userId: 'me',
            maxResults: 20
        });

        const messages = response.data.messages || [];
        console.log(`Found ${messages.length} messages. Fetching full content and persisting...`);

        const savedEmails = await Promise.all(messages.map(async (msg) => {
            try {
                // Fetch full message to get body
                const msgData = await gmailClient.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'full'
                });

                // Parse the message
                const parsedEmail = parseGmailMessage(msgData.data);

                // Upsert to DB
                return await prisma.email.upsert({
                    where: { gmailMessageID: parsedEmail.gmailMessageID },
                    update: {
                        subject: parsedEmail.subject,
                        body: parsedEmail.body,
                        receivedAt: parsedEmail.receivedAt
                    },
                    create: {
                        ...parsedEmail,
                        userID: user.id
                    },
                    include: {
                        lead: true // Include lead info if exists
                    }
                });
            } catch (err) {
                console.error(`Error processing message ${msg.id}:`, err);
                return null;
            }
        }));

        // Filter out any failed processing
        const filteredEmails = savedEmails.filter(e => e !== null);

        console.log(`Successfully persisted ${filteredEmails.length} emails.`);

        // Return a format compatible with frontend expectations
        // The frontend expects {id, snippet, headers, internalDate} or similar.
        // Let's pass the database records which are more structured.
        res.json(filteredEmails);
    } catch (error) {
        console.error("Critical error in fetchEmails:", error);
        res.status(500).send("Error fetching and persisting emails");
    }
}

module.exports = {
    fetchEmails
};