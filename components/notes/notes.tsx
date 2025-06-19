"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNoteStore } from "@/lib/stores/note-store";
import { format } from "date-fns";
import { useMode } from "@/lib/hooks/use-mode";

export function Notes() {
  const { notes, createNote, updateNote, deleteNote, fetchNotes } =
    useNoteStore();
  const { userMode } = useMode();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = () => {
    if (!content.trim()) return;

    if (editingId) {
      const note = notes.find((n) => n.id === editingId);
      if (note) {
        updateNote({
          ...note,
          content,
          updatedAt: new Date().toISOString(),
        }, userMode);
      }
      setEditingId(null);
    } else {
      createNote({
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, userMode);
    }

    setContent("");
  };

  const handleEdit = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setContent(note.content);
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setContent("");
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteNote(id, userMode);
    if (editingId === id) {
      setContent("");
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Note" : "New Note"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts, ideas, or reminders here..."
            className="min-h-[150px] mb-4"
          />
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave}>
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap mb-4">{note.content}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  {format(new Date(note.updatedAt), "MMM d, yyyy h:mm a")}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(note.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notes.length === 0 && (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No notes yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first note to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
