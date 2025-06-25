import { createClient } from "redis";

// async function initRedis() {
// 	const redisClient = createClient();
// 	redisClient.on("error", (err) => console.error("Redis Error:", err));
// 	await redisClient.connect();

// 	return redisClient;
// }
async function initRedis() {
	const client = createClient({
		username: "default",
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
		},
	});

	client.on("error", (err) => console.log("Redis Client Error", err));
	await client.connect();

	return client;
}

export default initRedis;
