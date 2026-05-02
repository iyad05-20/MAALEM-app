import { Router, Request, Response } from 'express';
import { callLLM, resetSession } from '../services/llm/llm-caller.js';

const router = Router();

/**
 * POST /api/chat
 * Main chat endpoint — receives user message and returns LLM response.
 * Image generation is handled internally if needed, and imageUrl is returned in this response.
 */
router.post('/', async (req: Request, res: Response) => {
  const { sessionId, message, photo } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ success: false, error: 'sessionId and message are required' });
  }

  const result = await callLLM({ sessionId, message, photo: photo || null });
  return res.json(result);
});

/**
 * POST /api/chat/reset
 * Clears the session from memory. Called when user cancels or completes an order.
 */
router.post('/reset', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'sessionId is required' });
  }

  const success = resetSession(sessionId);
  return res.json({ success });
});

export default router;
