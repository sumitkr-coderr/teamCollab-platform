// components/common/SearchBar.jsx
import React, { useState, useEffect, useCallback } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search...', debounceMs = 300 }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
      setIsSearching(false);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      debouncedSearch(query);
    } else {
      onSearch('');
      setIsSearching(false);
    }
  }, [query, debouncedSearch, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
      />
      <div className="absolute left-3 top-2.5">
        {isSearching ? (
          <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchBar;