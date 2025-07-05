import { getRedisClient } from "../helpers/redisClient.js";
const redisClient = await getRedisClient();

const cache = (ttlsec = 300) => {
	return async function cacheing(req, res, next) {
		try {
			const key = `__cache__${req.originalUrl}`;
			const cached = await redisClient.get(key);

			if (cached) {
				console.log(`[Redis] Cache hit for ${req.originalUrl}`);
				return res.status(200).json(JSON.parse(cached));
			}

			const originalJson = res.json.bind(res);
			res.json = async (data) => {
				await redisClient.setEx(key, ttlsec, JSON.stringify(data));
				originalJson(data);
			};

			next();
		} catch (err) {
			console.error("Redis cache middleware error:", err);
			next();
		}
	};
};

export default cache;
