// Email controller


const prisma = require('../config/prisma');
const { getGmailClient } = require('../constants/gmailClient');

async function fetchEmails(req , res){
    try {
        console.log("=== Entering fetchEmails for userId:", req.params.userId, "===");
        const userId = parseInt(req.params.userId, 10);
        if(!userId || isNaN(userId)){
            console.log("Invalid userId detected");
            return res.status(400).send("Invalid User ID");
        }

        console.log("Attempting to find User in DB...");
        const user = await prisma.user.findUnique({
            where:{
                id: userId
            }
        })

        if(!user){
            return res.status(404).send("User not found");
        }

        console.log("User found. Getting Gmail Client...");
        const gmailClient = await getGmailClient(user);

        console.log("Client created. Attempting to list messages from Gmail API...");
        const response = await gmailClient.users.messages.list({
            userId: 'me',
            maxResults: 10
        });

        console.log("Gmail messages list received. Expanding metadata...");
        const messages = response.data.messages || [];
        const fullMessages = await Promise.all(messages.map(async (msg) => {
            const msgData = await gmailClient.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'metadata',
                metadataHeaders: ['Subject', 'From', 'Date']
            });
            return {
                id: msgData.data.id,
                snippet: msgData.data.snippet,
                headers: msgData.data.payload.headers,
                internalDate: msgData.data.internalDate
            };
        }));

        res.json(fullMessages);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching emails");
    }
}

module.exports = {
    fetchEmails
}