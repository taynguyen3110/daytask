import {mockApi} from "@/lib/mock/mockApi"
import { taskService } from "./taskService";
import { noteService } from "./noteService";
import { telegramService } from "./telegramService";

const api = {...taskService, ...noteService, ...telegramService};
// const api = mockApi;
export default api;
