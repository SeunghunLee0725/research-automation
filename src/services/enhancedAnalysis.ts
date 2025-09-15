// Enhanced Analysis Service for Research Reports
// This module provides advanced AI analysis capabilities with multi-stage processing

export interface EnhancedPromptConfig {
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  includeDomainKnowledge: boolean;
  includeStatisticalAnalysis: boolean;
  includeVisualAnalysis: boolean;
  comparePapersCount: number;
}

export interface AnalysisStage {
  stageName: string;
  prompt: string;
  requiresPreviousStage: boolean;
  outputFormat: any;
}

export class EnhancedAnalysisService {
  private domainKnowledge = {
    plasmaResearch: {
      keyMetrics: [
        'conversion efficiency (%)',
        'energy efficiency (kWh/mol)',
        'selectivity (%)',
        'yield (%)',
        'stability (hours)',
        'temperature (K)',
        'pressure (Pa)',
        'power density (W/cm³)'
      ],
      evaluationCriteria: [
        'novelty of approach',
        'reproducibility',
        'scalability potential',
        'environmental impact',
        'cost-effectiveness',
        'safety considerations'
      ],
      technologyReadinessLevels: {
        'TRL 1-3': 'Basic research',
        'TRL 4-6': 'Technology development',
        'TRL 7-9': 'System deployment'
      }
    }
  };

  // Generate enhanced prompts with domain-specific knowledge
  generateEnhancedPrompt(
    userResearch: any,
    paperSummary: any[],
    config: EnhancedPromptConfig
  ): string {
    const basePrompt = this.createBasePrompt(userResearch, paperSummary);
    const enhancedSections = [];

    if (config.includeDomainKnowledge) {
      enhancedSections.push(this.addDomainContext());
    }

    if (config.includeStatisticalAnalysis) {
      enhancedSections.push(this.addStatisticalGuidance());
    }

    if (config.analysisDepth === 'comprehensive') {
      enhancedSections.push(this.addComprehensiveAnalysisInstructions());
    }

    enhancedSections.push(this.addChainOfThought());
    enhancedSections.push(this.addFewShotExamples());

    return `${basePrompt}\n\n${enhancedSections.join('\n\n')}`;
  }

  private createBasePrompt(userResearch: any, paperSummary: any[]): string {
    return `
당신은 플라즈마 촉매 연구 분야의 전문가입니다. 다음 연구 결과를 분석해주세요.

## 사용자 연구 정보:
- 실험 방법: ${userResearch.method}
- 실험 결과: ${userResearch.results}
- 추가 정보: ${userResearch.notes || '없음'}

## 비교 대상 논문 데이터 (${paperSummary.length}개):
${paperSummary.map((paper, idx) => `
${idx + 1}. ${paper.title}
   - 저널: ${paper.journal}
   - 연도: ${paper.year}
   - 초록: ${paper.abstract}
   - 주요 방법론: ${paper.methodology || '정보 없음'}
   - 핵심 결과: ${paper.keyFindings || '정보 없음'}
`).join('\n')}`;
  }

  private addDomainContext(): string {
    return `
## 도메인 전문 평가 기준:
평가 시 다음 플라즈마 연구 핵심 지표를 고려하세요:
${this.domainKnowledge.plasmaResearch.keyMetrics.map(metric => `- ${metric}`).join('\n')}

기술 성숙도 수준 (TRL) 평가:
${Object.entries(this.domainKnowledge.plasmaResearch.technologyReadinessLevels)
  .map(([level, desc]) => `- ${level}: ${desc}`).join('\n')}`;
  }

  private addStatisticalGuidance(): string {
    return `
## 통계적 분석 지침:
1. 실험 결과의 통계적 유의성을 평가하세요 (p-value < 0.05 기준)
2. 신뢰구간(CI)을 고려한 결과 해석을 제공하세요
3. 이상치(outlier) 존재 여부와 영향을 분석하세요
4. 표본 크기와 통계적 검정력(statistical power)을 평가하세요
5. 변수 간 상관관계와 인과관계를 구분하여 설명하세요`;
  }

