import Zod from "zod";
import {
	requestSchema,
	requestDetailsSchema,
	documentDetailsSchema,
	commonProblemsSchema,
	wardProblemsSchema,
	analysisSchema,
	issueDetailsSchema,
	wardAnalysisSchema
} from "../responseSchema/request";

import { Client } from "./abstract";

export class RequestClient extends Client {
	constructor(url: string) {
		super(url);
	}

	async createNewReq(formData: FormData) {
		const res = await this.request("POST", `/api/requests/newReq`, {
			headers: {
				"Content-Type": "multipart/form-data"
			},
			data: formData,
		}
		);
		const unprocessedData = requestSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async getAllReq() {
		const res = await this.request("GET", `/api/requests/listRequests`);
		const unprocessedData = Zod.array(requestSchema).safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async deleteReq(id: string) {
		await this.request("DELETE", `/api/requests/deleteReq/${id}`);
		return;
	}

	async viewReport(reqId: string) {
		await this.request("GET", `/api/requests/viewReport/${reqId}`);
	}

	async getReqPreview(reqId: string): Promise<Blob> {
		const res = await this.request(
			"GET",
			`/api/requests/reqPreview/${reqId}`,
			{
				responseType: "blob",
				headers: {
					Accept: "application/pdf",
				},
			});

		return res.data;
	}

	async getRequestDetails(reqId: string) {
		const res = await this.request("GET", `/api/requests/reqDetails/${reqId}`);
		const validData = requestDetailsSchema.safeParse(res?.data);
		if (!validData.data) {
			throw new Error("Invalid data from backend");
		}
		return validData.data;
	}

	async generateReq(reqId: string) {
		await this.request("POST", `/api/requests/generateReq/${reqId}`);
	}

	async getDocumentDetails({ id, docId }: {
		id: string,
		docId: string
	}) {
		const res = await this.request("GET", `/api/requests/docDetails/${id}/${docId}`);
		const validData = documentDetailsSchema.safeParse(res?.data);
		if (!validData.data) {
			console.log("Invalid data from backend : ", res);
			throw new Error("Invalid data from backend");
		}
		return validData.data;
	}

	async downloadDocImage({ id, docId }: { id: string, docId: string }) {
		const res = await this.request("GET", `api/requests/downloadDocImage/${id}/${docId}`,
			{ responseType: "blob" }
		);
		return res.data;
	}

	async getCommonProblems(id: string) {
		const res = await this.request("GET", `/api/requests/commonProblems/${id}`);
		const validatedData = commonProblemsSchema.safeParse(res?.data);
		if (!validatedData.data) {
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;
	}

	async getGroupedIssues({ id, problemIds }: { id: string, problemIds: { docId: string; problemId: string }[] }) {
		const res = await this.request("POST", `/api/requests/groupedIssues/${id}`, {
			data: problemIds
		});
		const validatedData = Zod.array(issueDetailsSchema).safeParse(res.data);
		if (!validatedData.success) {
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;

	}

	async getGroupedWardIssues({ id, problemIds }: { id: string, problemIds: string[] }) {
		const res = await this.request("POST", `/api/requests/groupedWardIssues/${id}`, {
			data: problemIds
		});
		const validatedData = Zod.array(issueDetailsSchema).safeParse(res.data);

		if (!validatedData.success) {
			console.error("Validation failed", validatedData.error.format());
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;
	}

	async getWardWiseReport(id: string) {
		const res = await this.request("GET", `/api/requests/wardWiseReport/${id}`);
		const validatedData = wardProblemsSchema.safeParse(res?.data);
		if (!validatedData.data) {
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;
	}

	async getAnalysis(id: string) {
		const res = await this.request("GET", `/api/requests/analysis/${id}`);
		const validatedData = analysisSchema.safeParse(res?.data);
		if (!validatedData.data) {
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;
	}

	async getTaggedDocs({ reqId, issue }: { reqId: string; issue: string }) {
		const res = await this.request("GET", `/api/requests/taggedDocs/${reqId}/${issue}`);

		const validatedData = Zod.array(issueDetailsSchema).safeParse(res.data);

		if (!validatedData.success) {
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;
	}

	async getWardIssueProblems({ id, ward, issue }: { id: string; ward: string; issue: string }) {
		const res = await this.request("GET", `/api/requests/wardIssueProblems/${id}/${ward}/${issue}`);
		const validatedData = Zod.array(wardAnalysisSchema).safeParse(res.data);

		if (!validatedData.success) {
			throw new Error("Invalid report data from backend");
		}
		return validatedData.data;
	}

	// async getReportDetails(id: string) {
	// 	const res = await this.request("GET", `/api/requests/reportDetails/${id}`);
	// 	const validatedData = requestDetailsSchema.safeParse(res?.data);
	// 	console.log("report res : ", res);
	// 	if(! validatedData.data) {
	// 		throw new Error("Invalid report data from backend");
	// 	}
	// 	return validatedData.data;
	// }
};
