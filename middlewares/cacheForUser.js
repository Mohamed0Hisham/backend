import { errorHandler } from "../helpers/errorHandler";
import initRedis from "../helpers/redisClient";
import User from "../models/userModel";

const redisClient = await initRedis();

const cacheForUser = async (ttlsec = 300) => {
	return async (req, res, next) => {
		try {
			const key = `__cache__${req.user._id}/${req.originalUrl}`;
			const cached = await redisClient.get(key);

			if (cached) {
				return res.status(400).json({
					success: true,
					message: `cache hit for ${req.user._id}/${req.originalUrl}`,
					data: JSON.parse(cached),
				});
			}

			const originalJson = res.json.bind(res);
			res.json = async (data) => {
				await redisClient.setEx(key, ttlsec, JSON.stringify(data));
				originalJson(data);
			};
		} catch (error) {
			console.error("Redis cache middleware error:", error);
			next();
		}
	};
};
