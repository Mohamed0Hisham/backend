import initRedis from "./redisClient.js";

const redisClient = await initRedis();

export const invalidateCache = async (paths = []) => {
	try {
		if (!Array.isArray(paths)) paths = [paths];

		for (const path of paths) {
			const key = `__cache__${path}`;
			await redisClient.del(key);
			console.log(`[Redis] Invalidated cache for: ${key}`);
		}
	} catch (err) {
		console.error("Error invalidating cache:", err);
	}
};
