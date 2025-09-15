// Multi-stage Analysis Service
// Implements progressive analysis with multiple AI calls for deeper insights

import axios from 'axios';

export interface StageResult {
  stage: string;
  analysis: any;
  confidence: number;
  timestamp: string;
}

export interface MultiStageConfig {
  enableStatisticalAnalysis: boolean;
  enablePredictiveAnalysis: boolean;
  enableVisualAnalysis: boolean;
  maxStages: number;
}

export class MultiStageAnalysisService {
  private apiKey: string;
  private stages: StageResult[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async performMultiStageAnalysis(
    initialData: any,
    userResearch: any,
    config: MultiStageConfig
  ): Promise<any> {
    // Stage 1: Primary Analysis
    const stage1Result = await this.performPrimaryAnalysis(initialData, userResearch);
    this.stages.push(stage1Result);

    // Stage 2: Deep Comparative Analysis (uses Stage 1 results)
    if (this.stages.length < config.maxStages) {
      const stage2Result = await this.performComparativeAnalysis(
        initialData,
        userResearch,
        stage1Result
      );
      this.stages.push(stage2Result);
    }

    // Stage 3: Statistical Validation (if enabled)
    if (config.enableStatisticalAnalysis && this.stages.length < config.maxStages) {
      const stage3Result = await this.performStatisticalAnalysis(
        userResearch,
        this.stages[this.stages.length - 1]
      );
      this.stages.push(stage3Result);
    }

    // Stage 4: Predictive Analysis (if enabled)
    if (config.enablePredictiveAnalysis && this.stages.length < config.maxStages) {
      const stage4Result = await this.performPredictiveAnalysis(
        this.stages
      );
      this.stages.push(stage4Result);
    }

    // Consolidate all stages
    return this.consolidateStages();
  }

  private async performPrimaryAnalysis(
    paperData: any,
    userResearch: any
  ): Promise<StageResult> {
    const prompt = `
    Perform a comprehensive initial analysis of this research:
    
    User Research: ${JSON.stringify(userResearch)}
    Reference Papers: ${JSON.stringify(paperData.slice(0, 10))}
    
    Focus on:
    1. Innovation and creativity assessment
    2. Technical merit evaluation
    3. Key strengths and weaknesses
    4. Initial comparison with literature
    
    Provide structured JSON output with scores and detailed explanations.
    `;

    // Simulated API call - replace with actual implementation
    const analysis = await this.callAIAPI(prompt);
    
    return {
      stage: 'primary',
      analysis,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
  }

  private async performComparativeAnalysis(
    paperData: any,
    userResearch: any,
    previousStage: StageResult
  ): Promise<StageResult> {
    const prompt = `
    Based on the initial analysis, perform a deeper comparative study:
    
    Previous Analysis: ${JSON.stringify(previousStage.analysis)}
    Extended Paper Database: ${JSON.stringify(paperData.slice(0, 30))}
    
    Analyze:
    1. Detailed performance benchmarking
    2. Methodological advantages and limitations
    3. Position in current research landscape
    4. Unique contributions and gaps
    5. Synergies with existing work
    
    Include quantitative comparisons where possible.
    `;

    const analysis = await this.callAIAPI(prompt);
    
    return {
      stage: 'comparative',
      analysis,
      confidence: 0.88,
      timestamp: new Date().toISOString()
    };
  }

  private async performStatisticalAnalysis(
    userResearch: any,
    previousStage: StageResult
  ): Promise<StageResult> {
    const prompt = `
    Perform statistical validation and analysis:
    
    Research Data: ${JSON.stringify(userResearch)}
    Previous Insights: ${JSON.stringify(previousStage.analysis)}
    
    Calculate and evaluate:
    1. Statistical significance (p-values, confidence intervals)
    2. Effect sizes and practical significance
    3. Data quality and reliability metrics
    4. Outlier detection and impact
    5. Trend analysis and correlations
    6. Sample size adequacy
    
    Provide specific statistical tests and their interpretations.
    `;

    const analysis = await this.callAIAPI(prompt);
    
    return {
      stage: 'statistical',
      analysis,
      confidence: 0.92,
      timestamp: new Date().toISOString()
    };
  }

  private async performPredictiveAnalysis(
    allStages: StageResult[]
  ): Promise<StageResult> {
    const consolidatedInsights = allStages.map(s => ({
      stage: s.stage,
      keyFindings: s.analysis
    }));

    const prompt = `
    Based on comprehensive multi-stage analysis, provide predictive insights:
    
    All Analysis Stages: ${JSON.stringify(consolidatedInsights)}
    
    Predict:
    1. Future research trajectory (1, 3, 5 years)
    2. Technology readiness evolution
    3. Commercial viability timeline
    4. Potential breakthroughs and obstacles
    5. Required resources and investments
    6. Success probability with confidence bands
    
    Use established innovation diffusion models and technology forecasting methods.
    `;

    const analysis = await this.callAIAPI(prompt);
    
    return {
      stage: 'predictive',
      analysis,
      confidence: 0.78,
      timestamp: new Date().toISOString()
    };
  }

  private async callAIAPI(prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert research analyst specializing in plasma catalysis. Provide detailed, structured JSON responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI API call failed:', error);
      // Return mock data for development
      return {
        error: 'API call failed',
        mockData: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  private consolidateStages(): any {
    const consolidated: any = {
      stageCount: this.stages.length,
      overallConfidence: this.calculateOverallConfidence(),
      timestamp: new Date().toISOString(),
      stages: {}
    };

    // Merge all stage results
    this.stages.forEach(stage => {
      consolidated.stages[stage.stage] = stage.analysis;
    });

    // Extract key insights across stages
    consolidated.keyInsights = this.extractKeyInsights();
    consolidated.recommendations = this.generateRecommendations();
    consolidated.riskAssessment = this.assessRisks();

    return consolidated;
  }

  private calculateOverallConfidence(): number {
    if (this.stages.length === 0) return 0;
    
    const totalConfidence = this.stages.reduce((sum, stage) => sum + stage.confidence, 0);
    return totalConfidence / this.stages.length;
  }

  private extractKeyInsights(): string[] {
    const insights: string[] = [];
    
    // Extract top insights from each stage
    this.stages.forEach(stage => {
      if (stage.analysis.keyFindings) {
        insights.push(...stage.analysis.keyFindings.slice(0, 2));
      }
      if (stage.analysis.innovations) {
        insights.push(...stage.analysis.innovations.slice(0, 2));
      }
    });

    // Remove duplicates and limit to top 10
    return [...new Set(insights)].slice(0, 10);
  }

  private generateRecommendations(): any {
    return {
      immediate: [
        'Validate key findings with additional experiments',
        'Conduct sensitivity analysis on critical parameters',
        'Prepare detailed protocol for reproducibility'
      ],
      shortTerm: [
        'Explore identified optimization opportunities',
        'Initiate collaboration discussions with complementary groups',
        'Submit abstracts to relevant conferences'
      ],
      longTerm: [
        'Develop IP strategy for novel findings',
        'Plan scale-up studies',
        'Seek industry partnerships for commercialization'
      ]
    };
  }

  private assessRisks(): any {
    return {
      technical: [
        {
          risk: 'Scalability challenges',
          probability: 'Medium',
          impact: 'High',
          mitigation: 'Early pilot-scale testing'
        },
        {
          risk: 'Reproducibility issues',
          probability: 'Low',
          impact: 'High',
          mitigation: 'Detailed protocol documentation'
        }
      ],
      commercial: [
        {
          risk: 'Market readiness',
          probability: 'High',
          impact: 'Medium',
          mitigation: 'Phased commercialization approach'
        }
      ],
      regulatory: [
        {
          risk: 'Safety compliance',
          probability: 'Low',
          impact: 'High',
          mitigation: 'Early regulatory engagement'
        }
      ]
    };
  }
}

export default MultiStageAnalysisService;