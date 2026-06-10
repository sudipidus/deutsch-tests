"use client";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import type { Note } from "@/lib/types";

interface Props {
  sessionId?: number;
  testId?: string;
}

export function SessionPanel({ sessionId, testId }: Props) {
  const { notes, addNote, deleteNote } = useNotes(sessionId, testId);
  const [isOpen, setIsOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    await addNote(noteInput.trim());
    setNoteInput("");
  };

  return (
    <div className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transform transition-transform z-40"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-4 -translate-x-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium hover:shadow-md transition-shadow"
      >
        {isOpen ? "▶" : "◀"} Notes
      </button>

      <div className="h-full flex flex-col overflow-hidden p-4">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-lg">Notes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{note.content}</p>
                <button
                  onClick={() => deleteNote(note.id!)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  ✕
                </button>
              </div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Note */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleAddNote();
              }
            }}
            placeholder="Add a note... (Ctrl+Enter)"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
          />
          <button
            onClick={handleAddNote}
            className="mt-2 w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs font-medium transition-colors"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
