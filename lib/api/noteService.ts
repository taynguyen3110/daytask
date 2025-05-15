import { Note } from "../types";
import api from "./axios";
import { generateId } from "../utils";

const URL = "/note";
export const noteService = {
  fetchNotes: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>(`${URL}`);
    return response.data;
  },

  createNote: async (note: Partial<Note>): Promise<Note> => {
    const newNote = {
      id: generateId(),
      ...note,
    };
    const response = await api.post<Note>(`${URL}`, newNote);
    return response.data;
  },

  updateNote: async (note: Note): Promise<Note> => {
    const response = await api.put<Note>(`${URL}/${note.id}`, note);
    return response.data;
  },

  deleteNote: async (id: string): Promise<boolean> => {
   const response = await api.delete<boolean>(`${URL}/${id}`);
   return response.data;
  },
};
