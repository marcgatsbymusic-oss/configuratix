import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Ensure server directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

// Initialize SQLite database
const dbPath = path.join(__dirname, 'consent_audit.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
// To comply with GDPR, we store a hashed ID (e.g. hash of IP + User-Agent), timestamp, and the exact granular choices.
db.exec(`
  CREATE TABLE IF NOT EXISTS consent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hashed_user_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    url TEXT,
    necessary INTEGER NOT NULL,
    analytics INTEGER NOT NULL,
    marketing INTEGER NOT NULL
  )
`);

const insertLog = db.prepare(`
  INSERT INTO consent_logs (hashed_user_id, timestamp, url, necessary, analytics, marketing)
  VALUES (?, ?, ?, ?, ?, ?)
`);

app.use(cors());
app.use(express.json());

app.post('/api/log-consent', (req, res) => {
  try {
    const { choices, url, timestamp } = req.body;
    
    // Generate a privacy-preserving hash of the user's IP and User-Agent
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const salt = 'mammut-consent-salt-2026';
    const hashedUserId = crypto.createHash('sha256').update(ip + userAgent + salt).digest('hex');

    // Insert the audit record
    insertLog.run(
      hashedUserId,
      timestamp || new Date().toISOString(),
      url || '',
      choices?.necessary ? 1 : 0,
      choices?.analytics ? 1 : 0,
      choices?.marketing ? 1 : 0
    );

    res.status(200).json({ success: true, message: 'Consent logged securely.' });
  } catch (error) {
    console.error('Error logging consent:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`GDPR Consent Audit Logger running on http://localhost:${PORT}`);
});
