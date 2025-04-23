import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Check the API key is set correctly on Vercel
  if (!process.env.STABILITY_API_KEY) {
    return res.status(500).json({ error: 'Stability API key is not configured' });
  }

  try {
    // Request image generation
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Accept': 'application/json',
        }
      }
    );

    const base64 = response.data.artifacts[0]?.base64;
    if (!base64) {
      return res.status(500).json({ error: 'Invalid image data from Stability API' });
    }

    // Send as base64 (matches your schema: { image: "..." })
    res.status(200).json({ image: `data:image/png;base64,${base64}` });
  } catch (err) {
    res.status(500).json({ 
      error: 'Image generation failed', 
      details: err.response?.data || err.message 
    });
  }
}

  }
}
