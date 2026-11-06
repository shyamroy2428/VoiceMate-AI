import { synthesizeSpeech, transcribeAudio } from '../services/gnaniService.js';

export async function postTranscription(req, res, next) {
  try {
    if (!req.file?.buffer?.length) return res.status(400).json({ error: 'Attach an audio file in the audio field.' });
    const text = await transcribeAudio(req.file);
    return res.json({ text });
  } catch (error) { return next(error); }
}

export async function postSynthesis(req, res, next) {
  try {
    const { text, voice } = req.body ?? {};
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'text must be a non-empty string.' });
    if (text.length > 12000) return res.status(413).json({ error: 'text is too long (maximum 12,000 characters).' });
    const audio = await synthesizeSpeech(text.trim(), voice);
    return res.json(audio);
  } catch (error) { return next(error); }
}
