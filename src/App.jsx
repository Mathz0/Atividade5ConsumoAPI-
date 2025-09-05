import React, { useState, useEffect } from 'react'

const API_KEY = "thewdb"
const API_URL = "https://www.omdbapi.com/"


export default function MovieApp() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const searchMovies = async (p = 1) => {
    if (!query) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}?apikey=${API_KEY}&s=${query}&page=${p}`)
      const data = await res.json()
      if (data.Response === 'True') {
        setMovies(data.Search)
        setTotalResults(parseInt(data.totalResults))
        setPage(p)
      } else {
        setError(data.Error)
        setMovies([])
      }
    } catch (err) {
      setError('Erro ao buscar filmes.')
    } finally {
      setLoading(false)
    }
  }

  const getDetails = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${id}&plot=full`)
      const data = await res.json()
      if (data.Response === 'True') {
        setSelectedMovie(data)
      } else {
        setError(data.Error)
      }
    } catch (err) {
      setError('Erro ao carregar detalhes.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (movie) => {
    if (favorites.some(fav => fav.imdbID === movie.imdbID)) {
      setFavorites(favorites.filter(fav => fav.imdbID !== movie.imdbID))
    } else {
      setFavorites([...favorites, movie])
    }
  }

  const isFavorite = (id) => favorites.some(fav => fav.imdbID === id)

  const totalPages = Math.ceil(totalResults / 10)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">MovieSearch</h1>

      {/* Campo de busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar filmes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded w-64 mr-2"
        />
        <button
          onClick={() => searchMovies(1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* Loading e Erros */}
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Lista de resultados */}
      {!selectedMovie && movies.length > 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <div key={movie.imdbID} className="border rounded p-2 bg-white">
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}
                  alt={movie.Title}
                  className="w-full h-64 object-cover rounded"
                />
                <h2 className="font-semibold mt-2">{movie.Title}</h2>
                <p className="text-sm text-gray-600">{movie.Year}</p>
                <button
                  onClick={() => getDetails(movie.imdbID)}
                  className="text-blue-500 mt-1"
                >
                  Ver detalhes
                </button>
                <button
                  onClick={() => toggleFavorite(movie)}
                  className={`mt-1 block ${isFavorite(movie.imdbID) ? 'text-red-500' : 'text-green-500'}`}
                >
                  {isFavorite(movie.imdbID) ? 'Remover Favorito' : 'Adicionar Favorito'}
                </button>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex justify-center mt-4 space-x-2">
            <button disabled={page === 1} onClick={() => searchMovies(1)}>⏮ Início</button>
            <button disabled={page === 1} onClick={() => searchMovies(page - 1)}>⬅ Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => searchMovies(page + 1)}>Próxima ➡</button>
            <button disabled={page === totalPages} onClick={() => searchMovies(totalPages)}>Fim ⏭</button>
          </div>
        </div>
      )}

      {/* Página de detalhes */}
      {selectedMovie && (
        <div className="bg-white p-4 rounded shadow">
          <button onClick={() => setSelectedMovie(null)} className="text-blue-500 mb-2">⬅ Voltar</button>
          <h2 className="text-xl font-bold">{selectedMovie.Title} ({selectedMovie.Year})</h2>
          <p><strong>Diretor:</strong> {selectedMovie.Director}</p>
          <p><strong>Elenco:</strong> {selectedMovie.Actors}</p>
          <p><strong>Gênero:</strong> {selectedMovie.Genre}</p>
          <p><strong>Duração:</strong> {selectedMovie.Runtime}</p>
          <p><strong>Avaliação:</strong> {selectedMovie.imdbRating}</p>
          <p className="mt-2">{selectedMovie.Plot}</p>
          <button
            onClick={() => toggleFavorite(selectedMovie)}
            className={`mt-2 ${isFavorite(selectedMovie.imdbID) ? 'text-red-500' : 'text-green-500'}`}
          >
            {isFavorite(selectedMovie.imdbID) ? 'Remover Favorito' : 'Adicionar Favorito'}
          </button>
        </div>
      )}

      {/* Lista de favoritos */}
      {favorites.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Meus Favoritos </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.map((movie) => (
              <div key={movie.imdbID} className="border rounded p-2 bg-white">
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}
                  alt={movie.Title}
                  className="w-full h-64 object-cover rounded"
                />
                <h2 className="font-semibold mt-2">{movie.Title}</h2>
                <p className="text-sm text-gray-600">{movie.Year}</p>
                <button
                  onClick={() => toggleFavorite(movie)}
                  className="text-red-500 mt-1"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
