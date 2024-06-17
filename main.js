import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { encode } from 'gpt-tokenizer';
import dotenv from 'dotenv';
dotenv.config();

// 1. Initialize superbase client
const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_KEY);

// 2. Initialize openai
const openai = new OpenAI({
	apiKey: process.env.OPENAPI_KEY, // This is the default and can be omitted
});

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
	console.log("---req.body.question:", req.body.question);
	const question = req.body.question ? req.body.question : "";

	console.log("---preparing data ");
	const input = question.replace(/\n/g, ' ');
	const inputEmbedding = (await openai.embeddings.create({
		model: "text-embedding-ada-002", // Model that creates our embeddings
		input
	}))?.data[0]?.embedding;

	console.log("---finding matched documents")
	const { data: documents } = await supabaseClient.rpc('match_documents', {
		query_embedding: inputEmbedding,
		match_threshold: 0.68,	// 0.78, // Choose an appropriate threshold for your data
		match_count: 10, // Choose the number of matches
	});

	let tokenCount = 0, contextText = '';
	// Concat matched documents
	for (let i = 0; i < documents.length; i++) {
		const document = documents[i];
		const content = document.content;
		const encoded = encode(content);
		tokenCount += encoded.length;
		// Limit context to max 1500 tokens (configurable)
		if (tokenCount > 1500) {
			break;
		}
		contextText += `${content.trim()}\n---\n`;
	}

	console.log("---creating prompt ");
	const prompt = `
		Imagine you are as a very smart AI chat bot for a big hospital, also a very well-skilled doctor. Base on all the data collected into our system 
		given by "Context sections" content below, you will receive "Question" below to try to analyze that patient data and provide personalized treatment plans, 
		medication recommendations, or therapy options for pre-stage imaging tasks with all of your knowledge. 
		If you are really really unsure, translated this sentence to Vietnamese and return "Sorry, I don't know how to help with that." 
		(note: you have to give answers in Vietnamese either).

    Context sections:
		- For some extra information (if needed), consider those illnesses listed above as chronic diseases: Alzheimer, Dementia (Mất trí nhớ), Arthritis (Viêm khớp), Asthma (Hen suyễn), 
		Cancer (Ung thư), Diabetes (Tiểu đường), Epilepsy (Động kinh), Heart disease (Bệnh tim), HIV/AIDS, Multiple sclerosis (Đa xơ cứng), Parkinson.
    - ${contextText}

    Question: """
    	${question}
    """

    Answer as markdown here (answer detailed, clearly and do not repeat the prompt above):
	`;

	console.log("---asking");
	const response = await openai.completions.create({
		model: "gpt-3.5-turbo-instruct",
		prompt,
		max_tokens: 1024,
		temperature: 0
	});

	console.log("---responding ")
	res.send({
		status: 200,
		message: response?.choices[0]?.text
	});
});

app.listen(5000, () => {
	console.log(`Server running on port: http://localhost:5000`);
});