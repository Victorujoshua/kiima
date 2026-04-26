import { LoopsClient } from 'loops';

// Graceful null when key is not set (e.g. local dev without Loops configured).
// Each email function checks for null before calling — emails silently no-op.
export const loops = process.env.LOOPS_API_KEY
  ? new LoopsClient(process.env.LOOPS_API_KEY)
  : null;
