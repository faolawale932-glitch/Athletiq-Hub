import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Auth Middleware
const authMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ HEALTH CHECK ============
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date() });
});

// ============ AUTHENTICATION ============
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        firstName,
        lastName,
      },
    });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ RESULTS ============
app.get('/api/v1/results', async (req: Request, res: Response) => {
  try {
    const results = await prisma.result.findMany({
      include: {
        user: { select: { id: true, username: true, profileImage: true } },
        comments: { include: { user: { select: { username: true } } } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.post('/api/v1/results', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, imageUrl, category, performance, performanceUnit, location } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const result = await prisma.result.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        performance: performance ? parseFloat(performance) : null,
        performanceUnit,
        location,
        userId: req.user!.id,
      },
      include: { user: { select: { username: true, profileImage: true } } },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create result' });
  }
});

app.put('/api/v1/results/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, category, performance, performanceUnit, location } = req.body;

    // Check ownership
    const result = await prisma.result.findUnique({ where: { id } });
    if (!result || result.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.result.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        category,
        performance: performance ? parseFloat(performance) : null,
        performanceUnit,
        location,
      },
      include: { user: { select: { username: true, profileImage: true } } },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update result' });
  }
});

app.delete('/api/v1/results/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check ownership
    const result = await prisma.result.findUnique({ where: { id } });
    if (!result || result.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.result.delete({ where: { id } });
    res.json({ message: 'Result deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

// ============ COMMENTS ============
app.post('/api/v1/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { resultId, content } = req.body;

    if (!resultId || !content) {
      return res.status(400).json({ error: 'resultId and content are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        resultId,
        userId: req.user!.id,
        content,
      },
      include: { user: { select: { username: true, profileImage: true } } },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.get('/api/v1/results/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await prisma.comment.findMany({
      where: { resultId: id },
      include: { user: { select: { username: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ============ LIKES ============
app.post('/api/v1/likes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { resultId } = req.body;

    if (!resultId) {
      return res.status(400).json({ error: 'resultId is required' });
    }

    // Check if already liked
    const existing = await prisma.like.findUnique({
      where: { resultId_userId: { resultId, userId: req.user!.id } },
    });

    if (existing) {
      return res.status(409).json({ error: 'Already liked' });
    }

    const like = await prisma.like.create({
      data: {
        resultId,
        userId: req.user!.id,
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like result' });
  }
});

app.delete('/api/v1/likes/:resultId/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { resultId, userId } = req.params;

    if (userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.like.delete({
      where: { resultId_userId: { resultId, userId } },
    });

    res.json({ message: 'Like removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
});

// ============ ERROR HANDLING ============
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
