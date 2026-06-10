"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.notes
      .orderBy("updatedAt")
      .reverse()
      .toArray()
      .then((n) => {
        setNotes(n);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Delete this note?")) {
      await db.notes.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Your Notes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">All notes from your practice sessions</p>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading notes...</p>
      ) : notes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No notes yet. Take notes during practice!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">{note.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {note.testId && <span>{note.testId}</span>}
                    <span>
                      {new Date(note.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(note.id!)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
