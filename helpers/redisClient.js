const { createClient } = require("redis");

async function initRedis() {
	const redisClient = createClient();
	redisClient.on("error", (err) => console.error("Redis Error:", err));
	await redisClient.connect();

	return redisClient;
}

export default initRedis;
