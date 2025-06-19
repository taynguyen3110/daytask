"use client";

import { create } from "zustand";
import type { AuthState, Note, SyncNote, UserMode } from "@/lib/types";
import api from "@/lib/api";
import { generateId, getLocalStorageItem } from "../utils";
import { noteDB } from "../db";
import { persist } from "zustand/middleware";

interface NoteStore {
  notes: Note[];
  pendingSync: SyncNote[];
  fetchNotes: () => Promise<void>;
  createNote: (note: Partial<Note>, userMode: UserMode) => Promise<Note>;
  updateNote: (note: Note, userMode: UserMode) => Promise<Note>;
  deleteNote: (id: string, userMode: UserMode) => Promise<void>;
  syncNotes: () => Promise<void>;
  mergeNotes: () => Promise<void>;
  removeLocalNotes: () => Promise<void>;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      pendingSync: [],

      fetchNotes: async () => {
        try {
          const notes = await api.fetchLocalNotes();
          set({ notes });
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      },

      createNote: async (note: Partial<Note>, userMode: UserMode) => {
        const auth = getLocalStorageItem<AuthState>("auth", {} as AuthState);
        const currentUser = auth.user;
        const newNote: Note = {
          id: generateId(),
          content: note.content || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: currentUser?.id || null,
        };

        try {
          if (userMode === "online-user") {
            // Create the note on the server
            await api.createNote(newNote);
          } else if (userMode === "offline-user") {
            const syncAction: SyncNote = {
              action: "add",
              note: { ...newNote } as Note,
              timestamp: Date.now(),
            };

            set((state) => ({
              pendingSync: [...state.pendingSync, syncAction],
            }));
            console.log("Adding sync action for offline user:", syncAction);
            console.log(get().pendingSync);
          }
          // Add the note to the local database
          await noteDB.addNote(newNote);
          // Add the note to the state
          set((state) => ({ notes: [...state.notes, newNote] }));
          return newNote;
        } catch (error) {
          console.error("Error creating note:", error);
          throw error;
        }
      },

      updateNote: async (note: Note, userMode: UserMode) => {
        const updatedNote = {
          ...note,
          updatedAt: new Date().toISOString(),
        };
        try {
          if (userMode === "online-user") {
            await api.updateNote(updatedNote);
          } else if (userMode === "offline-user") {
            const syncAction: SyncNote = {
              action: "update",
              note: { ...updatedNote } as Note,
              timestamp: Date.now(),
            };
            set((state) => ({
              pendingSync: [...state.pendingSync, syncAction],
            }));
          }
          // Update the note in the local database
          await noteDB.updateNote(updatedNote);
          // Update the note in the state
          set((state) => ({
            notes: state.notes.map((n) => (n.id === note.id ? updatedNote : n)),
          }));
          return updatedNote;
        } catch (error) {
          console.error("Error updating note:", error);
          throw error;
        }
      },

      deleteNote: async (id: string, userMode: UserMode) => {
        try {
          if (userMode === "online-user") {
            // Delete the note from the server
            await api.deleteNote(id);
          } else if (userMode === "offline-user") {
            const syncAction: SyncNote = {
              action: "delete",
              note: id,
              timestamp: Date.now(),
            };
            set((state) => ({
              pendingSync: [...state.pendingSync, syncAction],
            }));
          }
          // Remove the note from the local database
          await noteDB.deleteNote(id);
          // Remove the note from the state
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
          }));
        } catch (error) {
          console.error("Error deleting note:", error);
          throw error;
        }
      },

      syncNotes: async () => {
        const { pendingSync } = get();
        if (pendingSync.length === 0) return;

        try {
          for (const syncAction of pendingSync) {
            if (syncAction.action === "add") {
              await api.createNote(syncAction.note as Note);
            } else if (syncAction.action === "update") {
              await api.updateNote(syncAction.note as Note);
            } else if (syncAction.action === "delete") {
              await api.deleteNote(syncAction.note as string);
            }
          }
          set({ pendingSync: [] });
        } catch (error) {
          console.error("Error syncing notes:", error);
        }
      },

      mergeNotes: async () => {
        try {
          const mergedMap = new Map<string, Note>();
          const auth = getLocalStorageItem<AuthState>("auth", {} as AuthState);
          const userId = auth.user!.id;
          // Get all notes from server
          const serverNotes = await api.fetchServerNotes();
          const localNotes = await noteDB.getAllNotes();

          for (const note of serverNotes) {
            mergedMap.set(note.id, note);
          }

          for (const guestNote of localNotes) {
            const existing = mergedMap.get(guestNote.id);

            if (!existing) {
              // Task is only in guest: assign userId and add
              mergedMap.set(guestNote.id, { ...guestNote, userId });
            } else {
              // Conflict: pick the latest one by updatedAt
              const guestUpdated = new Date(guestNote.updatedAt).getTime();
              const serverUpdated = new Date(existing.updatedAt).getTime();

              if (guestUpdated > serverUpdated) {
                mergedMap.set(guestNote.id, { ...guestNote, userId });
              }
            }
          }

          const mergedNotes = Array.from(mergedMap.values());

          // Merge to local db
          await noteDB.mergeNotes(mergedNotes);

          // Merge to server
          await api.mergeNotes(mergedNotes);
          set({ notes: [...mergedNotes] });
        } catch (error) {
          console.error("Error merging tasks:", error);
        }
      },

      removeLocalNotes: async () => {
        try {
          await noteDB.clearNotes();
          set({ notes: [] });
        } catch (error) {
          console.error("Error removing local notes:", error);
        }
      },
    }),
    {
      name: "note-store", // unique name for the storage
      partialize: (state) => ({
        pendingSync: state.pendingSync,
      }),
    }
  )
);
