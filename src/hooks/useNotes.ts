import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import type { Note } from "@/lib/types";

export function useNotes(sessionId?: number, testId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      let loadedNotes: Note[] = [];

      if (sessionId !== undefined) {
        loadedNotes = await db.notes.where("sessionId").equals(sessionId).toArray();
      } else if (testId) {
        loadedNotes = await db.notes.where("testId").equals(testId).toArray();
      } else {
        loadedNotes = await db.notes.toArray();
      }

      setNotes(loadedNotes);
      setLoading(false);
    };

    loadNotes();
  }, [sessionId, testId]);

  const addNote = async (content: string, tags: string[] = []) => {
    const note: Note = {
      sessionId: sessionId ?? null,
      testId: testId ?? null,
      section: null,
      part: null,
      questionIndex: null,
      content,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await db.notes.add(note);
    const newNote = { ...note, id };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = async (id: number, updates: Partial<Note>) => {
    await db.notes.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n))
    );
  };

  const deleteNote = async (id: number) => {
    await db.notes.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  };
}
