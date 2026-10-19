import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Catalog in-memory cache for server API
const CATALOG_ITEMS = [
  {
    id: 'anime-shadowblade',
    title: 'Shadowblade: Kyoto Eclipse',
    alternateTitle: '陰陽刃: 京都日食 (Kage Yaiba)',
    type: 'anime_series',
    genres: ['Action', 'Fantasy', 'Supernatural', 'Cyberpunk'],
    audioLanguages: ['Telugu', 'Hindi', 'Japanese', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi', 'Japanese'],
    synopsis: 'In a neon-drenched feudal neo-Kyoto, a disgraced samurai alchemist uncovers a forbidden syndicate bending spiritual energy. Featuring legendary sword duels, sacred relics, and an underworld rebellion.',
    ratingScore: 9.4,
  },
  {
    id: 'anime-chrono-valkyrie',
    title: 'Chrono Valkyrie: Infinite Loop',
    alternateTitle: 'クロノ・ワルキューレ: 無限の境界',
    type: 'anime_series',
    genres: ['Sci-Fi', 'Mecha', 'Action', 'Mystery'],
    audioLanguages: ['Telugu', 'Hindi', 'Japanese', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi'],
    synopsis: 'When a temporal disaster shatters reality into recurring loops, flight ace Lyra must pilot the Chrono Frame to prevent the singularity that erases humanity.',
    ratingScore: 9.1,
  },
  {
    id: 'anime-garden-stars',
    title: 'Garden of Whispering Stars',
    alternateTitle: '星をささやく庭園',
    type: 'anime_movie',
    genres: ['Romance', 'Fantasy', 'Drama', 'Adventure'],
    audioLanguages: ['Telugu', 'Hindi', 'Japanese', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi', 'Japanese'],
    synopsis: 'An exquisite animated masterpiece following an astronomer and a spectral traveler who tend to a celestial observatory that keeps cosmic memories alive before they dissolve into stardust.',
    ratingScore: 9.6,
  },
  {
    id: 'movie-suryavanshi',
    title: 'Suryavanshi: The Golden Citadel',
    alternateTitle: 'సూర్యవంశి: స్వర్ణ దుర్గం',
    type: 'movie',
    genres: ['Action', 'Historical', 'Drama', 'Epic'],
    audioLanguages: ['Telugu', 'Hindi', 'Tamil', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi'],
    synopsis: 'An epic historical action drama charting the fierce defense of the legendary Deccan fortress against overwhelming imperial legions, filled with valor, grand chariot combat, and political intrigue.',
    ratingScore: 9.3,
  },
  {
    id: 'series-hyderabad-confidential',
    title: 'Hyderabad Confidential',
    alternateTitle: 'హైదరాబాద్ కాన్ఫిడెన్షియల్',
    type: 'series',
    genres: ['Thriller', 'Crime', 'Mystery', 'Tech'],
    audioLanguages: ['Telugu', 'Hindi', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi'],
    synopsis: 'A gritty cyber-crime thriller set in the twin cities of Hyderabad and Secunderabad, where an eccentric digital forensics agent races against a shadow syndicate targeting smart city grid infrastructure.',
    ratingScore: 8.9,
  },
  {
    id: 'anime-blade-dragon-god',
    title: 'Blade of the Dragon God',
    alternateTitle: '竜神の剣',
    type: 'anime_series',
    genres: ['Action', 'Fantasy', 'Mythology', 'Martial Arts'],
    audioLanguages: ['Telugu', 'Hindi', 'Japanese', 'English'],
    subtitleLanguages: ['English', 'Telugu'],
    synopsis: 'A banished prince discovers his bloodline bears the ancestral pact with the Azure Dragon God, thrusting him into war against the Iron Shogunate.',
    ratingScore: 9.2,
  },
  {
    id: 'movie-vortex-secrets',
    title: 'Vortex of Secrets',
    alternateTitle: 'రహస్య సుడిగుండం',
    type: 'movie',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    audioLanguages: ['English', 'Telugu', 'Hindi'],
    subtitleLanguages: ['English', 'Hindi', 'Telugu'],
    synopsis: 'A deep-sea research station off the coast of the Bay of Bengal encounters anomalous magnetic readings and a submerged megalith that defies oceanic geology.',
    ratingScore: 8.7,
  },
  {
    id: 'movie-deva-vajra',
    title: 'Deva: The Celestial Vajra',
    alternateTitle: 'దేవ: వజ్రాయుధం',
    type: 'movie',
    genres: ['Action', 'Mythology', 'Fantasy', 'Sci-Fi'],
    audioLanguages: ['Telugu', 'Hindi', 'Tamil', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi'],
    synopsis: 'When cosmic meteors release primordial elemental weapons across ancient India, an orphaned blacksmith apprentice discovers he can wield the lightning blade Vajra to protect humanity.',
    ratingScore: 9.5,
  },
  {
    id: 'anime-ronin-zero',
    title: 'Ronin Zero: Cyber Kenshin',
    alternateTitle: '浪人ゼロ: 電脳剣心',
    type: 'anime_series',
    genres: ['Action', 'Cyberpunk', 'Martial Arts', 'Sci-Fi'],
    audioLanguages: ['Telugu', 'Hindi', 'Japanese', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Japanese'],
    synopsis: 'In year 2105 Neo-Tokyo, a masterless cyborg ronin protects innocent slum cybernetics clinics from corporate retrieval assassins using plasma-coated katanas.',
    ratingScore: 9.3,
  },
  {
    id: 'anime-nebula-dreams',
    title: 'Nebula Dreams Across Time',
    alternateTitle: '星雲の夢 (Seiun no Yume)',
    type: 'anime_movie',
    genres: ['Romance', 'Sci-Fi', 'Drama', 'Fantasy'],
    audioLanguages: ['Japanese', 'Telugu', 'Hindi', 'English'],
    subtitleLanguages: ['English', 'Telugu', 'Hindi', 'Japanese'],
    synopsis: 'A heartfelt romantic sci-fi anime about two parallel lives separated by an interstellar warp gateway who communicate through musical frequencies.',
    ratingScore: 9.4,
  },
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      hlsStreaming: 'active',
      rbacEnabled: true,
    },
  });
});

// Gemini AI Entertainment Assistant Endpoint
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Server] GEMINI_API_KEY missing, using catalog semantic fallback');
      const keywords = prompt.toLowerCase();
      const matched = CATALOG_ITEMS.filter((item) => {
        return (
          item.title.toLowerCase().includes(keywords) ||
          item.genres.some((g) => keywords.includes(g.toLowerCase())) ||
          (keywords.includes('telugu') && item.audioLanguages.includes('Telugu')) ||
          (keywords.includes('anime') && item.type.startsWith('anime')) ||
          (keywords.includes('movie') && item.type === 'movie')
        );
      });

      return res.json({
        reply: `Based on your interest in "${prompt}", here are the top matching titles from the YEP Streamer catalog:`,
        recommendedIds: (matched.length ? matched : CATALOG_ITEMS.slice(0, 3)).map((m) => m.id),
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const catalogSummary = CATALOG_ITEMS.map(
      (c) =>
        `ID: ${c.id} | Title: ${c.title} | Type: ${c.type} | Genres: ${c.genres.join(', ')} | Audios: ${c.audioLanguages.join(', ')} | Synopsis: ${c.synopsis}`
    ).join('\n');

    const systemInstruction = `You are YEP Streamer's official Entertainment AI Assistant.
The user is searching for anime, cinema, or web series.
Here is the VERIFIED YEP Streamer catalog:
${catalogSummary}

CRITICAL RULES:
1. ONLY recommend titles that exist in the catalog above. Never invent titles or claim unavailable languages.
2. In your response, provide an enthusiastic, cinematic 2-3 sentence recommendation explaining why the titles match the user's prompt.
3. At the very end of your response, on a new line, provide the recommended IDs in JSON array format: [[RECOMMENDED_IDS: ["id1", "id2"]]].`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Search: ${prompt}` }] },
      ],
    });

    const text = response.text || '';
    let reply = text;
    let recommendedIds: string[] = [];

    const idMatch = text.match(/\[\[RECOMMENDED_IDS:\s*(\[.*?\])\]\]/);
    if (idMatch) {
      try {
        recommendedIds = JSON.parse(idMatch[1]);
        reply = text.replace(/\[\[RECOMMENDED_IDS:\s*\[.*?\]\]\]/, '').trim();
      } catch {
        // Fallback id extraction
      }
    }

    if (recommendedIds.length === 0) {
      // Find matches mentioned by name in text
      recommendedIds = CATALOG_ITEMS.filter((item) =>
        text.toLowerCase().includes(item.title.toLowerCase())
      ).map((item) => item.id);
    }

    return res.json({ reply, recommendedIds });
  } catch (err: any) {
    console.error('[Server] Gemini AI error:', err);
    return res.status(500).json({
      error: 'AI assistant temporarily unavailable',
      message: err.message,
    });
  }
});

// Admin Passcode Verification Endpoint (Keeps passcodes strictly on server)
app.post('/api/auth/admin-verify', (req, res) => {
  const { passcode } = req.body;
  if (!passcode) {
    return res.status(400).json({ success: false, error: 'Passcode is required' });
  }

  // Passcode 1: Content Manager (No delete options shown anywhere)
  if (passcode === '9989032137') {
    return res.json({
      success: true,
      role: 'content_manager',
      levelName: 'Content Manager (Edit & Upload Mode)',
      canDelete: false,
      adminToken: 'token_mgr_' + Date.now().toString(36),
    });
  }

  // Passcode 2: Super Admin (Delete options enabled)
  if (passcode === '9492335119') {
    return res.json({
      success: true,
      role: 'admin',
      levelName: 'Super Administrator (Full Master Control)',
      canDelete: true,
      adminToken: 'token_super_' + Date.now().toString(36),
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Incorrect admin passcode. Access denied.',
  });
});

// Start Server & mount Vite in Development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[YEP Streamer] Mounted Vite middlewares in dev mode');
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YEP Streamer] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