  private addComprehensiveAnalysisInstructions(): string {
    return `
## 심층 분석 요구사항:
1. SWOT 분석 수행 (Strengths, Weaknesses, Opportunities, Threats)
2. 특허 가능성 평가 (신규성, 진보성, 산업상 이용가능성)
3. 경제성 분석 (CAPEX, OPEX, ROI 예측)
4. 환경 영향 평가 (LCA - Life Cycle Assessment 관점)
5. 규제 준수 및 안전성 평가
6. 기술 이전 및 상업화 전략 제안`;
  }

  private addChainOfThought(): string {
    return `
## 분석 프로세스 (단계별로 수행):
1단계: 연구의 핵심 혁신점 식별
2단계: 기존 문헌과의 정량적 비교
3단계: 기술적 타당성 및 재현성 평가
4단계: 산업 응용 가능성 분석
5단계: 위험 요소 및 한계점 평가
6단계: 향후 연구 방향 및 개선 방안 도출

각 단계에서 "왜"와 "어떻게"를 명확히 설명하세요.`;
  }

  private addFewShotExamples(): string {
    return `
## 우수 분석 예시:
### 예시 1 - 혁신성 평가:
"본 연구는 DBD 플라즈마와 Ni/Al2O3 촉매를 결합하여 메탄 전환율을 85%까지 향상시켰습니다. 
이는 기존 열촉매 공정(65%) 대비 20%p 개선된 수치로, 특히 저온(350K) 조건에서 달성했다는 점이 혁신적입니다.
플라즈마-촉매 시너지 메커니즘을 in-situ DRIFTS로 규명한 점은 학술적 가치가 높으며, 
에너지 효율 3.2 kWh/mol은 상용화 기준(< 5 kWh/mol)을 충족합니다."

### 예시 2 - 한계점 분석:
"장기 안정성 테스트가 100시간으로 제한적이며, 상용 공정 요구사항(8000시간)과 큰 격차가 있습니다.
촉매 비활성화 메커니즘이 불명확하고, 스케일업 시 플라즈마 균일성 문제가 예상됩니다.
추가로 경제성 분석이 부재하여 실제 산업 적용 가능성 판단이 어렵습니다."`;
  }

  // Multi-stage analysis orchestration
  async performMultiStageAnalysis(
    userResearch: any,
    paperData: any,
    config: EnhancedPromptConfig
  ): Promise<any> {
    const stages: AnalysisStage[] = [
      {
        stageName: 'primary',
        prompt: this.generateEnhancedPrompt(userResearch, paperData, config),
        requiresPreviousStage: false,
        outputFormat: 'structured'
      },
      {
        stageName: 'statistical',
        prompt: this.generateStatisticalAnalysisPrompt(userResearch),
        requiresPreviousStage: true,
        outputFormat: 'numerical'
      },
      {
        stageName: 'comparative',
        prompt: this.generateComparativeAnalysisPrompt(paperData),
        requiresPreviousStage: true,
        outputFormat: 'comparative'
      },
      {
        stageName: 'predictive',
        prompt: this.generatePredictiveAnalysisPrompt(),
        requiresPreviousStage: true,
        outputFormat: 'forecast'
      }
    ];

    const results: any = {};
    let previousStageResult = null;

    for (const stage of stages) {
      if (stage.requiresPreviousStage && !previousStageResult) {
        continue;
      }

      // This would call the actual API in production
      // For now, returning structure for implementation
      results[stage.stageName] = {
        prompt: stage.prompt,
        requiresImplementation: true
      };

      previousStageResult = results[stage.stageName];
    }

    return this.consolidateResults(results);
  }

  private generateStatisticalAnalysisPrompt(userResearch: any): string {
    return `
## 통계 분석 요청:
다음 실험 결과에 대한 정량적 통계 분석을 수행하세요:
${userResearch.results}

분석 항목:
1. 기술 통계량 (평균, 표준편차, 중앙값, 사분위수)
2. 정규성 검정 (Shapiro-Wilk test)
3. 가설 검정 (적절한 검정 방법 선택 및 p-value 계산)
4. 효과 크기 (Cohen's d 또는 η²)
5. 신뢰구간 (95% CI)
6. 검정력 분석 (post-hoc power analysis)

결과를 표와 그래프로 시각화하여 제시하세요.`;
  }

