const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        prompt,
        aspect_ratio: "1:1",
        mode: "text-to-image"
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ image: response.data.image });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Image generation failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
// redeploy trigger
