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