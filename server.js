import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

app.get("/session", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse",
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error generating ephemeral key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve the frontend (index.html) when accessing "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
