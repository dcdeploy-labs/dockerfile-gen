import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Hello from Express.js with TypeScript!",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
