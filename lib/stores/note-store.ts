"use client"

import { create } from "zustand"
import type { Note } from "@/lib/types"
import { generateId, getLocalStorageItem, setLocalStorageItem } from "@/lib/utils"

interface NoteStore {
  notes: Note[]
  fetchNotes: () => Promise<void>
  createNote: (note: Partial<Note>) => Promise<Note>
  updateNote: (note: Note) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
}

// Mock API functions
const api = {
  fetchNotes: async (): Promise<Note[]> => {
    // In a real app, this would be an API call
    return getLocalStorageItem<Note[]>("notes", [])
  },

  createNote: async (note: Partial<Note>): Promise<Note> => {
    // In a real app, this would be an API call
    const notes = getLocalStorageItem<Note[]>("notes", [])
    const newNote: Note = {
      id: generateId(),
      content: note.content || "",
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || new Date().toISOString(),
    }

    notes.push(newNote)
    setLocalStorageItem("notes", notes)
    return newNote
  },

  updateNote: async (note: Note): Promise<Note> => {
    // In a real app, this would be an API call
    const notes = getLocalStorageItem<Note[]>("notes", [])
    const index = notes.findIndex((n) => n.id === note.id)

    if (index !== -1) {
      notes[index] = {
        ...note,
        updatedAt: new Date().toISOString(),
      }
      setLocalStorageItem("notes", notes)
    }

    return note
  },

  deleteNote: async (id: string): Promise<void> => {
    // In a real app, this would be an API call
    const notes = getLocalStorageItem<Note[]>("notes", [])
    const filteredNotes = notes.filter((note) => note.id !== id)
    setLocalStorageItem("notes", filteredNotes)
  },
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],

  fetchNotes: async () => {
    try {
      const notes = await api.fetchNotes()
      set({ notes })
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  },

  createNote: async (note: Partial<Note>) => {
    try {
      const newNote = await api.createNote(note)

      set((state) => ({
        notes: [...state.notes, newNote],
      }))

      return newNote
    } catch (error) {
      console.error("Error creating note:", error)
      throw error
    }
  },

  updateNote: async (note: Note) => {
    try {
      const updatedNote = await api.updateNote(note)

      set((state) => ({
        notes: state.notes.map((n) => (n.id === note.id ? updatedNote : n)),
      }))

      return updatedNote
    } catch (error) {
      console.error("Error updating note:", error)
      throw error
    }
  },

  deleteNote: async (id: string) => {
    try {
      await api.deleteNote(id)

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }))
    } catch (error) {
      console.error("Error deleting note:", error)
      throw error
    }
  },
}))
