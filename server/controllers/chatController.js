import { generateReply } from '../services/gnaniService.js';

export async function postChat(req, res, next) {
  try {
    const { message, conversationId } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'message must be a non-empty string.' });
    if (message.length > 12000) return res.status(413).json({ error: 'message is too long (maximum 12,000 characters).' });
    const reply = await generateReply(message.trim(), conversationId);
    return res.json({ reply });
  } catch (error) { return next(error); }
}
