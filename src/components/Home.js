import React, { useState, useEffect, useRef } from 'react';
import Dexie from 'dexie';
import '../styles/Home.css'; 

const Home = () => {
  const [results, setResults] = useState([]);
  const hasRunOnce = useRef(false); // 👈 This prevents multiple calls in Strict Mode

  // Create and configure the Dexie database
  const db = new Dexie("LyricsDatabase");
  db.version(2).stores({
    lyrics: "++id, category, title, text, notes, photo, photoType, audio, audioType, doc, docType"
  });

  // Function to check if the database is empty and populate it if needed
  const checkAndPopulateDatabase = async () => {
    try {
      const recordsCount = await db.lyrics.count();
      if (recordsCount === 0) {
        console.log('Database is empty, populating from JSON file...');

        const response = await fetch('/scripts/db.json', { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Failed to fetch db.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Full Data:', data); // 👈 This was running twice
        const table = data?.data?.data?.find(table => table.tableName === 'lyrics');
        if (!table) {
          throw new Error('Lyrics table not found in the JSON file.');
        }

        const lyricsData = table.rows;
        if (!lyricsData || !Array.isArray(lyricsData) || lyricsData.length === 0) {
          throw new Error('No data found in the lyrics table from the JSON file.');
        }

        await db.lyrics.bulkAdd(lyricsData);
        console.log('Database populated successfully with', lyricsData.length, 'records.');
      } else {
        console.log('Database already populated with', recordsCount, 'records.');
      }

      populateResults(); // Load the initial results

    } catch (error) {
      console.error('Failed to populate the database:', error);
    }
  };

  // Function to populate the results-box dynamically
  const populateResults = async (query = "") => {
    try {
      const results = query
        ? await db.lyrics
            .where('title')
            .startsWithIgnoreCase(query)
            .or('text')
            .startsWithIgnoreCase(query)
            .or('notes')
            .startsWithIgnoreCase(query)
            .or('category')
            .startsWithIgnoreCase(query)
            .toArray()
        : await db.lyrics.toArray();

      if (results.length === 0) {
        setResults([{ id: 0, title: 'Nessun risultato trovato' }]);
      } else {
        setResults(results);
      }
    } catch (error) {
      console.error('Failed to populate the results:', error);
    }
  };

  useEffect(() => {
    if (hasRunOnce.current) return; // 🚀 Prevents this from running twice in React 18 Strict Mode
    hasRunOnce.current = true;

    checkAndPopulateDatabase();

    const handleSearchInput = (e) => {
      const query = e.target.value.trim().toLowerCase();
      populateResults(query);
    };

    document.getElementById("search-input").addEventListener('input', handleSearchInput);
    
    return () => {
      document.getElementById("search-input").removeEventListener('input', handleSearchInput);
    };
  }, []); // ✅ Empty dependency array ensures this runs only once

  return (
    <div className="container">
      <h1 className="title">Canti & Lyrics</h1>
      <p className="subtitle">Lazzaro - S.Fiesole</p> {/* NEW LINE ADDED */}
      <div className="button-group">
        <button className="button" onClick={() => populateResults()}>Cerca</button>
        <a href="/aggiungi" className="button">Aggiungi</a>
      </div>

      <div className="search-box">
        <input type="text" id="search-input" placeholder="Ricerca" className="search-input" />
      </div>

      <div className="results-box">
        {results.map(record => (
          <p key={record.id} onClick={() => window.location.href = `/record/${record.id}`}>
            {record.title || 'Titolo sconosciuto'}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Home;