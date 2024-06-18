# Steps to run project
`Copilot v2 to analyze patient data and provide personalized treatment plans, medication recommendations, or therapy options for pre-stage imaging tasks`
### 1. Rename
`.env.example` to `.env`
- Fill all values associated with keys

### 2. Run
`npm install`

### 3. Run
`npm run seed`
- This means seed data for AI to analyze custom data

### 4. Run
`npm start`
- Make a POST call to http://localhost:5000 to ask chatbot with the JSON body of:
`{ "question": "something_we_gonna_ask" }`