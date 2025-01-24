const dialogflow = require('@google-cloud/dialogflow');
const sessionClient = new dialogflow.SessionsClient();
const projectId = 'genai-437220'; // Replace with your Google Cloud project ID

async function detectIntent(sessionId, query) {
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId); // Ensure the correct session path

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: 'en-US', // Set languageCode as per your requirement
        },
      },
    };

    // Send request to Dialogflow
    const [response] = await sessionClient.detectIntent(request);
    
    // Extract the query result (fulfillmentText is the chatbot's response)
    const result = response.queryResult;
    console.log(`Detected intent: ${result.intent.displayName}`);
    console.log(`Fulfillment text: ${result.fulfillmentText}`);

    // Return the fulfillmentText as the response
    return { fulfillmentText: result.fulfillmentText };
    
  } catch (error) {
    console.error('Dialogflow error:', error);
    throw new Error('Error in Dialogflow request');
  }
}

module.exports = detectIntent;
