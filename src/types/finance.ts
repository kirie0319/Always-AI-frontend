export interface FinancialData {
  // 基本情報
  age: number;
  industry: string;
  company: string;
  position: string;
  annualIncome: number;
  
  // 家族構成
  spouse: boolean;
  spouseAge?: number;
  spouseIncome?: number;
  children: number;
  childrenAges?: number[];
  
  // 資産状況
  savings: number;
  investments?: {
    stocks?: number;
    bonds?: number;
    mutualFunds?: number;
    other?: number;
  };
  
  // 負債
  mortgageBalance?: number;
  mortgageMonthlyPayment?: number;
  carLoanBalance?: number;
  carLoanMonthlyPayment?: number;
  otherDebts?: number;
  
  // 支出
  monthlyExpenses: number;
  
  // 将来計画
  retirementAge: number;
  expectedPension?: number;
  homeOwnership: boolean;
  carOwnership: boolean;
  
  // ライフイベント
  educationPlans?: {
    university: boolean;
    privateSchool: boolean;
    studyAbroad: boolean;
  };
  
  // 投資方針
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
}

export interface CRMData {
  personalInfo: {
    name: string;
    age: number;
    industry: string;
    company: string;
    position: string;
    annualIncome: number;
  };
  familyInfo: {
    spouse: boolean;
    spouseAge?: number;
    spouseIncome?: number;
    children: number;
    childrenAges?: number[];
  };
  financialInfo: {
    savings: number;
    investments: Record<string, number>;
    debts: Record<string, number>;
    monthlyExpenses: number;
  };
}

// 構造化された戦略データ
export interface FinancialIssue {
  title: string;
  details: string[];
}

export interface PortfolioItem {
  category: string;
  amount: string;
  notes: string;
}

export interface ProductPortfolioItem {
  purpose: string;
  product: string;
  amount: string;
}

export interface CurrentAnalysis {
  description: string;
  issues: FinancialIssue[];
  portfolio: PortfolioItem[];
  total_amount: string;
}

export interface Strategy {
  title: string;
  description: string;
  reason: string;
  details: string[];
  expected_results: string[];
  product_portfolio: ProductPortfolioItem[];
}

export interface StrategyData {
  advisor_type: string;
  customer_info: string;
  current_analysis: CurrentAnalysis;
  strategies: Strategy[];
}

// ライフプランシミュレーション用の型定義
export interface LifeplanYearData {
  year: number;
  primary_age: number;
  spouse_age?: number;
  child1_age?: number;
  child2_age?: number;
  total_income: number;
  primary_income: number;
  primary_retirement?: number;
  primary_pension?: number;
  spouse_income?: number;
  spouse_retirement?: number;
  spouse_pension?: number;
  home_loan_deduction?: number;
  other_income?: number;
  total_expense: number;
  living_expenses: number;
  housing_expenses: number;
  loan_repayment: number;
  insurance_total: number;
  life_insurance: number;
  endowment_insurance: number;
  ideco_contribution: number;
  vehicle_expenses: number;
  hobby_lessons: number;
  tax_expenses: number;
  child_education?: number;
  home_renovation?: number;
  travel_expenses?: number;
  other_expenses?: number;
  annual_balance: number;
  cash_balance: number;
  llm_notes?: string;
  special_events?: string[];
}

export interface LLMLifeplanData {
  simulation_approach: string;
  key_assumptions: string[];
  yearly_projections: Array<{
    year: number;
    age: number;
    annual_income: number;
    annual_expenses: number;
    special_events: string[];
    savings_balance: number;
    investment_value: number;
    net_worth: number;
    cash_flow: number;
    advisor_notes: string;
  }>;
  graph_highlights: {
    peak_wealth_age: number;
    retirement_readiness: string;
    cash_flow_turning_points: string[];
    risk_periods: string[];
    growth_opportunities: string[];
  };
  personalized_insights: {
    wealth_building_strategy: string;
    life_stage_planning: string;
    contingency_planning: string;
  };
}

export interface LLMAnalysis {
  overall_assessment: string;
  risk_analysis: Array<{
    period: string;
    risk: string;
    impact: string;
    solution: string;
  }>;
  opportunities: Array<{
    period: string;
    opportunity: string;
    benefit: string;
    action: string;
  }>;
  customized_advice: Array<{
    category: string;
    advice: string;
    priority: string;
  }>;
  chart_insights: {
    deposit_trend: string;
    cash_flow_pattern: string;
    critical_periods: string;
  };
}

export interface AdvisorInfo {
  prompt_title: string;
  prompt_description: string;
  parameters_used: {
    income_growth_rate: number;
    investment_return_rate: number;
    inflation_rate: number;
    retirement_age: number;
    life_expectancy: number;
    risk_buffer: number;
    travel_frequency: number;
    renovation_cycle: number;
    car_replacement_cycle: number;
  };
}

export interface LifeplanData {
  customer_name: string;
  family_type: string;
  years_data: LifeplanYearData[];
  chart_summary: {
    age_labels: number[];
    deposit_balance: number[];
    asset_balance: number[];
    income_expense_balance: number[];
    insights?: {
      deposit_trend: string;
      cash_flow_pattern: string;
      critical_periods: string;
    };
    llm_highlights?: {
      peak_wealth_age: number;
      retirement_readiness: string;
      cash_flow_turning_points: string[];
      risk_periods: string[];
      growth_opportunities: string[];
    };
    data_source?: 'calculation' | 'llm_generated' | 'calculation_fallback';
  };
  llm_analysis?: LLMAnalysis;
  llm_lifeplan?: LLMLifeplanData;
  advisor_info?: AdvisorInfo;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  strategy_data?: StrategyData;
} 