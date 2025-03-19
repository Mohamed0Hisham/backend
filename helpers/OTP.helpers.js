import bcrypt from "bcryptjs";

export function generateOTP() {
	const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
	return otp;
}

export async function hashOTP(otp) {
	const saltRounds = 10;
	const stringifiedOTP = String(otp);
	const hashed = await bcrypt.hash(stringifiedOTP, saltRounds);
	console.log("hashed is: ", hashed);

	return hashed;
}

export async function compareOTP(submittedOTP, storedHash) {
	const stringifiedOTP = String(submittedOTP);
	const compareResult = await bcrypt.compare(stringifiedOTP, storedHash);
	console.log("result is", compareResult);
	return compareResult;
}
