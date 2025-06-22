import initRedis from "../helpers/redisClient.js";

const redisClient = await initRedis();

const cache = (ttlsec = 300) => {
	return async function cacheing(req, res, next) {
		try {
			const key = `__cache__${req.originalUrl}`;
			const cached = await redisClient.get(key);

			if (cached) {
				console.log(`[Redis] Cache hit for ${req.originalUrl}`);
				return res.status(200).json({
					success: true,
					message: `[Redis] Cache hit for ${req.originalUrl}`,
					data: JSON.parse(cached),
				});
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
