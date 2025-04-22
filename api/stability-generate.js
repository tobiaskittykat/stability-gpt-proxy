import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.STABILITY_API_KEY) {
    return res.status(500).json({ error: 'Stability API key is not configured' });
  }

  try {
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        prompt: prompt,
        aspect_ratio: '1:1',
        mode: 'text-to-image',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
      }
    );

    // Return the image URL or base64 data
    res.status(200).json({ image: response.data.image });
  } catch (err) {
    console.error('Stability API error:', err.response?.data || err.message);

    res.status(500).json({
      error: 'Image generation failed',
      details: err.response?.data || err.message,
    });
  }
}
