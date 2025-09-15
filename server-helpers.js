// Helper functions for enhanced analysis in server.js

// Extract methodology from abstract using keyword matching
function extractMethodology(abstract) {
  if (!abstract) return null;
  
  const methodologyKeywords = [
    'DBD', 'dielectric barrier discharge',
    'RF plasma', 'microwave plasma',
    'catalyst', 'Ni/', 'Cu/', 'Fe/', 'Co/', 'Pt/',
    'temperature', 'pressure', 'flow rate',
    'packed bed', 'fluidized bed',
    'in-situ', 'operando', 'DRIFTS', 'XPS', 'XRD'
  ];
  
  const found = [];
  const abstractLower = abstract.toLowerCase();
  
  methodologyKeywords.forEach(keyword => {
    if (abstractLower.includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  });
  
  return found.length > 0 ? found.join(', ') : null;
}

// Extract key findings from abstract
function extractKeyFindings(abstract) {
  if (!abstract) return null;
  
  const findingsPatterns = [
    /achieved?\s+(\d+\.?\d*%?\s+\w+)/gi,
    /conversion\s+of?\s+(\d+\.?\d*%)/gi,
    /selectivity\s+of?\s+(\d+\.?\d*%)/gi,
    /yield\s+of?\s+(\d+\.?\d*%)/gi,
    /efficiency\s+of?\s+(\d+\.?\d*%)/gi,
    /(\d+\.?\d*)\s+times?\s+higher/gi,
    /improved?\s+by\s+(\d+\.?\d*%)/gi
  ];
  
  const findings = [];
  
  findingsPatterns.forEach(pattern => {
    const matches = abstract.match(pattern);
    if (matches) {
      findings.push(...matches);
    }
  });
  
  return findings.length > 0 ? findings.slice(0, 3).join('; ') : null;
}

// Extract performance metrics from abstract
function extractPerformanceMetrics(abstract) {
  if (!abstract) return {};
  
  const metrics = {};
  const abstractLower = abstract.toLowerCase();
  
  // Conversion rate
  const conversionMatch = abstractLower.match(/conversion\s+(?:rate\s+)?(?:of\s+)?(\d+\.?\d*)%?/);
  if (conversionMatch) {
    metrics.conversion = parseFloat(conversionMatch[1]);
  }
  
  // Selectivity
  const selectivityMatch = abstractLower.match(/selectivity\s+(?:of\s+)?(\d+\.?\d*)%?/);
  if (selectivityMatch) {
    metrics.selectivity = parseFloat(selectivityMatch[1]);
  }
  
  // Energy efficiency
  const energyMatch = abstractLower.match(/(\d+\.?\d*)\s*kwh\/mol/);
  if (energyMatch) {
    metrics.energyEfficiency = parseFloat(energyMatch[1]);
  }
  
  // Temperature
  const tempMatch = abstractLower.match(/(\d+)\s*(?:°c|k|celsius|kelvin)/);
  if (tempMatch) {
    metrics.temperature = parseFloat(tempMatch[1]);
  }
  
  // Pressure
  const pressureMatch = abstractLower.match(/(\d+\.?\d*)\s*(?:bar|pa|atm|torr)/);
  if (pressureMatch) {
    metrics.pressure = parseFloat(pressureMatch[1]);
  }
  
  return Object.keys(metrics).length > 0 ? metrics : null;
}

// Analyze temporal trends in paper data
function analyzeTemporalTrends(papers) {
  const yearlyData = {};
  const technologyEvolution = {};
  
  papers.forEach(paper => {
    const year = paper.year || (paper.publishedDate ? paper.publishedDate.substring(0, 4) : null);
    if (!year) return;
    
    if (!yearlyData[year]) {
      yearlyData[year] = {
        count: 0,
        topics: [],
        avgCitations: 0,
        technologies: new Set()
      };
    }
    
    yearlyData[year].count++;
    
    if (paper.keywords) {
      yearlyData[year].topics.push(...paper.keywords);
    }
    
    if (paper.citations) {
      yearlyData[year].avgCitations = 
        (yearlyData[year].avgCitations * (yearlyData[year].count - 1) + paper.citations) / 
        yearlyData[year].count;
    }
    
    // Track technology evolution
    const methodology = extractMethodology(paper.abstract);
    if (methodology) {
      methodology.split(', ').forEach(tech => {
        yearlyData[year].technologies.add(tech);
      });
    }
  });
  
  // Convert sets to arrays for JSON serialization
  Object.keys(yearlyData).forEach(year => {
    yearlyData[year].technologies = Array.from(yearlyData[year].technologies);
    
    // Find most common topics for the year
    const topicFreq = {};
    yearlyData[year].topics.forEach(topic => {
      topicFreq[topic] = (topicFreq[topic] || 0) + 1;
    });
    
    yearlyData[year].topTopics = Object.entries(topicFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  });
  
  return {
    yearlyData,
    totalYears: Object.keys(yearlyData).length,
    latestYear: Math.max(...Object.keys(yearlyData).map(y => parseInt(y))),
    earliestYear: Math.min(...Object.keys(yearlyData).map(y => parseInt(y)))
  };
}

// Calculate research network connections
function analyzeResearchNetwork(papers) {
  const authorCollaborations = {};
  const institutionNetwork = {};
  const countryNetwork = {};
  
  papers.forEach(paper => {
    if (!paper.authors || paper.authors.length < 2) return;
    
    // Track author collaborations
    for (let i = 0; i < paper.authors.length - 1; i++) {
      for (let j = i + 1; j < paper.authors.length; j++) {
        const pair = [paper.authors[i], paper.authors[j]].sort().join('::');
        authorCollaborations[pair] = (authorCollaborations[pair] || 0) + 1;
      }
    }
    
    // Track institution collaborations (if available)
    if (paper.affiliations && paper.affiliations.length > 1) {
      for (let i = 0; i < paper.affiliations.length - 1; i++) {
        for (let j = i + 1; j < paper.affiliations.length; j++) {
          const pair = [paper.affiliations[i], paper.affiliations[j]].sort().join('::');
          institutionNetwork[pair] = (institutionNetwork[pair] || 0) + 1;
        }
      }
    }
  });
  
  // Get top collaborations
  const topCollaborations = Object.entries(authorCollaborations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pair, count]) => ({
      authors: pair.split('::'),
      collaborationCount: count
    }));
  
  const topInstitutionPairs = Object.entries(institutionNetwork)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pair, count]) => ({
      institutions: pair.split('::'),
      collaborationCount: count
    }));
  
  return {
    topCollaborations,
    topInstitutionPairs,
    totalUniqueAuthors: new Set(papers.flatMap(p => p.authors || [])).size,
    avgAuthorsPerPaper: papers.reduce((sum, p) => sum + (p.authors?.length || 0), 0) / papers.length
  };
}

// Generate comparative analysis metrics
function generateComparativeMetrics(userResults, paperMetrics) {
  const comparisons = {};
  
  // Parse user results to extract metrics
  const userMetrics = extractPerformanceMetrics(userResults);
  
  if (!userMetrics || paperMetrics.length === 0) {
    return comparisons;
  }
  
  // Calculate percentile rankings
  Object.keys(userMetrics).forEach(metric => {
    const paperValues = paperMetrics
      .map(p => p[metric])
      .filter(v => v !== null && v !== undefined)
      .sort((a, b) => a - b);
    
    if (paperValues.length > 0) {
      const userValue = userMetrics[metric];
      const betterThan = paperValues.filter(v => v < userValue).length;
      const percentile = (betterThan / paperValues.length) * 100;
      
      comparisons[metric] = {
        userValue,
        percentile: Math.round(percentile),
        median: paperValues[Math.floor(paperValues.length / 2)],
        best: paperValues[paperValues.length - 1],
        worst: paperValues[0]
      };
    }
  });
  
  return comparisons;
}

export {
  extractMethodology,
  extractKeyFindings,
  extractPerformanceMetrics,
  analyzeTemporalTrends,
  analyzeResearchNetwork,
  generateComparativeMetrics
};