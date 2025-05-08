import pdf from "pdfkit";
import fs from "fs";
import { format, differenceInYears } from "date-fns";

class PDFService {
	constructor() {
		this.corporation = "MedEase";
		this.contact = "Tel: 0123456789 | Email: medease@healthylife.com";
		this.website = "www.medease.com";
	}
	async generateDiagnosisPDF(patient, diagnoses) {
		const doc = new pdf({ margin: 50 });
		const diagnosesArray = Array.isArray(diagnoses)
			? diagnoses
			: [diagnoses];

		this._addHeader(doc);

		doc.fontSize(16)
			.font("Helvetica-Bold")
			.text("PATIENT DIAGNOSIS REPORT", { align: "center" });
		doc.moveDown();

		this._addPatientInfo(doc, patient);
		doc.moveDown();

		doc.fontSize(14).font("Helvetica-Bold").text("DIAGNOSIS INFORMATION");
		doc.moveDown(0.5);

		console.log(diagnosesArray)
		diagnosesArray.forEach((diagnosis, index) => {
			if (index > 0) doc.moveDown(0.5);

			console.log(diagnosis.date)
			console.log(diagnosis.doctor.name)
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

	_addPatientInfo(doc, patient) {
		doc.fontSize(12).font("Helvetica-Bold").text("PATIENT INFORMATION");
		doc.fontSize(11)
			.font("Helvetica")
			.text(`Name: ${patient.name} `)
			.text(`Patient ID: ${patient._id}`)
			.text(
				`Date of Birth: ${format(
					new Date(patient.dateOfBirth),
					"MMMM d, yyyy"
				)} (${this._calculateAge(patient.dateOfBirth)} years)`
			)
			.text(`Gender: ${patient.gender}`)
			.text(`Contact: ${patient.phone} | ${patient.email || "N/A"}`);

		if (patient.city) {
			doc.text(`Address: ${patient.city}-${patient.country}`);
		}
	}

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
			`Generated on ${format(new Date(), "MMMM d, yyyy [at] h:mm a")}`,
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

	_calculateAge(dateOfBirth) {
		return differenceInYears(new Date(), new Date(dateOfBirth));
	}
}
const PDF = new PDFService();
export default PDF;
