export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey, messages } = req.body;
  if (!apiKey || !messages) return res.status(400).json({ error: 'Missing apiKey or messages' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'あなたはClaudeです。与えられたテーマについてChatGPTと議論しています。相手の意見を踏まえ、自分の立場から論理的かつ簡潔に意見を述べてください。日本語で返答してください。',
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    const content = data.content.map(b => b.text || '').join('');
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
