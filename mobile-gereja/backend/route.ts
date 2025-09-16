import express from 'express';
import { verifyIdToken } from './auth';

// Router tanpa context
export const authRouter = () => {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    try {
      const { idToken } = req.body;

      const decoded = await verifyIdToken(idToken);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const firebaseUid = decoded.uid;
      const email = decoded.email ?? `${firebaseUid}@noemail.com`;

      // 🔹 contoh respons sederhana
      return res.json({
        user: {
          uid: firebaseUid,
          email,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
