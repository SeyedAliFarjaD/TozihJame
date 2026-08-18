import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import fatwasData from '../data/fatwas.json'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMarja, setSelectedMarja] = useState('همه')
  const [selectedCategory, setSelectedCategory] = useState('همه')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(fatwasData.map(f => f.category))
    return ['همه', ...Array.from(cats)]
  }, [])

  // Initialize Fuse.js for advanced search
  const fuse = useMemo(() => {
    return new Fuse(fatwasData, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'fatwa', weight: 0.3 },
        { name: 'simpleExplanation', weight: 0.2 },
        { name: 'keywords', weight: 0.4 },
        { name: 'category', weight: 0.2 }
      ],
      threshold: 0.4,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      findAllMatches: true
    })
  }, [])

  // Search function
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(fatwasData)
      return
    }

    setIsLoading(true)
    
    // Small delay to show loading state
    setTimeout(() => {
      let searchResults = fuse.search(searchTerm)
      
      // Filter by marja
      if (selectedMarja !== 'همه') {
        searchResults = searchResults.filter(item => item.item.marja === selectedMarja)
      }
      
      // Filter by category
      if (selectedCategory !== 'همه') {
        searchResults = searchResults.filter(item => item.item.category === selectedCategory)
      }
      
      setResults(searchResults.map(r => r.item))
      setIsLoading(false)
    }, 300)
  }, [searchTerm, selectedMarja, selectedCategory, fuse])

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is already handled by useEffect
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🕌 جستجوی فتوا و مسئله شرعی</h1>
        <p>پایگاه جامع احکام شرعی مطابق با نظرات مراجع عظام تقلید</p>
      </header>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="جستجو در مسائل شرعی... (مثلاً: نماز، روزه، خمس، ارث)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
            <button type="submit" className="search-button">
              🔍 جستجو
            </button>
          </div>
        </form>

        <div className="filters">
          <div className="filter-group">
            <label>مرجع تقلید:</label>
            <select 
              className="filter-select"
              value={selectedMarja}
              onChange={(e) => setSelectedMarja(e.target.value)}
            >
              <option value="همه">همه مراجع</option>
              <option value="خامنه‌ای">امام خامنه‌ای</option>
              <option value="سیستانی">آیت‌الله سیستانی</option>
            </select>
          </div>

          <div className="filter-group">
            <label>دسته‌بندی:</label>
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="results-container">
        {isLoading ? (
          <div className="loading">در حال جستجو...</div>
        ) : results.length === 0 ? (
          <div className="no-results">
            هیچ نتیجه‌ای یافت نشد. لطفاً واژگان دیگری را جستجو کنید.
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              {results.length} نتیجه یافت شد
            </h2>
            {results.map((result) => (
              <div key={result.id} className="result-card">
                <div className="result-header">
                  <span className={`marja-badge ${result.marja === 'خامنه‌ای' ? 'marja-khamenei' : 'marja-sistani'}`}>
                    {result.marja}
                  </span>
                  <span className="category-badge">{result.category}</span>
                </div>
                
                <h3 className="result-title">{result.title}</h3>
                
                <div className="result-fatwa">
                  <strong>فتوا:</strong> {result.fatwa}
                </div>
                
                <div className="simple-explanation">
                  <h4>💡 بیان ساده:</h4>
                  <p>{result.simpleExplanation}</p>
                </div>
                
                {result.keywords && result.keywords.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <strong style={{ color: '#667eea' }}>کلیدواژه‌ها:</strong>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {result.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '4px 12px',
                            borderRadius: '15px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default App
