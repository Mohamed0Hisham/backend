import mailerInstance from "./transporter.js";
import { otpTemplate } from "./templates/OTP.template.js";
import { AppointDelteTemplate } from "./templates/AppointDelete.template.js";
import { confirmationTemplate } from "./templates/confirmation.template.js";

class EmailService {
	constructor() {
		this.transporter = mailerInstance.getTransporter();
	}
	async _sendEmail(mailOptions) {
		try {
			await this.transporter.sendMail(mailOptions);
			console.log("Email sent successfully");
		} catch (error) {
			console.error("Error sending email:", error);
			throw new Error("Failed to send email: " + error.message);
		}
	}
	async confirmEmail(email, token) {
		const mailOptions = {
			from: {
				name: "noreply",
				address: process.env.MAIL_USER,
			},
			to: email,
			subject: "Confirm Your Sign-Up",
			html: confirmationTemplate(email, token),
		};

		await this._sendEmail(mailOptions);
	}
	async sendOTPEmail(email, name, otp) {
		const mailOptions = {
			from: {
				name: "noreply",
				address: process.env.MAIL_USER,
			},
			to: email,
			subject: "Your OTP for Verification",
			html: otpTemplate(name, otp),
		};

		await this._sendEmail(mailOptions);
	}
	async sendAppointmentDeletion(email, date) {
		const mailOptions = {
			from: {
				name: "noreply",
				address: process.env.MAIL_USER,
			},
			to: email,
			subject: "Appointment Deletion Notification",
			html: AppointDelteTemplate(date),
		};

		await this._sendEmail(mailOptions);
	}
}

export default new EmailService();
