// import initRedis from "../helpers/redisClient.js";
// const redisClient = await initRedis();

import { getRedisClient } from "../helpers/redisClient.js";
const redisClient = await getRedisClient();

const cacheForUser = (ttlsec = 300) => {
	return async (req, res, next) => {
		try {
			const key = `__cache__${req.user._id}${req.originalUrl}`;
			const cached = await redisClient.get(key);

			if (cached) {
				console.log(
					`[Redis] Cache hit for ${req.user._id}${req.originalUrl}`
				);
				return res.status(200).json(JSON.parse(cached));
			}

			const originalJson = res.json.bind(res);
			res.json = async (data) => {
				await redisClient.setEx(key, ttlsec, JSON.stringify(data));
				originalJson(data);
			};

			next();
		} catch (error) {
			console.error("Redis cache middleware error:", error);
			next();
		}
	};
};

export default cacheForUser;
