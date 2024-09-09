import { createClient } from "redis";

// Create and configure the Redis client
const redisClient = createClient({
  url: "redis://localhost:6379",
});

// Handle Redis connection errors
redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis server and keep it connected
async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
}

// Initialize Redis connection and export both the client and connection function
await connectRedis(); // Ensure connection on app startup
export { redisClient };
