import journalData from '../data/journal_impact_factors.json';

export interface JournalInfo {
  title: string;
  impact_factor: number | null;
  percentage: string | null;
  category: string | null;
  issn: string | null;
  rank_in_category: number | null;
}

class JournalService {
  private journalDB: Record<string, JournalInfo>;

  constructor() {
    this.journalDB = journalData as Record<string, JournalInfo>;
  }

  getJournalInfo(journalName: string): JournalInfo | null {
    if (!journalName) return null;
    
    // Normalize journal name: uppercase and remove punctuation
    const normalizedName = journalName
      .trim()
      .toUpperCase()
      .replace(/\./g, '') // Remove periods
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Try exact match first
    if (this.journalDB[normalizedName]) {
      console.log(`Found exact match for "${journalName}": ${normalizedName}`);
      return this.journalDB[normalizedName];
    }

    // Don't do partial matching as it causes incorrect matches
    // Return null if no exact match found
    console.log(`No match found for journal: "${journalName}"`);
    return null;
  }

  enrichPaperWithJournalInfo(paper: any): any {
    const journalInfo = this.getJournalInfo(paper.journal || '');
    
    if (journalInfo && journalInfo.impact_factor !== null) {
      return {
        ...paper,
        impact_factor: journalInfo.impact_factor,
        journal_percentage: journalInfo.percentage,
        journal_category: journalInfo.category,
        journal_rank: journalInfo.rank_in_category
      };
    }
    
    // Return paper without journal info fields if no match found
    return {
      ...paper,
      impact_factor: undefined,
      journal_percentage: undefined,
      journal_category: undefined,
      journal_rank: undefined
    };
  }
}

export default new JournalService();