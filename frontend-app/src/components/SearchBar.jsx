function SearchBar({ search, setSearch }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="🔍 Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

export default SearchBar;
