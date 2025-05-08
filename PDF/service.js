import pdf from "pdfkit";
import fs from "fs";
import { format, differenceInYears } from "date-fns";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class PDFService {
	constructor() {
		this.corporation = "MedEase";
		this.contact = "Tel: 0123456789 | Email: medease@healthylife.com";
		this.website = "www.medease.com";
		this.hospitalLogo = path.join(__dirname, "medease-logo.jpg");
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
		doc.moveDown(0.3);

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

			doc.fontSize(12)
				.font("Helvetica-Bold")
				.text(`Diagnosis: ${diagnosis.title}`)
				.font("Helvetica");

			doc.fontSize(11).font("Helvetica").text(diagnosis.description);

			if (diagnosis.recommendations) {
				doc.moveDown(0.5);
				doc.fontSize(11)
					.font("Helvetica-Bold")
					.text("Recommendations:");
				doc.fontSize(11)
					.font("Helvetica")
					.text(diagnosis.recommendations);
			}

			if (diagnosis.medications && diagnosis.medications.length > 0) {
				doc.moveDown(0.5);
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

			if (diagnosis.followUp) {
				doc.moveDown(0.5);
				doc.fontSize(11).font("Helvetica-Bold").text("Follow-up:");
				doc.fontSize(11).font("Helvetica").text(diagnosis.followUp);
			}

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
		doc.fontSize(10)
			.font("Helvetica")
			.text("Egypt Sharkia Diyarb Nejm", 140, 70);
		doc.fontSize(10)
			.font("Helvetica")
			.text("medease@healthylife.com", 140, 85);
		doc.fontSize(10)
			.font("Helvetica")
			.text("website.example.com", 140, 100);

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
		doc.fontSize(14).font("Helvetica-Bold").text("PATIENT INFORMATION");
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

	_calculateAge(dateOfBirth) {
		return differenceInYears(new Date(), new Date(dateOfBirth));
	}
}
const PDF = new PDFService();
export default PDF;
