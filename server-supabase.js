import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service key for backend operations
let supabase;

function initSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
    process.exit(1);
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  return supabase;
}

// Initialize on first use
function getSupabase() {
  if (!supabase) {
    initSupabase();
  }
  return supabase;
}

// Middleware to verify JWT token and get user
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await getSupabase().auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Helper functions for database operations
const dbHelpers = {
  // Save paper to database
  async savePaper(userId, paperData) {
    const { data, error } = await getSupabase()
      .from('saved_papers')
      .insert({
        user_id: userId,
        title: paperData.title,
        authors: paperData.authors,
        abstract: paperData.abstract,
        journal: paperData.journal,
        publication_date: paperData.publicationDate,
        doi: paperData.doi,
        url: paperData.url,
        source: paperData.source,
        metadata: paperData.metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's saved papers
  async getUserPapers(userId) {
    const { data, error } = await getSupabase()
      .from('saved_papers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Delete a paper
  async deletePaper(userId, paperId) {
    const { error } = await getSupabase()
      .from('saved_papers')
      .delete()
      .eq('user_id', userId)
      .eq('id', paperId);

    if (error) throw error;
  },

  // Save analysis result
  async saveAnalysis(userId, analysisData) {
    const { data, error } = await getSupabase()
      .from('analysis_results')
      .insert({
        user_id: userId,
        title: analysisData.title,
        analysis_type: analysisData.analysisType,
        input_data: analysisData.inputData,
        results: analysisData.results,
        status: analysisData.status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's analysis results
  async getUserAnalyses(userId) {
    const { data, error } = await getSupabase()
      .from('analysis_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update analysis status
  async updateAnalysisStatus(userId, analysisId, status, results = null) {
    const updateData = { status };
    if (results) {
      updateData.results = results;
    }

    const { data, error } = await getSupabase()
      .from('analysis_results')
      .update(updateData)
      .eq('user_id', userId)
      .eq('id', analysisId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Save paper introduction
  async saveIntroduction(userId, introData) {
    const { data, error } = await getSupabase()
      .from('paper_introductions')
      .insert({
        user_id: userId,
        title: introData.title,
        introduction_text: introData.introductionText,
        keywords: introData.keywords,
        paper_references: introData.references
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's introductions
  async getUserIntroductions(userId) {
    const { data, error } = await getSupabase()
      .from('paper_introductions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Save paper plan
  async savePaperPlan(userId, planData) {
    const { data, error } = await getSupabase()
      .from('paper_plans')
      .insert({
        user_id: userId,
        title: planData.title,
        research_question: planData.researchQuestion,
        methodology: planData.methodology,
        expected_outcomes: planData.expectedOutcomes,
        timeline: planData.timeline,
        resources: planData.resources,
        status: planData.status || 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's paper plans
  async getUserPaperPlans(userId) {
    const { data, error } = await getSupabase()
      .from('paper_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Delete paper plan
  async deletePaperPlan(userId, planId) {
    const { error } = await getSupabase()
      .from('paper_plans')
      .delete()
      .eq('user_id', userId)
      .eq('id', planId);

    if (error) throw error;
  },

  // Log search history
  async logSearch(userId, searchData) {
    const { error } = await getSupabase()
      .from('search_history')
      .insert({
        user_id: userId,
        query: searchData.query,
        source: searchData.source,
        filters: searchData.filters,
        results_count: searchData.resultsCount
      });

    if (error) throw error;
  },

  // Get user's search history
  async getUserSearchHistory(userId, limit = 50) {
    const { data, error } = await getSupabase()
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

export {
  getSupabase,
  authenticateUser,
  dbHelpers
};