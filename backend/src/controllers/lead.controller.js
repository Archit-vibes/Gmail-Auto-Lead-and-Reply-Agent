const prisma = require('../config/prisma');

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

module.exports = {
    getLeads
};
