import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Health check endpoints (before CORS to avoid auth issues)
app.get("/make-server-10238d4d/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Server is running" });
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  return user;
}

// Sign up endpoint
app.post("/make-server-10238d4d/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error during request processing: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Process detection endpoint (simulated)
app.post("/make-server-10238d4d/detect", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { filename, fileType } = await c.req.json();
    
    // Simulate detection processing
    const detections: Array<{
      type: string;
      confidence: number;
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null;
    }> = [];
    const hasHelmetViolation = Math.random() > 0.5;
    const hasTripleRiding = Math.random() > 0.3;
    
    if (hasHelmetViolation) {
      detections.push({
        type: "Helmet Violation",
        confidence: 0.85 + Math.random() * 0.14,
        bbox: {
          x: Math.random() * 200,
          y: Math.random() * 200,
          width: 100 + Math.random() * 100,
          height: 80 + Math.random() * 80
        }
      });
    }
    
    if (hasTripleRiding) {
      detections.push({
        type: "Triple Riding Detected",
        confidence: 0.78 + Math.random() * 0.2,
        bbox: {
          x: Math.random() * 300,
          y: Math.random() * 250,
          width: 150 + Math.random() * 150,
          height: 120 + Math.random() * 120
        }
      });
    }
    
    if (detections.length === 0) {
      detections.push({
        type: "No Violations Detected",
        confidence: 0.95,
        bbox: null
      });
    }
    
    // Store result in history
    const historyEntry = {
      userId: user.id,
      filename,
      fileType,
      detections,
      timestamp: new Date().toISOString(),
      processed: true
    };
    
    const historyKey = `history:${user.id}:${Date.now()}`;
    await kv.set(historyKey, historyEntry);
    
    return c.json({
      success: true,
      detections,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.log(`Detection processing error: ${error}`);
    return c.json({ error: "Failed to process detection" }, 500);
  }
});

// Get user history
app.get("/make-server-10238d4d/history", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const historyKey = `history:${user.id}`;
    const historyEntries = await kv.getByPrefix(historyKey);
    
    // Sort by timestamp descending
    const sortedHistory = historyEntries.sort((a, b) => 
      new Date(b.value.timestamp).getTime() - new Date(a.value.timestamp).getTime()
    );
    
    return c.json({ history: sortedHistory.map(entry => entry.value) });
    
  } catch (error) {
    console.log(`History fetch error: ${error}`);
    return c.json({ error: "Failed to fetch history" }, 500);
  }
});

// Update user profile
app.post("/make-server-10238d4d/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await verifyAuth(authHeader);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { name } }
    );
    
    if (error) {
      console.log(`Profile update error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
    
  } catch (error) {
    console.log(`Profile update error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

Deno.serve(app.fetch);