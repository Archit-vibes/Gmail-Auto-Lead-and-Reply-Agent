const prisma = require('../config/prisma');
const { google } = require('googleapis');
const { createOAuthClient } = require('../constants/googleClient');

async function getLeads(req, res) {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                email: true,
                event: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(leads);
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).send("Error fetching leads");
    }
}

async function scheduleEvent(req, res) {
    try {
        const leadId = parseInt(req.params.leadId, 10);
        if (isNaN(leadId)) {
            return res.status(400).send("Invalid Lead ID");
        }

        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                event: true,
                email: {
                    include: { user: true }
                }
            }
        });

        if (!lead || !lead.event) {
            return res.status(404).send("Lead or event not found.");
        }

        if (lead.event.status === "scheduled") {
            return res.status(400).send("Event is already scheduled.");
        }

        const user = lead.email.user;
        const oAuth2Client = createOAuthClient();
        oAuth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        const startTime = new Date(lead.event.scheduledTime);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1-hour duration

        const event = {
            summary: `Meeting with ${lead.company || "Lead"}`,
            description: `Automated event scheduled from MailFlow AI. \nIntent: ${lead.intent}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC', // Event times are assumed UTC by default parsing
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC',
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        const updatedEvent = await prisma.event.update({
            where: { id: lead.event.id },
            data: {
                status: "scheduled",
                calendarEventId: response.data.id
            }
        });

        res.json({ message: "Event scheduled successfully", event: updatedEvent });
    } catch (error) {
        console.error("Error scheduling event:", error);
        res.status(500).send("Error scheduling event");
    }
}

module.exports = {
    getLeads,
    scheduleEvent
};
