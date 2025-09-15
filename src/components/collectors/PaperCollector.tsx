import { apiEndpoints } from '../../config/api';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { Search, Download, Block } from '@mui/icons-material';
import axios from 'axios';
import { useApp } from '../../contexts/AppContext';
import { Paper } from '../../types';
import journalService from '../../services/journalService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PaperCollector: React.FC = () => {
  const { papers, setPapers, setError } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [source, setSource] = useState(() => localStorage.getItem('searchSource') || 'all');
  
  
  // Load exclude keywords from localStorage
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>(() => {
    const cached = localStorage.getItem('excludeKeywords');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached exclude keywords:', e);
      }
    }
    return [];
  });
  
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [maxResults, setMaxResults] = useState(() => {
    const cached = localStorage.getItem('maxResults');
    return cached ? parseInt(cached, 10) : 20;
  });
  const [yearFrom, setYearFrom] = useState(() => {
    const cached = localStorage.getItem('yearFrom');
    return cached ? parseInt(cached, 10) : 2020;
  });
  const [yearTo, setYearTo] = useState(() => {
    const cached = localStorage.getItem('yearTo');
    return cached ? parseInt(cached, 10) : new Date().getFullYear();
  });
  
  // Debug: Log papers when they change
  React.useEffect(() => {
    console.log('Papers updated in PaperCollector:', papers.length, papers);
  }, [papers]);
  
  
  // Save exclude keywords to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('excludeKeywords', JSON.stringify(excludeKeywords));
  }, [excludeKeywords]);
  
  // Save search settings to localStorage
  React.useEffect(() => {
    localStorage.setItem('searchSource', source);
  }, [source]);
  
  React.useEffect(() => {
    localStorage.setItem('maxResults', maxResults.toString());
  }, [maxResults]);
  
  React.useEffect(() => {
    localStorage.setItem('yearFrom', yearFrom.toString());
  }, [yearFrom]);
  
  React.useEffect(() => {
    localStorage.setItem('yearTo', yearTo.toString());
  }, [yearTo]);

  const handleSearch = async () => {
    console.log('handleSearch called with query:', searchQuery);
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError(null);
    console.log('Starting search...');
    
    // 검색 정보를 localStorage에 저장
    localStorage.setItem('lastSearchQuery', searchQuery);
    localStorage.setItem('searchSources', JSON.stringify([source]));
    localStorage.setItem('yearFrom', yearFrom.toString());
    localStorage.setItem('yearTo', yearTo.toString());
    localStorage.setItem('maxResults', maxResults.toString());
    localStorage.setItem('excludeKeywords', JSON.stringify(excludeKeywords));

    try {
      let results: Paper[] = [];
      // Build query
      const includeQuery = searchQuery;

      if (source === 'all' || source === 'google_scholar') {
        try {
          // Google Scholar uses minus sign for exclusion
          const excludeQuery = excludeKeywords.length > 0 ? ` -${excludeKeywords.join(' -')}` : '';
          const fullQuery = includeQuery + excludeQuery;
          console.log('Calling Google Scholar API with query:', fullQuery);
          // Use backend proxy for Google Scholar
          const response = await axios.get(`${API_BASE_URL}/api/scholar`, {
            params: { 
              q: fullQuery,
              num: maxResults,
              as_ylo: yearFrom,
              as_yhi: yearTo
            }
          });
          
          console.log('Scholar API response:', response.data);
          const scholarData = response.data;
          
          if (scholarData.organic_results) {
            const scholarPapers = await Promise.all(scholarData.organic_results.map(async (item: any) => {
              // Extract authors from publication_info.summary
              let authors: string[] = [];
              if (item.publication_info?.summary) {
                const summary = item.publication_info.summary;
                // Format: "Author1, Author2 - Journal, Year - domain"
                const authorPart = summary.split(' - ')[0];
                if (authorPart) {
                  authors = authorPart.split(',').map((a: string) => a.trim());
                }
              }
              
              // Extract year from summary or other fields
              let year = new Date().getFullYear();
              if (item.publication_info?.summary) {
                const yearMatch = item.publication_info.summary.match(/\b(19|20)\d{2}\b/);
                if (yearMatch) {
                  year = parseInt(yearMatch[0]);
                }
              }
              
              // Extract journal from publication_info
              let journal = '';
              if (item.publication_info?.summary) {
                const parts = item.publication_info.summary.split(' - ');
                // parts[0] is authors, parts[1] is usually journal, parts[2] is publisher/domain
                if (parts.length >= 2) {
                  // Try to extract journal from second part
                  const secondPart = parts[1]?.trim() || '';
                  // Remove year and publisher info
                  const journalMatch = secondPart.replace(/,?\s*\d{4}.*$/, '').trim();
                  if (journalMatch && !/^\d{4}$/.test(journalMatch)) {
                    journal = journalMatch;
                  }
                }
                // If still no journal and we have a third part that's not a domain
                if (!journal && parts.length > 2) {
                  const thirdPart = parts[2]?.trim() || '';
                  // Skip if it looks like a domain (contains .com, .org, etc)
                  if (!thirdPart.match(/\.(com|org|net|edu|gov|io)/i)) {
                    journal = thirdPart;
                  }
                }
              }
              // Remove text after colon for Google Scholar results too
              if (journal.includes(':')) {
                journal = journal.split(':')[0].trim();
              }
              
              // Use only the snippet from API, no additional fetching
              let abstract = item.snippet || item.description || '';
              
              return {
                id: item.result_id || Math.random().toString(36).substring(2, 11),
                title: item.title || 'Untitled',
                authors: authors,
                abstract: abstract,
                publicationDate: new Date(year, 0, 1),
                source: 'google_scholar' as const,
                url: item.link || '#',
                keywords: [],
                citations: item.inline_links?.cited_by?.total || 0,
                journal: journal,
              };
            }));
            results = [...results, ...scholarPapers];
            console.log('Scholar papers added:', scholarPapers.length);
          }
        } catch (scholarError) {
          console.error('Google Scholar search error:', scholarError);
          if (source === 'google_scholar') {
            throw scholarError;
          }
        }
      }

      if (source === 'all' || source === 'pubmed') {
        try {
          // PubMed uses NOT operator for exclusion
          const excludeQuery = excludeKeywords.length > 0 ? ` NOT (${excludeKeywords.join(' OR ')})` : '';
          const fullQuery = includeQuery + excludeQuery;
          console.log('Calling PubMed API with query:', fullQuery);
          // Use backend proxy for PubMed
          const response = await axios.get(`${API_BASE_URL}/api/pubmed/search`, {
            params: { 
              term: fullQuery,
              retmax: maxResults,
              mindate: yearFrom,
              maxdate: yearTo
            }
          });
          
          console.log('PubMed API response:', response.data);
          const pubmedData = response.data;
          
          if (pubmedData.result) {
            // Get all UIDs from the result object (excluding metadata keys)
            const uids = Object.keys(pubmedData.result).filter(
              key => key !== 'uids' && !isNaN(Number(key))
            );
            
            console.log('PubMed UIDs found:', uids.length, uids);
            
            const pubmedPapers = uids.slice(0, maxResults).map((uid: string) => {
              const article = pubmedData.result[uid];
              
              // Parse authors array
              let authors: string[] = [];
              if (article?.authors && Array.isArray(article.authors)) {
                authors = article.authors.map((a: any) => a.name || '').filter(Boolean);
              }
              
              // Parse publication date
              let publicationDate = new Date();
              if (article?.pubdate) {
                // PubMed date format: "2025 Sep 9" or "2025"
                const dateStr = article.pubdate.replace(/\s+/g, ' ');
                publicationDate = new Date(dateStr);
                if (isNaN(publicationDate.getTime())) {
                  publicationDate = new Date();
                }
              }
              
              // Extract journal name from article data and remove text after colon
              let journalName = article?.fulljournalname || article?.source || '';
              // Remove text after colon (e.g., "Journal Name : electronic" becomes "Journal Name")
              if (journalName.includes(':')) {
                journalName = journalName.split(':')[0].trim();
              }
              
              return {
                id: uid,
                title: article?.title || `PubMed Article ${uid}`,
                authors: authors,
                abstract: article?.fullAbstract || article?.sorttitle || '', // Use full abstract if available
                publicationDate: publicationDate,
                source: 'pubmed' as const,
                url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
                keywords: [],
                citations: article?.pmcrefcount || 0, // PMC reference count as citation proxy
                journal: journalName,
                doi: article?.elocationid || '',
              };
            });
            
            results = [...results, ...pubmedPapers];
            console.log('PubMed papers added:', pubmedPapers.length);
          }
        } catch (pubmedError) {
          console.error('PubMed search error:', pubmedError);
          if (source === 'pubmed') {
            throw pubmedError;
          }
        }
      }


      // USPTO Patent Search
      if (source === 'all' || source === 'patent') {
        try {
          // USPTO may use different syntax, using minus sign similar to Google
          const excludeQuery = excludeKeywords.length > 0 ? ` -${excludeKeywords.join(' -')}` : '';
          const fullQuery = includeQuery + excludeQuery;
          console.log('Calling USPTO API with query:', fullQuery);
          // Use backend proxy for USPTO
          const response = await axios.get(`${API_BASE_URL}/api/uspto/search`, {
            params: { 
              query: fullQuery,
              numOfRows: maxResults,
              yearFrom: yearFrom,
              yearTo: yearTo
            }
          });
          
          console.log('USPTO API response:', response.data);
          const usptoData = response.data;
          
          if (usptoData.items && Array.isArray(usptoData.items)) {
            const patentPapers = usptoData.items.map((item: any) => {
              return {
                id: item.applicationNumber || Math.random().toString(36).substring(2, 11),
                title: item.inventionTitle || 'Untitled Patent',
                authors: item.applicantName ? [item.applicantName] : [],
                abstract: item.astrtCont || '',
                publicationDate: item.openDate ? new Date(item.openDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : new Date(),
                source: 'patent' as const,
                url: item.linkUrl || '#',
                keywords: [],
                citations: 0,
                patentNumber: item.applicationNumber,
              };
            });
            results = [...results, ...patentPapers];
            console.log('Patent papers added:', patentPapers.length);
          }
        } catch (usptoError) {
          console.error('USPTO search error:', usptoError);
          if (source === 'patent') {
            throw usptoError;
          }
        }
      }

      console.log('Total results found:', results.length);
      
      if (results.length > 0) {
        // Sort results by citations and publication date
        const sortedResults = results.sort((a, b) => {
          // Sort by citations (higher citations first)
          if (a.citations && b.citations) {
            return b.citations - a.citations;
          }
          
          // If one has citations and other doesn't, prioritize the one with citations
          if (a.citations && !b.citations) return -1;
          if (!a.citations && b.citations) return 1;
          
          // Finally, sort by publication date (newer first)
          return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        });
        
        console.log('Setting papers with sorted results:', sortedResults);
        
        // Enrich papers with journal impact factor information
        const enrichedResults = sortedResults.map(paper => 
          journalService.enrichPaperWithJournalInfo(paper)
        );
        console.log('Papers enriched with journal info');
        
        // Replace existing papers instead of appending
        setPapers(enrichedResults);
        setError(null);
      } else {
        console.log('No results found');
        setError('No results found. Try different search terms.');
        // Clear previous results when no new results found
        setPapers([]);
      }
      
      setIsSearching(false);
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.response?.data?.message || 'Failed to search papers. Please try again.');
      setIsSearching(false);
    }
  };



  const handleAddExcludeKeyword = () => {
    if (newExcludeKeyword && !excludeKeywords.includes(newExcludeKeyword)) {
      setExcludeKeywords([...excludeKeywords, newExcludeKeyword]);
      setNewExcludeKeyword('');
    }
  };

  const handleDeleteExcludeKeyword = (keyword: string) => {
    setExcludeKeywords(excludeKeywords.filter(k => k !== keyword));
  };

  return (
    <Card sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom>
           Data Collection
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
            '& > *': {
              flex: {
                xs: '1 1 100%',           // Mobile: full width
                sm: '1 1 calc(50% - 8px)', // Small: 2 columns
                md: '1 1 calc(50% - 8px)', // Medium: 2 columns  
                lg: '1 1 calc(25% - 12px)', // Large: 4 columns
                xl: '1 1 calc(25% - 12px)'  // Extra large: 4 columns
              },
              minWidth: 0  // Allow flex items to shrink
            }
          }}>
            <FormControl sx={{ 
              minWidth: { xs: '100%', sm: 200 }
            }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                label="Source"
              >
                <MenuItem value="all">All Sources</MenuItem>
                <MenuItem value="google_scholar">Google Scholar</MenuItem>
                <MenuItem value="pubmed">PubMed</MenuItem>
                <MenuItem value="patent">Patents (USPTO)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Max Results"
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 100 } }}
              fullWidth
            />
            
            <TextField
              label="Year From"
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              fullWidth
            />
            
            <TextField
              label="Year To"
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(Number(e.target.value))}
              InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              fullWidth
            />
          </Box>

          <TextField
            fullWidth
            label="Search Query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search terms..."
            sx={{ mb: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Exclude Keywords (words to exclude from results):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              {excludeKeywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  icon={<Block />}
                  onDelete={() => handleDeleteExcludeKeyword(keyword)}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                size="small"
                placeholder="Add keyword to exclude..."
                value={newExcludeKeyword}
                onChange={(e) => setNewExcludeKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddExcludeKeyword();
                  }
                }}
                sx={{ flex: '1 1 auto' }}
              />
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleAddExcludeKeyword}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Exclude
              </Button>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            '& > button:first-of-type': {
              flex: { xs: '1 1 100%', sm: '3 1 auto' }
            },
            '& > button:last-of-type': {
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              minWidth: { xs: '100%', sm: '120px' }
            }
          }}>
            <Button
              variant="contained"
              startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
              onClick={handleSearch}
              disabled={isSearching}
              fullWidth
            >
              {isSearching ? 'Searching...' : 'Search Papers'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={papers.length === 0}
              fullWidth
            >
              Export
            </Button>
          </Box>

          {papers.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Found {papers.length} papers in total
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaperCollector;