import pdf from "pdfkit";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

class PDFService {
	constructor() {
		this.corporation = "MedEase";
		this.contact = "Tel: 0123456789 | Email: medease@healthylife.com";
		this.website = "www.medease.com";
	}
	async generateDiagnosisPDF(patient, diagnoses, option) {
		const doc = new pdf({ margin: 50 });
		const allDiagnoses = Array.isArray(diagnoses) ? diagnoses : [diagnoses];

		this._addHeader(doc);

		doc.fontSize(16)
			.font("Helvetica-Bold")
			.text("PATIENT DIAGNOSIS REPORT", { align: "center" });
		doc.moveDown();

		this._addPatientInfo(doc, patient);
		doc.moveDown();

		doc.fontSize(14).font("Helvetica-Bold").text("DIAGNOSIS INFORMATION");
		doc.moveDown(0.5);

		diagnosesArray.forEach((diagnosis, index) => {
			if (index > 0) doc.moveDown(0.5);

			doc.fontSize(11)
				.font("Helvetica-Bold")
				.text(
					`Date: ${format(
						new Date(diagnosis.date),
						"MMMM d, yyyy"
					)} | Doctor: ${diagnosis.doctor.name}`
				);

			// Main diagnosis
			doc.fontSize(12)
				.font("Helvetica-Bold")
				.text(`Diagnosis: ${diagnosis.title}`, { continued: true })
				.font("Helvetica")
				.text(` (ICD-10: ${diagnosis.icdCode || "N/A"})`);

			// Diagnosis details
			doc.fontSize(11).font("Helvetica").text(diagnosis.description);

			// Recommendations
			if (diagnosis.recommendations) {
				doc.moveDown(0.3);
				doc.fontSize(11)
					.font("Helvetica-Bold")
					.text("Recommendations:");
				doc.fontSize(11)
					.font("Helvetica")
					.text(diagnosis.recommendations);
			}

			// Medications
			if (diagnosis.medications && diagnosis.medications.length > 0) {
				doc.moveDown(0.3);
				doc.fontSize(11)
					.font("Helvetica-Bold")
					.text("Prescribed Medications:");

				diagnosis.medications.forEach((med) => {
					doc.fontSize(11)
						.font("Helvetica")
						.text(
							`• ${med.name} - ${med.dosage} - ${med.instructions}`
						);
				});
			}

			// Follow-up
			if (diagnosis.followUp) {
				doc.moveDown(0.3);
				doc.fontSize(11).font("Helvetica-Bold").text("Follow-up:");
				doc.fontSize(11).font("Helvetica").text(diagnosis.followUp);
			}

			// Add a separator line between diagnoses
			if (index < diagnosesArray.length - 1) {
				doc.moveDown();
				doc.strokeColor("#cccccc")
					.lineWidth(1)
					.moveTo(50, doc.y)
					.lineTo(doc.page.width - 50, doc.y)
					.stroke();
				doc.moveDown();
			}
		});

		this._addFooter(doc);
		doc.end();
		return doc;
	}
	_addHeader(doc) {
		try {
			// Add logo if exists
			if (fs.existsSync(this.hospitalLogo)) {
				doc.image(this.hospitalLogo, 50, 45, { width: 80 });
				doc.moveDown();
			}
		} catch (error) {
			// If logo doesn't exist, just use text
			console.warn("Hospital logo not found, using text header instead");
		}

		// Add hospital name and contact info
		doc.fontSize(18)
			.font("Helvetica-Bold")
			.text(this.hospitalName, 140, 50);
		doc.fontSize(10).font("Helvetica").text(this.hospitalAddress, 140, 70);
		doc.fontSize(10).font("Helvetica").text(this.hospitalContact, 140, 85);
		doc.fontSize(10).font("Helvetica").text(this.hospitalWebsite, 140, 100);

		// Add horizontal line
		doc.moveDown(2);
		doc.strokeColor("#000000")
			.lineWidth(1)
			.moveTo(50, doc.y)
			.lineTo(doc.page.width - 50, doc.y)
			.stroke();
		doc.moveDown();
	}

	/**
	 * Add patient information to PDF document
	 * @param {PDFDocument} doc - The PDF document
	 * @param {Object} patient - Patient information
	 * @private
	 */
	_addPatientInfo(doc, patient) {
		doc.fontSize(12).font("Helvetica-Bold").text("PATIENT INFORMATION");
		doc.fontSize(11)
			.font("Helvetica")
			.text(`Name: ${patient.firstName} ${patient.lastName}`)
			.text(`Patient ID: ${patient.patientId}`)
			.text(
				`Date of Birth: ${moment(patient.dateOfBirth).format(
					"MMMM D, YYYY"
				)} (${this._calculateAge(patient.dateOfBirth)} years)`
			)
			.text(`Gender: ${patient.gender}`)
			.text(`Contact: ${patient.phone} | ${patient.email || "N/A"}`);

		if (patient.address) {
			doc.text(`Address: ${patient.address}`);
		}
	}

	/**
	 * Add billing items table to the invoice PDF
	 * @param {PDFDocument} doc - The PDF document
	 * @param {Array} items - Billing items
	 * @private
	 */
	_addBillingTable(doc, items) {
		const tableTop = doc.y;
		const itemX = 50;
		const descriptionX = 150;
		const amountX = 400;

		// Add table headers
		doc.fontSize(11).font("Helvetica-Bold");
		doc.text("Item", itemX, tableTop);
		doc.text("Description", descriptionX, tableTop);
		doc.text("Amount", amountX, tableTop);

		doc.moveDown();
		let currentY = doc.y;

		// Add table lines
		doc.strokeColor("#cccccc")
			.lineWidth(1)
			.moveTo(itemX, currentY - 15)
			.lineTo(doc.page.width - 50, currentY - 15)
			.stroke();

		// Add items
		doc.fontSize(10).font("Helvetica");

		items.forEach((item) => {
			currentY = doc.y;

			doc.text(item.code || "N/A", itemX, currentY);
			doc.text(item.description, descriptionX, currentY, { width: 200 });
			doc.text(`$${item.amount.toFixed(2)}`, amountX, currentY);

			doc.moveDown();
		});

		// Add bottom line
		doc.strokeColor("#cccccc")
			.lineWidth(1)
			.moveTo(itemX, doc.y)
			.lineTo(doc.page.width - 50, doc.y)
			.stroke();

		doc.moveDown();
	}

	/**
	 * Add footer to PDF document
	 * @param {PDFDocument} doc - The PDF document
	 * @param {Object} options - Footer options
	 * @private
	 */
	_addFooter(doc, options = {}) {
		// Move to bottom of page
		doc.fontSize(8).font("Helvetica");
		const footerPosition = doc.page.height - 50;

		if (options.includeDisclaimer) {
			doc.text(
				"DISCLAIMER: This prescription is valid only if presented within 30 days of the date shown above.",
				50,
				footerPosition - 30,
				{ align: "center" }
			);
		}

		// Add page number and confidentiality notice
		doc.text(
			`Generated on ${moment().format("MMMM D, YYYY [at] h:mm A")}`,
			50,
			footerPosition,
			{ align: "center" }
		);

		doc.text(
			"CONFIDENTIAL: This document contains protected health information. Unauthorized disclosure is prohibited by law.",
			50,
			footerPosition + 15,
			{ align: "center" }
		);
	}

	/**
	 * Calculate age from date of birth
	 * @param {Date|String} dateOfBirth - Date of birth
	 * @returns {Number} - Age in years
	 * @private
	 */
	_calculateAge(dateOfBirth) {
		return moment().diff(moment(dateOfBirth), "years");
	}
}
const PDF = new PDFService();
export default PDF;
