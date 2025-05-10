"use client"

import { create } from "zustand"
import type { Note } from "@/lib/types"
import api from "@/lib/api"

interface NoteStore {
  notes: Note[]
  fetchNotes: () => Promise<void>
  createNote: (note: Partial<Note>) => Promise<Note>
  updateNote: (note: Note) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
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
