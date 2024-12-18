// src/db/dexie.js
import Dexie from 'dexie';

const db = new Dexie("LyricsDatabase");
db.version(2).stores({
  lyrics: "++id, category, title, text, notes, photo, photoType, audio, audioType, doc, docType"
});

export default db;