import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeContext';
import { classname2bootstrapIcon } from './sitenavigation_utils';
import axios from './axios';
import './App.css';

function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dark } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchText(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/objects/search', {
        params: {
          classname: 'DBObject',
          name: query.trim(),
        },
      });
      console.log('Search response:', response.data);
      // Backend returns array directly, not wrapped in results
      setResults(Array.isArray(response.data) ? response.data : response.data.objects || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      setSearchParams({ q: searchText.trim() });
    }
  };

  const handleResultClick = (objectId) => {
    navigate(`/c/${objectId}`);
  };

  return (
    <Container className="mt-4">
      <h2>{t('common.search') || 'Search'}</h2>
      
      <Form onSubmit={handleSearchSubmit} className="mb-4">
        <Form.Group>
          <Form.Control
            type="text"
            placeholder={t('common.search_placeholder') || 'Search by name or description...'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
            size="lg"
          />
        </Form.Group>
      </Form>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!loading && !error && searchText && results.length === 0 && (
        <Alert variant="info">
          {t('common.no_results') || 'No results found'}
        </Alert>
      )}

      {results.length > 0 && (
        <>
          <p className="text-muted mb-3">
            {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchParams.get('q')}"
          </p>
          
          <ListGroup variant={dark ? 'dark' : undefined}>
            {results.map((result) => (
              <ListGroup.Item
                key={result.id}
                action
                onClick={() => handleResultClick(result.id)}
                style={{ cursor: 'pointer' }}
                variant={dark ? 'dark' : undefined}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{result.name || 'Untitled'}</strong>
                    {result.description && (
                      <div className="small" style={{ opacity: 0.7 }}>
                        {result.description.length > 200
                          ? result.description.substring(0, 200) + '...'
                          : result.description}
                      </div>
                    )}
                  </div>
                  <span className="badge bg-secondary">
                    <i 
                      className={`bi bi-${classname2bootstrapIcon(result.classname)}`} 
                      title={result.classname}
                    ></i>
                  </span>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}
    </Container>
  );
}

export default Search;