  private generateComparativeAnalysisPrompt(paperData: any[]): string {
    return `
## 비교 분석 요청:
제공된 ${paperData.length}개 논문과 사용자 연구를 다음 차원에서 비교하세요:

1. 성능 지표 매트릭스 (각 논문별 핵심 지표 정리)
2. 방법론적 차이점과 장단점
3. 혁신성 순위 (1-10 척도)
4. 기술 성숙도 평가 (TRL 레벨)
5. 비용-효과 분석
6. 확장성 평가

벤치마크 테이블과 레이더 차트 형식으로 결과를 제시하세요.`;
  }

  private generatePredictiveAnalysisPrompt(): string {
    return `
## 예측 분석 요청:
현재 연구 결과를 바탕으로 다음을 예측하세요:

1. 기술 발전 궤적 (1년, 3년, 5년 후)
2. 상용화 시점 예측 (기술적/경제적 관점)
3. 시장 침투율 예상 (S-curve 모델 적용)
4. 필요 투자 규모 추정
5. 주요 위험 요인과 발생 확률
6. 대체 기술 출현 가능성

각 예측에 대해 신뢰도(%)와 근거를 제시하세요.`;
  }

  private consolidateResults(stageResults: any): any {
    // Consolidate multi-stage results into final analysis
    return {
      primaryAnalysis: stageResults.primary,
      statisticalInsights: stageResults.statistical,
      comparativePosition: stageResults.comparative,
      futurePredictions: stageResults.predictive,
      confidenceScore: this.calculateConfidenceScore(stageResults),
      timestamp: new Date().toISOString()
    };
  }

  private calculateConfidenceScore(results: any): number {
    // Calculate overall confidence score based on multiple factors
    let score = 70; // Base score

    // Adjust based on data completeness
    if (results.primary) score += 10;
    if (results.statistical) score += 10;
    if (results.comparative) score += 5;
    if (results.predictive) score += 5;

    return Math.min(100, score);
  }

  // Extract trends from historical data
  extractTemporalTrends(papers: any[]): any {
    const yearlyData = new Map<string, any[]>();
    
    papers.forEach(paper => {
      const year = paper.year || new Date(paper.publishedDate).getFullYear();
      if (!yearlyData.has(year)) {
        yearlyData.set(year, []);
      }
      yearlyData.get(year)?.push(paper);
    });

    const trends = {
      publicationTrend: Array.from(yearlyData.entries()).map(([year, papers]) => ({
        year,
        count: papers.length,
        avgCitations: this.calculateAvgCitations(papers)
      })),
      emergingTopics: this.identifyEmergingTopics(papers),
      decliningTopics: this.identifyDecliningTopics(papers),
      technologyMaturity: this.assessTechnologyMaturity(papers)
    };

    return trends;
  }

  private calculateAvgCitations(papers: any[]): number {
    const citations = papers
      .map(p => p.citations || 0)
      .filter(c => c > 0);
    
    return citations.length > 0 
      ? citations.reduce((a, b) => a + b, 0) / citations.length 
      : 0;
  }

  private identifyEmergingTopics(papers: any[]): string[] {
    // Simplified emerging topics identification
    // In production, use NLP and trend analysis
    const recentPapers = papers.filter(p => {
      const year = p.year || new Date(p.publishedDate).getFullYear();
      return year >= new Date().getFullYear() - 2;
    });

    const topicFrequency = new Map<string, number>();
    recentPapers.forEach(paper => {
      const keywords = paper.keywords || [];
      keywords.forEach((keyword: string) => {
        topicFrequency.set(keyword, (topicFrequency.get(keyword) || 0) + 1);
      });
    });

    return Array.from(topicFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  private identifyDecliningTopics(papers: any[]): string[] {
    // Identify topics that were popular but declining
    // This is simplified - production would use time-series analysis
    return ['thermal catalysis only', 'single-stage processing'];
  }

  private assessTechnologyMaturity(papers: any[]): string {
    const recentPapers = papers.filter(p => {
      const year = p.year || new Date(p.publishedDate).getFullYear();
      return year >= new Date().getFullYear() - 1;
    });

    // Simple heuristic for technology maturity
    if (recentPapers.length > papers.length * 0.3) {
      return 'Growing/Emerging';
    } else if (recentPapers.length > papers.length * 0.1) {
      return 'Mature/Stable';
    } else {
      return 'Declining/Saturated';
    }
  }
}

export default new EnhancedAnalysisService();