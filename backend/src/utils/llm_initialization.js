const { ChatGroq} = require('@langchain/groq')
// const langchain_core = require('@langchain/core')

const model = new ChatGroq({
    apiKey: process.env.GROQ_API,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7
})

module.exports = { model }