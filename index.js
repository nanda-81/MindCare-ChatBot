require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // To generate unique session IDs
const path = require('path');
const detectIntent = require('./dialogflow'); // Import Dialogflow function
// Import your custom chatbot logic
const chatbotLogic = require('./chatbot');


const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable PORT or default to 3000

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (like index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Ensure index.html is in the 'public' folder

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// POST endpoint to handle messages from the front-end or other services
app.post('/message', async (req, res) => {
  const userMessage = req.body.message; // The user's input message
  const sessionId = uuidv4(); // Generate a unique session ID for each interaction

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  console.log(`Received message: ${userMessage}`);

  try {
    // First, try your custom chatbot logic
    try {
      const chatbotResponse = await chatbotLogic(userMessage);
      if (chatbotResponse) {
        console.log(`Custom Chatbot Response: ${chatbotResponse}`);
        return res.status(200).json({ fulfillmentText: chatbotResponse });
      }
    } catch (chatbotError) {
      console.error('Custom Chatbot logic error, falling back to Dialogflow:', chatbotError);
    }

    // If no response from custom logic or if it fails, fallback to Dialogflow
    const dialogflowResponse = await detectIntent(sessionId, userMessage);
    console.log(`Dialogflow Response: ${dialogflowResponse.fulfillmentText}`);

    return res.status(200).json(dialogflowResponse);

  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ error: 'Error communicating with chatbot: ' + error.message });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Chatbot running at http://localhost:${PORT}`);
});
