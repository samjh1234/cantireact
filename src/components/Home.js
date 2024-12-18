import React, { useState, useEffect, useRef, useCallback } from 'react';
import db from '../db/dexie'; 
import '../styles/Home.css'; 
import { Link } from 'react-router-dom';


const Home = () => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState(''); // This controls the input query
  const hasRunOnce = useRef(false); 

  // ✅ 1. Populate results dynamically when query changes
  useEffect(() => {
    if (query.trim() === '') {
      populateResults(); // If query is empty, load all results
    } else {
      populateResults(query);
    }
  }, [query]); 

  // ✅ 2. Populate the database once on load
  useEffect(() => {
    if (hasRunOnce.current) return; 
    hasRunOnce.current = true;
    checkAndPopulateDatabase();
  }, []); // Empty dependency array to ensure it runs only once

  // ✅ 3. **Adjust container on orientation change or window resize**
  useEffect(() => {
    const adjustContainerSize = () => {
      const container = document.querySelector('.container');
      if (container) {
        container.style.width = `${window.innerWidth}px`;
        container.style.height = `${window.innerHeight}px`;
      }
    };

    adjustContainerSize();

    window.addEventListener('resize', adjustContainerSize);
    window.addEventListener('orientationchange', adjustContainerSize);

    return () => {
      window.removeEventListener('resize', adjustContainerSize);
      window.removeEventListener('orientationchange', adjustContainerSize);
    };
  }, []); 

  // Function to check if the database is empty and populate it if needed
  const checkAndPopulateDatabase = useCallback(async () => {
    try {
      const recordsCount = await db.lyrics.count();
      if (recordsCount === 0) {
        console.log('Database is empty, populating from JSON file...');

        const response = await fetch(`${process.env.PUBLIC_URL}/scripts/db.json`, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Failed to fetch db.json: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Full Data:', data); 
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

      populateResults(); 

    } catch (error) {
      console.error('Failed to populate the database:', error);
    }
  }, []);

  // **Updated function to populate results using the 'starts with' and 'contains' logic**
  const populateResults = useCallback(async (query = "") => {
    try {
      if (!query) {
        const allResults = await db.lyrics.toArray();
        setResults(allResults.length > 0 ? allResults : [{ id: 0, title: 'Nessun risultato trovato' }]);
        return;
      }

      const normalizedQuery = query.toLowerCase();

      // **Step 1:** First, prioritize "starts with" matches
      const startsWithResults = await db.lyrics.filter(record => {
        const searchText = `${record.title || ''} ${record.text || ''} ${record.notes || ''} ${record.category || ''}`.toLowerCase();
        return searchText.startsWith(normalizedQuery);
      }).toArray();

      // **Step 2:** Then, add "contains" matches that don't start with the query
      const containsResults = await db.lyrics.filter(record => {
        const searchText = `${record.title || ''} ${record.text || ''} ${record.notes || ''} ${record.category || ''}`.toLowerCase();
        return searchText.includes(normalizedQuery) && !searchText.startsWith(normalizedQuery); 
      }).toArray();

      // Combine the two sets of results, ensuring no duplicates
      const combinedResults = [...startsWithResults, ...containsResults];

      if (combinedResults.length === 0) {
        setResults([{ id: 0, title: 'Nessun risultato trovato' }]);
      } else {
        setResults(combinedResults);
      }
    } catch (error) {
      console.error('Failed to populate the results:', error);
    }
  }, []);

  // **Handles input change in the search box**
  const handleSearchInput = (e) => {
    const query = e.target.value; // No trim() to allow for spaces
    setQuery(query); // Update the query to trigger the `useEffect`
  };

  return (
    <div className="container">
      <h1 className="title">Canti & Lyrics</h1>
      <p className="subtitle">Lazzaro - S.Fiesole</p>
      <div className="button-group">
      <Link to="/db-admin" className="button">DB Admin</Link> 
      <Link to="/aggiungi" className="button">Aggiungi</Link> 
      </div>

      <div className="search-box">
        <input 
          type="text" 
          id="search-input" 
          placeholder="Ricerca" 
          className="search-input" 
          value={query}
          onChange={handleSearchInput} 
        />
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