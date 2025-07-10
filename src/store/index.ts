import { createAppStore } from "./app-store";
import { MainClient } from "../client";
import { RequestClient } from "../client/requests";
import { UserClient } from "../client/users"
// import { AppConfig } from "../config/index";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const mainClient = new MainClient(backendUrl);
export const requestClient = new RequestClient(backendUrl);
export const userClient = new UserClient(backendUrl);

export const useAppStore = createAppStore(mainClient);
