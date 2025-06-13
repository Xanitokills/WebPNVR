import { create } from "zustand";
import { Note } from "@/lib/types/note";
import { saveToLocalStorage } from "@/lib/utils/localStorage";

interface NoteState {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  addNote: (note) => set((state) => {
    const newNotes = [...state.notes, note];
    saveToLocalStorage("notes", newNotes);
    return { notes: newNotes };
  }),
  updateNote: (id, note) => set((state) => {
    const newNotes = state.notes.map((n) => (n.id === id ? { ...n, ...note } : n));
    saveToLocalStorage("notes", newNotes);
    return { notes: newNotes };
  }),
  deleteNote: (id) => set((state) => {
    const newNotes = state.notes.filter((n) => n.id !== id);
    saveToLocalStorage("notes", newNotes);
    return { notes: newNotes };
  }),
}));