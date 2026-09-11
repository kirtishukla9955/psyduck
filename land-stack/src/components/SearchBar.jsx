import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useMapStore } from '../store/mapStore';
import { api } from '../data/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedParcel } = useMapStore();

  useEffect(() => {
    if (query.length > 2) {
      api.getParcels().then(data => {
        const matches = data.features.filter(f => 
          f.properties.ulpin.toLowerCase().includes(query.toLowerCase()) ||
          f.properties.essential_layers.record_of_rights.owner_name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(matches);
      });
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (feature) => {
    setSelectedParcel(feature);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className={`flex items-center glass-panel rounded-full overflow-hidden transition-all duration-300 ${isOpen ? 'w-72 bg-navy-800' : 'w-10 bg-transparent border-transparent hover:bg-white/10'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 text-white/70 hover:text-white transition-colors flex-shrink-0"
        >
          <Search className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          placeholder="Search ULPIN or Owner..."
          className={`bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-white/40 ${isOpen ? 'opacity-100 pr-4' : 'opacity-0 w-0'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={isOpen}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-72 glass-panel rounded-lg shadow-xl overflow-hidden z-50">
          <ul className="max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <li 
                key={i} 
                onClick={() => handleSelect(r)}
                className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-accent-cyan mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">{r.properties.ulpin}</div>
                  <div className="text-xs text-white/50">{r.properties.essential_layers.record_of_rights.owner_name}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
