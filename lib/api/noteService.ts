import { ApiResponse, AuthState, Note } from "../types";
import api from "./axios";
import { generateId, getLocalStorageItem } from "../utils";
import { noteDB } from "../db";

const URL = "/note";
export const noteService = {
  async fetchLocalNotes(): Promise<Note[]> {
    return await noteDB.getAllNotes();
  },

  fetchServerNotes: async (): Promise<Note[]> => {
    const auth = getLocalStorageItem<AuthState>("auth", {} as AuthState);
    const userId = auth.user?.id;
    const response = await api.get<ApiResponse<Note[]>>(
      `${URL}/user/${userId}`
    );
    if (response.status == 204) {
      return [];
    }
    return response.data.data!;
  },

  createNote: async (note: Partial<Note>): Promise<Note> => {
    const newNote = {
      id: generateId(),
      ...note,
    };
    const response = await api.post<ApiResponse<Note>>(`${URL}`, newNote);
    return response.data.data!;
  },

  updateNote: async (note: Note): Promise<Note> => {
    const response = await api.put<ApiResponse<Note>>(
      `${URL}/${note.id}`,
      note
    );
    return response.data.data!;
  },

  async mergeNotes(notes: Note[]): Promise<void> {
    const response = await api.post<ApiResponse<void>>(`${URL}/merge`, notes);
  },

  deleteNote: async (id: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<boolean>>(`${URL}/${id}`);
    return response.data.data!;
  },
};
