// Email controller


const prisma = require('../config/prisma');
const { getGmailClient } = require('../constants/gmailClient');
const { parseGmailMessage } = require('../utils/emailParser');
const { email2LLM } = require('../services/email2LLM');


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

        // --- Start of LLM Extraction and Lead Creation ---
        try {
            console.log("Triggering email2LLM processing...");
            const leadDataArray = await email2LLM(filteredEmails);
            console.log(`Extracted Lead data for ${leadDataArray.length} emails.`);

            for (const leadData of leadDataArray) {
                try {
                    // Create Lead
                    const lead = await prisma.lead.upsert({
                        where: { emailId: leadData.emailDBId },
                        update: {
                            company: leadData.company,
                            intent: leadData.intent,
                            industry: leadData.industry,
                            score: leadData.score,
                            priority: leadData.priority,
                            status: leadData.status || "Fetched"
                        },
                        create: {
                            emailId: leadData.emailDBId,
                            company: leadData.company,
                            intent: leadData.intent,
                            industry: leadData.industry,
                            score: leadData.score,
                            priority: leadData.priority,
                            status: leadData.status || "Fetched",
                            createdAt: new Date(leadData.createdAt || Date.now())
                        }
                    });

                    // Create Event if planned
                    if (leadData.isEventPlanned && leadData.eventTime) {
                        await prisma.event.upsert({
                            where: { leadId: lead.id },
                            update: {
                                scheduledTime: new Date(leadData.eventTime),
                                status: "scheduled"
                            },
                            create: {
                                leadId: lead.id,
                                calendarEventId: `msg-${leadData.emailDBId}`, // Placeholder identifier
                                scheduledTime: new Date(leadData.eventTime),
                                status: "scheduled"
                            }
                        });
                    }
                } catch (leadError) {
                    console.error(`Error saving lead for email ${leadData.emailDBId}:`, leadError);
                }
            }
            console.log("Lead creation process completed.");
        } catch (llmError) {
            console.error("Error during email2LLM or Lead creation:", llmError);
            // We continue even if LLM fails so user still gets their emails
        }
        // --- End of LLM Extraction ---

        res.json(filteredEmails);

    } catch (error) {
        console.error("Critical error in fetchEmails:", error);
        res.status(500).send("Error fetching and persisting emails");
    }
}

async function getEmailsFromDB(req, res) {
    try {
        console.log("=== Entering getEmailsFromDB for userId:", req.params.userId, "===");
        const userId = parseInt(req.params.userId, 10);
        if (!userId || isNaN(userId)) {
            return res.status(400).send("Invalid User ID");
        }

        const emails = await prisma.email.findMany({
            where: {
                userID: userId
            },
            include: {
                lead: true
            },
            orderBy: {
                receivedAt: 'desc'
            }
        });

        res.json(emails);
    } catch (error) {
        console.error("Error fetching emails from DB:", error);
        res.status(500).send("Error fetching emails from DB");
    }
}

module.exports = {
    fetchEmails,
    getEmailsFromDB
};
