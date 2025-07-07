// import initRedis from "./redisClient.js";
// const redisClient = await initRedis();
import { getRedisClient } from "../helpers/redisClient.js";
const redisClient = await getRedisClient();

export const invalidateCache = async (paths = []) => {
	try {
		if (!Array.isArray(paths)) paths = [paths];

		for (const path of paths) {
			const pattern = `__cache__${path}`;
			if (pattern.includes("*")) {
				const stream = redisClient.scanIterator({
					MATCH: pattern,
					COUNT: 100,
				});

				for await (const key of stream) {
					await redisClient.del(key);
					console.log(`[Redis] Invalidated cache for: ${key}`);
				}
			}
			await redisClient.del(pattern);
			console.log(`[Redis] Invalidated cache for: ${pattern}`);
		}
	} catch (err) {
		console.error("Error invalidating cache:", err);
	}
};
