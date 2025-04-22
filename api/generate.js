const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
app.use(express.json());

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("mode", "text-to-image");
    formData.append("aspect_ratio", "1:1");

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${STABILITY_API_KEY}`
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
