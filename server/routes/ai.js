const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Initialize Hugging Face inference client
const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.warn('[AI ROUTE] No HF_TOKEN found in environment; AI generation will not work');
}
const hf = new HfInference(HF_TOKEN);

// POST /api/ai/generate
// Body: { prompt: string, negativePrompt?: string }
router.post('/generate', async (req, res) => {
  console.log('REQ BODY ===>', req.body);
  try {
    const { prompt, negativePrompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Call Hugging Face text-to-image inference (raw bytes)
    const output = await hf.textToImage(
      {
        model: 'prompthero/openjourney',
        inputs: prompt,
        parameters: negativePrompt ? { negative_prompt: negativePrompt } : undefined,
        options: {wait_for_model: true}
      },
      // { raw: true }
    );
    console.log('HF OUTPUT =>', output); // yahan pura JSON/error dikh jayega

    // output is Uint8Array
    const base64 = Buffer.from(output).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    res.json({ success: true, image: dataUrl });
  } catch (error) {
    console.error('Error generating image via HF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate image' });
  }
});

module.exports = router;
