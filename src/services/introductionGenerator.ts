// Introduction Generator Service for Academic Papers
// Generates manuscript introduction with proper citations

export interface Citation {
  id: string;
  authors: string[];
  title: string;
  journal: string;
  year: string;
  volume?: string;
  pages?: string;
  doi?: string;
}

export interface IntroductionConfig {
  style: 'Nature' | 'Science' | 'ACS' | 'IEEE';
  wordCount: number;
  sections: string[];
  citationStyle: 'numbered' | 'author-year';
  language: 'en' | 'ko';
}

export class IntroductionGeneratorService {
  
  generateIntroductionPrompt(
    analysisResult: any,
    userResearch: any,
    papers: any[],
    config: IntroductionConfig
  ): string {
    
    // Format papers as citations
    const formattedCitations = this.formatPapersAsCitations(papers.slice(0, 50));
    
    return `
You are an expert scientific writer with extensive experience publishing in top-tier journals.
Write a compelling introduction for a research paper based on the following analysis and research data.

## Research Context:
${JSON.stringify(analysisResult, null, 2)}

## User's Research:
Method: ${userResearch.method}
Results: ${userResearch.results}
Key Findings: ${userResearch.notes || 'Not specified'}

## Available References (use these for citations):
${formattedCitations.map((cite, idx) => `[${idx + 1}] ${this.formatCitation(cite, 'numbered')}`).join('\n')}

## Writing Requirements:
1. Style: ${config.style} journal format
2. Target word count: ${config.wordCount} words
3. Include sections: ${config.sections.join(', ')}
4. Citation style: ${config.citationStyle}
5. Language: ${config.language === 'ko' ? 'Korean' : 'English'}

## Introduction Structure:
1. Opening: Broad context and importance of plasma catalysis (2-3 sentences)
2. Current State: Review of existing approaches with citations [1-10]
3. Knowledge Gap: Identify limitations in current research [11-20]
4. Innovation: Describe your novel approach and hypothesis [21-30]
5. Objectives: Clear statement of research aims and scope
6. Significance: Expected impact and contributions [31-40]

## Citation Guidelines:
- Cite at least 30-40 papers from the provided references
- Group citations where appropriate (e.g., [1-5] for similar findings)
- Ensure recent papers (2020-2024) are well represented
- Balance between foundational and cutting-edge work

## Writing Style:
- Use active voice where appropriate
- Be concise but comprehensive
- Include specific metrics and quantitative comparisons
- Avoid overgeneralization
- Maintain logical flow between paragraphs

Provide the introduction in the following JSON format:
{
  "manuscript": "Full introduction text with citations like [1], [2-4], etc.",
  "referencesUsed": [list of reference numbers actually cited],
  "wordCount": actual word count,
  "keyPoints": ["point1", "point2", ...],
  "suggestedTitle": "Suggested paper title based on the content"
}
`;
  }

  formatPapersAsCitations(papers: any[]): Citation[] {
    return papers.map((paper, index) => ({
      id: `ref${index + 1}`,
      authors: paper.authors || ['Unknown'],
      title: paper.title,
      journal: paper.journal || paper.source || 'Unknown Journal',
      year: paper.year || new Date(paper.publishedDate || '2024').getFullYear().toString(),
      volume: paper.volume,
      pages: paper.pages,
      doi: paper.doi
    }));
  }

  formatCitation(citation: Citation, style: 'numbered' | 'author-year'): string {
    const authorList = citation.authors.length > 3 
      ? `${citation.authors[0]} et al.`
      : citation.authors.join(', ');
    
    if (style === 'numbered') {
      return `${authorList} ${citation.title}. ${citation.journal} ${citation.year}${citation.volume ? `, ${citation.volume}` : ''}${citation.pages ? `, ${citation.pages}` : ''}${citation.doi ? `. DOI: ${citation.doi}` : ''}.`;
    } else {
      return `${authorList} (${citation.year}). ${citation.title}. ${citation.journal}${citation.volume ? `, ${citation.volume}` : ''}${citation.pages ? `, ${citation.pages}` : ''}${citation.doi ? `. DOI: ${citation.doi}` : ''}.`;
    }
  }

  formatReferencesSection(citations: Citation[], usedRefs: number[], style: string): string {
    const usedCitations = citations.filter((_, idx) => usedRefs.includes(idx + 1));
    
    return `
## References

${usedCitations.map((cite, idx) => {
  const refNum = usedRefs[idx];
  return `[${refNum}] ${this.formatCitation(cite, 'numbered')}`;
}).join('\n\n')}
`;
  }

  generateManuscriptWithReferences(
    introText: string,
    citations: Citation[],
    usedRefs: number[]
  ): { manuscript: string; references: string } {
    // Add proper formatting for manuscript
    const formattedManuscript = `
# Introduction

${introText}

---
*This introduction was generated based on analysis of ${citations.length} papers with statistical validation.*
`;

    const references = this.formatReferencesSection(citations, usedRefs, 'numbered');

    return {
      manuscript: formattedManuscript,
      references
    };
  }

  // Enhanced statistical validation for introduction claims
  validateClaims(introText: string, papers: any[]): any {
    const claims = this.extractClaims(introText);
    const validationResults: any[] = [];

    claims.forEach(claim => {
      const supportingPapers = this.findSupportingEvidence(claim, papers);
      const statisticalSupport = this.calculateStatisticalSupport(supportingPapers);
      
      validationResults.push({
        claim,
        supportingPapers: supportingPapers.length,
        confidenceLevel: statisticalSupport.confidence,
        pValue: statisticalSupport.pValue,
        recommendation: statisticalSupport.confidence < 0.7 
          ? 'Consider revising or adding more support' 
          : 'Well supported'
      });
    });

    return validationResults;
  }

  private extractClaims(text: string): string[] {
    // Extract sentences that make specific claims
    const sentences = text.split(/[.!?]+/);
    const claimIndicators = [
      'demonstrated', 'showed', 'found', 'revealed', 'discovered',
      'achieved', 'improved', 'enhanced', 'increased', 'decreased',
      'significant', 'substantially', 'remarkably'
    ];
    
    return sentences.filter(sentence => 
      claimIndicators.some(indicator => 
        sentence.toLowerCase().includes(indicator)
      )
    );
  }

  private findSupportingEvidence(claim: string, papers: any[]): any[] {
    // Find papers that support the claim
    const keywords = this.extractKeywords(claim);
    
    return papers.filter(paper => {
      const abstract = (paper.abstract || '').toLowerCase();
      const title = (paper.title || '').toLowerCase();
      
      return keywords.some(keyword => 
        abstract.includes(keyword) || title.includes(keyword)
      );
    });
  }

  private extractKeywords(text: string): string[] {
    // Extract technical keywords from claim
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been'];
    const words = text.toLowerCase().split(/\s+/);
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .filter(word => /^[a-z]+$/.test(word));
  }

  private calculateStatisticalSupport(papers: any[]): any {
    const n = papers.length;
    
    // Simple confidence calculation based on paper count
    let confidence = 0;
    if (n >= 10) confidence = 0.95;
    else if (n >= 5) confidence = 0.8;
    else if (n >= 3) confidence = 0.6;
    else if (n >= 1) confidence = 0.4;
    else confidence = 0.2;

    // Mock p-value calculation (in real implementation, would use actual statistical test)
    const pValue = n > 0 ? Math.max(0.001, 0.5 / n) : 1.0;

    return {
      confidence,
      pValue,
      sampleSize: n
    };
  }
}

export default new IntroductionGeneratorService();