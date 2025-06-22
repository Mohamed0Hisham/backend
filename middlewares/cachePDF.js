import initRedis from "../helpers/redisClient.js";

const redisClient = await initRedis();
const cachePDF = (keyGenerator, ttl = 3600) => {
	return async (req, res, next) => {
		try {
			const key = keyGenerator(req);

			const cachedPDF = await redisClient.get(key);
			if (cachedPDF) {
				console.log(`[Redis PDF] Cache hit: ${key}`);
				const buffer = Buffer.from(cachedPDF, "base64");
				res.setHeader("Content-Type", "application/pdf");
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=diagnosis_cached.pdf`
				);
				return res.end(buffer);
			}

			let chunks = [];
			const origWrite = res.write.bind(res);
			const origEnd = res.end.bind(res);

			res.write = (chunk) => {
				chunks.push(
					Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
				);
				return origWrite(chunk);
			};

			res.end = (chunk) => {
				if (chunk) chunks.push(Buffer.from(chunk));
				const finalBuffer = Buffer.concat(chunks);
				redisClient.setEx(key, ttl, finalBuffer.toString("base64"));
				return origEnd(chunk);
			};

			next();
		} catch (err) {
			console.error("Redis PDF caching error:", err);
			next();
		}
	};
};

export default cachePDF;
