import Zod from "zod";
import { Client } from "./abstract";
import { userSchema } from "../responseSchema/user";

export class UserClient extends Client {
	constructor(url: string) {
		super(url);
	}

	async createNewUser(
		data: {
			name: string;
			email: string;
		}
	) {
		const res = await this.request("POST", `/api/users/newUser`, {
			data: data,
		});
		const unprocessedData = userSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async updateUser(
		userId: string,
		userData: {
			name: string;
		}
	) {
		const res = await this.request(
			"POST",
			`/api/users/updateUser/${userId}`,
			{
				data: userData,
			}
		);
		const unprocessedData = userSchema.safeParse(res?.data);
		if (!unprocessedData.data) {
			throw new Error("Invalid data from backend");
		}
		return unprocessedData.data;
	}

	async delete(id: string) {
		await this.request("DELETE", `/api/users/${id}`);
		return;
	}

	async list() {
		const res = await this.request("GET", "api/users/listUsers");
		const body = Zod.array(Zod.any()).safeParse(res?.data);
		if (!body.success) {
			throw new Error("Invalid data for backend");
		}
		const array: Array<typeof userSchema._type> = [];
		body.data.forEach((ele) => {
			try {
				const parsedData = userSchema.parse(ele);
				array.push(parsedData);
			} catch (error) {
				console.error(error);
			}
		});
		return array;
	}
}