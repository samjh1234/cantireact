import React, { useState } from 'react';
import '../styles/Aggiungi.css';
import { useNavigate } from 'react-router-dom';

const Aggiungi = () => {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [audio, setAudio] = useState(null);
  const [doc, setDoc] = useState(null);
  const navigate = useNavigate(); 

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory === category ? '' : selectedCategory);
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === 'photo') setPhoto(file);
    if (fileType === 'audio') setAudio(file);
    if (fileType === 'doc') setDoc(file);
  };

  const handleSubmit = () => {
    const newRecord = {
      category,
      title,
      text,
      notes,
      photo,
      audio,
      doc
    };

    console.log('Saved Data:', newRecord);
    alert('Salvato con successo!');
    
    setCategory('');
    setTitle('');
    setText('');
    setNotes('');
    setPhoto(null);
    setAudio(null);
    setDoc(null);
  };

  return (
    <div className="container">
      

      {/* Category Buttons */}
      <div className="category-buttons">
        <button 
          className={`toggle-button ${category === 'Liturgico' ? 'active' : ''}`} 
          onClick={() => handleCategorySelect('Liturgico')}
        >
          Liturgico
        </button>
        <button 
          className={`toggle-button ${category === 'Canto' ? 'active' : ''}`} 
          onClick={() => handleCategorySelect('Canto')}
        >
          Canto
        </button>
        <button 
          className={`toggle-button ${category === 'Altro' ? 'active' : ''}`} 
          onClick={() => handleCategorySelect('Altro')}
        >
          Altro
        </button>
      </div>

      {/* Title Input */}
      <div className="form-group">
        <label htmlFor="title">Titolo</label>
        <input 
          type="text" 
          id="title" 
          placeholder="Inserisci il titolo" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
      </div>

      {/* Text Input - Made Bigger */}
      <div className="form-group">
        <label htmlFor="text">Testo</label>
        <textarea 
          id="text" 
          placeholder="Inserisci il testo" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
      </div>

      {/* Notes Input - Made Smaller */}
      <div className="form-group">
        <label htmlFor="notes">Note</label>
        <textarea 
          id="notes" 
          placeholder="Inserisci le note" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
        />
      </div>

      {/* Attachments Button Group */}
      <div className="attachment-buttons">
        <label className="file-input">
          Allega Foto
          <input type="file" onChange={(e) => handleFileChange(e, 'photo')} />
        </label>

        <label className="file-input">
          Allega Audio
          <input type="file" onChange={(e) => handleFileChange(e, 'audio')} />
        </label>

        <label className="file-input">
          Allega Documento
          <input type="file" onChange={(e) => handleFileChange(e, 'doc')} />
        </label>
      </div>

      {/* Back and Save Buttons */}
      <div className="button-bar">
        <button className="back-button" onClick={() => navigate(-1)}>Indietro</button>
        <button className="submit-button" onClick={handleSubmit}>Salva</button>
      </div>
    </div>
  );
};

export default Aggiungi;