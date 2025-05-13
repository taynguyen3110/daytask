import {mockApi} from "@/lib/mock/mockApi"
import { taskService } from "./taskService";

const api = {...mockApi, ...taskService};

export default api;
