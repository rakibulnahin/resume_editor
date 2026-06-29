import React, { useState } from 'react';

export default function OpenRouterChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    // Access the key safely from environment configurations
    const apiKey = process.env.REACT_APP_OPENROUTER_KEY;

    try {
      console.log(apiKey);
      
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          // OpenRouter requires these headers to rank your app on their leaderboard (Optional)
          "HTTP-Referer": window.location.origin, 
          "X-Title": "My Resume Builder App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // You can choose any model OpenRouter supports (e.g., meta-llama/llama-3-8b-instruct)
          model: "openrouter/free", 
          messages: [
            { role: "system", content: "You are an expert resume writer. Help the user improve their text." },
            { role: "user", content: input }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error Status: ${res.status}`);
      }

      const data = await res.json();
      
      // Extract the text response message safely out of the standard OpenAI response format
      const aiMessage = data.choices?.[0]?.message?.content || "No response received.";
      setResponse(aiMessage);

    } catch (err) {
      console.error("OpenRouter Fetch Error:", err);
      setError(err.message || "Something went wrong while talking to the model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h3>AI Resume Assistant</h3>
      <form onSubmit={handleAskAI} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI to generate a professional summary or optimize a job description point..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Thinking...' : 'Optimize Text'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}
      
      {response && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <strong>AI Suggestions:</strong>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px', lineHeight: '1.5' }}>{response}</p>
        </div>
      )}
    </div>
  );
}


// from continuing conversation do not work on build or deploy application as i will work in local only change files needed and summarize the changes and its location with what changed

// create another js file in the components folder so that it can be used 
// as a component for the task below
// in the header create a button "Tailor with AI" when the button is clicked 
// it will show another screen upper part of screen will have a dropdown menu of 
// multiple ai models and text area to write api key then a button "start tailor" 
// that will send a request to openrouter with the resumeData and a expect a json 
// of similar structure to resumeData or upload JSON

// in the next part of the screen will show when the status of request 
// "thinking" when the request is successsful and waiting for response 
// "Sorry, bad request" when problem with request and also shows the reason for bad request
// "Successfull" when the request and response is successsful and also shows the json response 

// at the end of the section there will be a close button at the 
// bottom right to close the screen and at the left of this button will be another
// button "export tailored json" which if there is a response will be clickable 
// else not and when the "export tailored json" is clicked if there is a json response 
// will update the resumeData

// Here is a highly condensed, token-optimized version of your request. It retains all logic, UI components, states, and data flows while stripping out filler words to save tokens.

// ---

// ### Optimized Prompt

// Create a "Tailor with AI" header button. Clicking it opens a modal/screen with these sections:

// **1. Configuration Section (Top):**

// * Dropdown for AI models.
// * Text area for API key.
// * "Start Tailor" button: Sends request to OpenRouter with `resumeData`. Expects JSON matching `resumeData` structure.

// **2. Status & Response Section (Middle):**

// * **Loading:** Show "thinking" while waiting for response.
// * **Error:** Show "Sorry, bad request" + error reason if request fails.
// * **Success:** Show "Successful" + display the returned JSON response.

// **3. Action Section (Bottom):**

// * Left: "Export Tailored JSON" button. Disabled by default. Enabled only on Success. Clicking updates `resumeData` with the new JSON.
// * Right: "Close" button to dismiss the screen.