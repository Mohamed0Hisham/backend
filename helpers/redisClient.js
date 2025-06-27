import { createClient } from "redis";


/**
 * THIS IS FOR DEVELOPMENT
 */
// async function initRedis() {
// 	const redisClient = createClient();
// 	redisClient.on("error", (err) => console.error("Redis Error:", err));
// 	await redisClient.connect();

// 	return redisClient;
// }


/**
 * THIS IS FOR PRODUCTION
 */
let redisClient;

export async function getRedisClient() {
	if (redisClient && redisClient.isOpen) {
		return redisClient;
	}

	redisClient = createClient({
		socket: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
		},
		username: "default",
		password: process.env.REDIS_PASSWORD,
	});

	redisClient.on("error", (err) =>
		console.error("[Redis Client Error]", err)
	);

	if (!redisClient.isOpen) {
		await redisClient.connect();
	}

	return redisClient;
}


