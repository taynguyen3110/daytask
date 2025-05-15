import {mockApi} from "@/lib/mock/mockApi"
import { taskService } from "./taskService";
import { noteService } from "./noteService";

const api = {...mockApi, ...taskService, ...noteService};
// const api = mockApi;
export default api;
