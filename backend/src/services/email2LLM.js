const { PromptTemplate } = require('@langchain/core/prompts')
const { StructuredOutputParser } = require('@langchain/core/output_parsers')
const { z } = require('zod')
const { model } = require('../utils/llm_initialization')

// Define the schema for structured output from the LLM
const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        company: z.string().describe("The name of the company mentioned in the email, if any."),
        intent: z.string().describe("A brief summary of the sender's intent or query."),
        industry: z.string().describe("The industry the company belongs to, if identifiable."),
        score: z.number().min(0).max(100).describe("Interest score from 0 to 100 based on the content."),
        priority: z.enum(["High", "Medium", "Low"]).describe("Priority level based on urgency and potential."),
        status: z.string().default("Fetched").describe("The process status, default to 'Fetched'."),
        isEventPlanned: z.boolean().describe("Whether a meeting or event is mentioned in the email."),
        eventTime: z.string().optional().describe("ISO format date/time of the event if planned."),
        createdAt: z.string().describe("The date the email was sent or lead was created in ISO format.")
    })
)

async function email2LLM(savedEmails) {
    if (!Array.isArray(savedEmails) || savedEmails.length === 0) {
        console.log("No emails to process with LLM.");
        return []
    }

    const formatInstructions = parser.getFormatInstructions()

    const prompt = new PromptTemplate({
        template: "Analyze the following email and extract lead information.\n\nEmail Subject: {subject}\nEmail Body: {body}\n\n{format_instructions}",
        inputVariables: ["subject", "body"],
        partialVariables: { format_instructions: formatInstructions }
    })

    const emailsToProcess = savedEmails.slice(0, 10);
    console.log(`Processing up to ${emailsToProcess.length} emails with LLM...`);

    const results = [];
    let rateLimitHit = false;

    for (const email of emailsToProcess) {
        if (rateLimitHit) break;

        try {
            const formattedPrompt = await prompt.format({
                subject: email.subject,
                body: email.body
            })

            const response = await model.invoke(formattedPrompt)
            
            // Extract the content from the response
            const content = typeof response === 'string' ? response : (response.content || response.text);
            
            const parsed = await parser.parse(content)
            
            results.push({
                emailDBId: email.id,
                ...parsed
            });

        } catch (error) {
            // Check for rate limit error (status 429 or specific error code)
            const isRateLimit = error.status === 429 || 
                               (error.response && error.response.status === 429) ||
                               (error.code === 'rate_limit_exceeded') ||
                               (error.message && error.message.toLowerCase().includes('rate limit'));

            if (isRateLimit) {
                console.warn(`Rate limit hit at email ${email.id}. Stopping further LLM requests.`);
                rateLimitHit = true;
                break; // Stop sending more emails
            } else {
                console.error(`Error processing email ${email.id} with LLM:`, error);
                // Continue for other types of errors
            }
        }
    }

    console.log(`Successfully extracted ${results.length} leads before ${rateLimitHit ? 'reaching rate limit' : 'finishing'}.`);
    return results;
}

module.exports = { email2LLM }