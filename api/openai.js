export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey, messages, system } = req.body;
  if (!apiKey || !messages) return res.status(400).json({ error: 'Missing apiKey or messages' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: system || 'あなたはChatGPTです。与えられたテーマについてClaudeと議論しています。相手の意見を踏まえ、自分の立場から論理的かつ簡潔に意見を述べてください。日本語で返答してください。' },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
