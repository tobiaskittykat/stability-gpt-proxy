import axios from 'axios';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { prompt } = req.body;

  try {
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('aspect_ratio', '1:1');
    form.append('mode', 'text-to-image');

    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`
        }
      }
    );

    res.status(200).json({ image: response.data.image });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Image generation failed.' });
  }
}
