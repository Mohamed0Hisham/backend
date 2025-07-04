import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class Mailer {
	constructor() {
		if (!Mailer.instance) {
			this.transporter = nodemailer.createTransport({
				service: "gmail",
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASSWORD,
				},
			});
			Mailer.instance = this;
		}
		return Mailer.instance;
	}

	getTransporter() {
		return this.transporter;
	}
}

const mailerInstance = new Mailer();
Object.freeze(mailerInstance);

export default mailerInstance;
