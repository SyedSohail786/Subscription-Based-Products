import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
      <input
        type="text"
        placeholder="Search books, authors..."
        className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="hidden">Search</button>
    </form>
  );
};

export default SearchInput;