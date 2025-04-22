import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Get API key from environment variable
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Stability API key is not configured on the server.' });
  }

  try {
    // Log what is being sent (not key itself)
    console.log('[Stability Proxy] Generating image with prompt:', prompt);

    // Prepare request to Stability AI endpoint
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 90000 // up to 90 seconds
      }
    );

    // Validate response
    if (
      !response.data ||
      !response.data.artifacts ||
      !response.data.artifacts[0] ||
      !response.data.artifacts[0].base64
    ) {
      console.error('[Stability Proxy] Invalid response from Stability API:', response.data);
      return res.status(502).json({
        error: 'Invalid response from Stability AI.',
        details: response.data
      });
    }

    // Format as data URL
    const base64 = response.data.artifacts[0].base64;
    const image = `data:image/png;base64,${base64}`;

    res.status(200).json({ image });
  } catch (error) {
    // Log and respond with detailed error info
    console.error('[Stability Proxy] Error:', error?.response?.data || error.message);

    return res.status(500).json({
      error: 'Image generation failed',
      details: error?.response?.data || error.message
    });
  }
}
