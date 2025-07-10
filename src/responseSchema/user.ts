import Zod from "zod";

export const userSchema = Zod.object({
	id: Zod.string(),
	name: Zod.string(),
	email: Zod.string(),
});
