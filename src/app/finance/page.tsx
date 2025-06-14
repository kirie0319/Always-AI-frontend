"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faDownload,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { StrategyData, LifeplanData } from '@/types/finance';
import StrategyDisplay from '@/components/StrategyDisplay';
import LifeplanDisplay from '@/components/LifeplanDisplay';

interface FamilyMember {
  relation: string;
  age: number;
  occupation: string;
}

interface Investment {
  type: string;
  amount: number;
  name: string;
  risk: string;
  hasMaturity: boolean;
}

interface Loan {
  type: string;
  balance: number;
  remainingMonths: number;
}

interface ChildEducation {
  kindergarten: 'national' | 'private';
  elementary: 'national' | 'private';
  middle: 'national' | 'private';
  high: 'national' | 'private';
  university: 'national' | 'private';
}

interface FinancialData {
  // Step 1: 本人情報
  age: number;
  industry: string;
  company: string;
  position: string;
  jobType: string;
  annualIncome: number;
  familyType: 'single' | 'family';
  familyMembers: FamilyMember[];
  
  // Step 2: 財務状況
  savings: number;
  hasInvestments: boolean;
  investments: Investment[];
  retirementMoney: number;
  hasCar: boolean;
  hasHome: boolean;
  monthlyExpenses: number;
  loans: Loan[];
  
  // Step 3: 各種ご意向
  carPurchase: boolean;
  homeRemodel: boolean;
  domesticTravel: boolean;
  internationalTravel: boolean;
  petOwnership: boolean;
  careWorries: boolean;
  otherExpenses: boolean;
  investmentStance: string;
  wantsChildren: boolean;
  childEducation: ChildEducation;
}

// StrategyDataとLifeplanDataは types/finance.ts からインポート

// プロンプトのデータ構造
interface PromptOption {
  id: string;
  title: string;
  description: string;
  content: string;
}

export default function FinanceProject() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [cifId, setCifId] = useState('1234567890123');
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<StrategyData | null>(null);
  
  // プロンプト選択関連の状態
  const [selectedPrompt, setSelectedPrompt] = useState<PromptOption | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [lifeplanData, setLifeplanData] = useState<LifeplanData | null>(null);

  // プロンプト一覧を取得する関数
  const loadPromptOptions = async () => {
    setIsLoadingPrompts(true);
    try {
      const response = await apiRequest('/api/prompts');
      if (response.success && response.prompts) {
        setPromptOptions(response.prompts.map((prompt: { id: number; title: string; description?: string; content: string }) => ({
          id: prompt.id.toString(),
          title: prompt.title,
          description: prompt.description || 'プロンプトの説明がありません',
          content: prompt.content
        })));
      } else {
        console.error('プロンプト取得失敗:', response);
        // フォールバック: デフォルトプロンプトを使用
        setPromptOptions([
          {
            id: 'default',
            title: '🏦 標準アドバイザー',
            description: 'バランスの取れた金融アドバイスを提供',
            content: 'あなたは経験豊富なファイナンシャルアドバイザーです。顧客の状況に応じて適切な金融アドバイスを提供してください。'
          }
        ]);
      }
    } catch (error) {
      console.error('プロンプト読み込みエラー:', error);
      // エラー時のフォールバック
      setPromptOptions([
        {
          id: 'default',
          title: '🏦 標準アドバイザー',
          description: 'バランスの取れた金融アドバイスを提供',
          content: 'あなたは経験豊富なファイナンシャルアドバイザーです。顧客の状況に応じて適切な金融アドバイスを提供してください。'
        }
      ]);
    } finally {
      setIsLoadingPrompts(false);
    }
  };
  
  const [financialData, setFinancialData] = useState<FinancialData>({
    // Step 1: 本人情報
    age: 34,
    industry: 'IT業界',
    company: '株式会社ZEALS',
    position: '管理職・マネージャー',
    jobType: '営業',
    annualIncome: 7000000,
    familyType: 'family',
    familyMembers: [
      { relation: '配偶者', age: 34, occupation: '会社員' }
    ],
    
    // Step 2: 財務状況
    savings: 7000000,
    hasInvestments: true,
    investments: [
      { type: '投資信託', amount: 5000000, name: '', risk: '', hasMaturity: true }
    ],
    retirementMoney: 20000000,
    hasCar: true,
    hasHome: true,
    monthlyExpenses: 400000,
    loans: [
      { type: '住宅ローン', balance: 20000000, remainingMonths: 240 },
      { type: '自動車ローン', balance: 4000000, remainingMonths: 84 }
    ],
    
    // Step 3: 各種ご意向
    carPurchase: true,
    homeRemodel: true,
    domesticTravel: true,
    internationalTravel: true,
    petOwnership: true,
    careWorries: true,
    otherExpenses: true,
    investmentStance: 'ミドルリスク ミドルリターン',
    wantsChildren: true,
    childEducation: {
      kindergarten: 'national',
      elementary: 'national',
      middle: 'national',
      high: 'private',
      university: 'private'
    }
  });

  const changeTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  // APIベースURL設定
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://finance-advisory-project-production.up.railway.app';
  
  // APIリクエストヘルパー
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    console.log(`Finance API Request: ${endpoint}`);
    console.log(`Token: ${token ? `${token.substring(0, 20)}...` : 'なし'}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('認証エラー: トークンが無効です');
        // 認証エラーの場合、ログインページにリダイレクト
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
        throw new Error('認証が必要です。再度ログインしてください。');
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  };

  // CRMデータ読み込み
  const handleLoadCRMData = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/financial/crm-data/${cifId}`);
      console.log('CRM Data Response:', response);
      if (response.success && response.data) {
        const crmData = response.data;
        setFinancialData(prev => ({
          ...prev,
          // Step 1: 本人情報
          age: crmData.personalInfo?.age || prev.age,
          industry: crmData.personalInfo?.industry || prev.industry,
          company: crmData.personalInfo?.company || prev.company,
          position: crmData.personalInfo?.position || prev.position,
          jobType: crmData.personalInfo?.jobType || prev.jobType,
          annualIncome: (crmData.personalInfo?.annualIncome || 0) * 10000, // 万円→円に変換
          familyType: crmData.personalInfo?.familyStructure === '世帯持ち' ? 'family' : 'single',
          familyMembers: crmData.personalInfo?.familyMembers || prev.familyMembers,
          
          // Step 2: 財務状況
          savings: (crmData.financialInfo?.savings || 0) * 10000, // 万円→円に変換
          hasInvestments: crmData.financialInfo?.hasInvestments || prev.hasInvestments,
          investments: crmData.financialInfo?.investments?.map((inv: Investment) => ({
            type: inv.type,
            amount: inv.amount * 10000, // 万円→円に変換
            name: inv.name,
            risk: inv.risk,
            hasMaturity: inv.hasMaturity
          })) || prev.investments,
          retirementMoney: (crmData.financialInfo?.retirement || 0) * 10000, // 万円→円に変換
          hasCar: crmData.financialInfo?.hasCar || prev.hasCar,
          hasHome: crmData.financialInfo?.hasHome || prev.hasHome,
          monthlyExpenses: (crmData.financialInfo?.livingExpenses || 0) * 10000, // 万円→円に変換
          loans: crmData.financialInfo?.loans?.map((loan: Loan) => ({
            type: loan.type,
            balance: loan.balance * 10000, // 万円→円に変換
            remainingMonths: loan.remainingMonths
          })) || prev.loans,
          
          // Step 3: 各種ご意向
          carPurchase: crmData.intentions?.carPurchase || prev.carPurchase,
          homeRemodel: crmData.intentions?.homeRenovation || prev.homeRemodel,
          domesticTravel: crmData.intentions?.domesticTravel || prev.domesticTravel,
          internationalTravel: crmData.intentions?.overseasTravel || prev.internationalTravel,
          petOwnership: crmData.intentions?.petOwnership || prev.petOwnership,
          careWorries: crmData.intentions?.caregivingConcerns || prev.careWorries,
          otherExpenses: crmData.intentions?.otherExpenses || prev.otherExpenses,
          investmentStance: crmData.intentions?.investmentStance || prev.investmentStance,
          wantsChildren: crmData.intentions?.hasChildren || prev.wantsChildren,
          childEducation: crmData.intentions?.childEducation ? {
            kindergarten: crmData.intentions.childEducation.kindergarten === '国公立' ? 'national' : 'private',
            elementary: crmData.intentions.childEducation.elementarySchool === '国公立' ? 'national' : 'private',
            middle: crmData.intentions.childEducation.juniorHighSchool === '国公立' ? 'national' : 'private',
            high: crmData.intentions.childEducation.highSchool === '国公立' ? 'national' : 'private',
            university: crmData.intentions.childEducation.university === '国公立' ? 'national' : 'private'
          } : prev.childEducation
        }));
        setCurrentStep(1);
        alert('CRMデータを読み込みました');
      }
    } catch (error) {
      console.error('CRMデータ読み込みエラー:', error);
      alert('CRMデータの読み込みに失敗しました。手動で入力してください。');
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  // フォームデータ更新
  const updateFormData = (field: keyof FinancialData, value: unknown) => {
    setFinancialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 財務データ送信
  const handleSubmitFinancialData = async () => {
    if (!financialData.age) {
      alert('基本情報を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const submissionData = {
        ...financialData,
        selectedPrompt: selectedPrompt
      };

      const response = await apiRequest('/financial/submit', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });

      if (response.success) {
        alert(`財務情報の送信が完了しました！${selectedPrompt ? ` (選択プロンプト: ${selectedPrompt.title})` : ''}`);
        
        // 戦略データを設定
        if (response.strategy_data) {
          setStrategy(response.strategy_data);
        }
        
        // 財務戦略タブに切り替え
        setActiveTab(1);
      } else {
        alert('送信に失敗しました: ' + response.message);
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 新しい関数: ライフプランデータを生成
  const generateLifeplan = async () => {
    if (!financialData.age) {
      alert('まず顧客情報を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      // フロントエンドのデータ構造をバックエンドの期待する形式に変換
      const transformedData = {
        basicInfo: {
          age: financialData.age,
          annualIncome: Math.floor(financialData.annualIncome / 10000), // 円を万円に変換
          industry: financialData.industry,
          company: financialData.company,
          position: financialData.position,
          jobType: financialData.jobType,
        },
        familyInfo: {
          hasSpouse: financialData.familyType === 'family' && financialData.familyMembers.some(m => m.relation === '配偶者'),
          spouseAge: financialData.familyMembers.find(m => m.relation === '配偶者')?.age || null,
          spouseIncome: 150, // デフォルト値として150万円を設定
          children: financialData.familyMembers
            .filter(member => member.relation === '子' || member.relation === '子供')
            .map(child => ({ age: child.age }))
        },
        assetInfo: {
          savings: Math.floor(financialData.savings / 10000), // 円を万円に変換
          investments: financialData.investments.map(inv => ({
            ...inv,
            amount: Math.floor(inv.amount / 10000)
          })),
          retirementMoney: Math.floor(financialData.retirementMoney / 10000),
          monthlyExpenses: Math.floor(financialData.monthlyExpenses / 10000),
        },
        loanInfo: {
          loans: financialData.loans.map(loan => ({
            type: loan.type,
            balance: Math.floor(loan.balance / 10000),
            remainingMonths: loan.remainingMonths
          }))
        },
        intentions: {
          carPurchase: financialData.carPurchase,
          homeRemodel: financialData.homeRemodel,
          domesticTravel: financialData.domesticTravel,
          internationalTravel: financialData.internationalTravel,
          petOwnership: financialData.petOwnership,
          careWorries: financialData.careWorries,
          otherExpenses: financialData.otherExpenses,
          investmentStance: financialData.investmentStance,
          wantsChildren: financialData.wantsChildren,
          childEducation: financialData.childEducation
        },
        selectedPrompt: selectedPrompt ? {
          id: selectedPrompt.id,
          title: selectedPrompt.title,
          content: selectedPrompt.content,
          description: selectedPrompt.description
        } : null
      };

      console.log('送信データ:', transformedData);

      const result = await apiRequest('/financial/generate-lifeplan', {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });

      console.log('レスポンス:', result);
      if (result.success) {
        setLifeplanData(result.lifeplan_data);
      } else {
        alert('ライフプランシミュレーションの生成に失敗しました: ' + (result.message || ''));
      }
    } catch (error) {
      console.error('ライフプランシミュレーション生成エラー:', error);
      alert('ライフプランシミュレーションの生成中にエラーが発生しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#f5faff] flex flex-col overflow-hidden">
        {/* Header */}
      <div className="flex items-center justify-center py-4 bg-white border-b border-gray-300 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold">
                <span className="text-blue-600">F</span>inancial 
                <span className="text-blue-600">S</span>upporter 
                <span className="text-blue-600">AI</span>
              </h1>
          </div>
        </div>

        {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Form Area */}
        <div className="w-1/2 bg-white border-r-2 border-gray-300 flex flex-col">
          {/* Tab Navigation - Fixed */}
          <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <button
              className={`px-4 py-3 flex-1 text-sm font-medium ${activeTab === 0 ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => changeTab(0)}
              >
                顧客情報
              </button>
              <button
              className={`px-4 py-3 flex-1 text-sm font-medium ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => changeTab(1)}
              >
                投資戦略
              </button>
              <button
              className={`px-4 py-3 flex-1 text-sm font-medium ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => changeTab(2)}
              >
                ライフシミュレーション
              </button>
            </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab Content */}
            {activeTab === 0 && (
              <div className="space-y-6">
                {/* Step 0: CRM Integration */}
                {currentStep === 0 && (
                  <div>
                  <div className="mb-6">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wide">Step 0</div>
                    <div className="text-xl font-bold text-gray-800">CRM情報と連携する</div>
                  </div>
                  <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <p className="text-gray-700 mb-4 text-base">CIFを入力し、ボタンを押すとStep1の入力を省略することができます。</p>
                      <div className="flex items-center space-x-3 mb-4">
                        <label htmlFor="cif" className="w-16 text-sm font-semibold text-gray-700">CIF</label>
                      <input
                        type="text"
                        id="cif"
                          value={cifId}
                          onChange={(e) => setCifId(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        />
                      </div>
                      <button 
                        onClick={handleLoadCRMData}
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {isLoading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                            読み込み中...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            情報を連携する
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="w-full mt-3 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        手動で入力する
                      </button>
                      <button
                        onClick={() => {
                          setIsPromptModalOpen(true);
                          if (promptOptions.length === 0) {
                            loadPromptOptions();
                          }
                        }}
                        className="w-full mt-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        🎯 プロンプトを選択する
                      </button>
                      {selectedPrompt && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-purple-800">{selectedPrompt.title}</h4>
                              <p className="text-sm text-purple-600 mt-1">{selectedPrompt.description}</p>
                            </div>
                            <button
                              onClick={() => setSelectedPrompt(null)}
                              className="text-purple-400 hover:text-purple-600 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div>
                    <div className="mb-6">
                      <div className="text-sm font-medium text-blue-500 uppercase tracking-wide">Step 1</div>
                      <div className="text-xl font-bold text-gray-800">本人情報の入力</div>
                    </div>
                    <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                      <div className="flex items-center space-x-4">
                        <label className="w-20 text-sm font-semibold text-gray-700">年齢</label>
                        <input
                          type="number"
                          value={financialData.age || ''}
                          onChange={(e) => updateFormData('age', parseInt(e.target.value) || 0)}
                          className="w-24 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                          placeholder="34"
                        />
                        <span className="text-sm text-gray-600 font-medium">歳</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="w-20 text-sm font-semibold text-gray-700">業界</label>
                        <select
                          value={financialData.industry}
                          onChange={(e) => updateFormData('industry', e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <option value="IT業界">💻 IT業界</option>
                          <option value="製造業">🏭 製造業</option>
                          <option value="金融業">💰 金融業</option>
                          <option value="小売業">🛍️ 小売業</option>
                          <option value="その他">📋 その他</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="w-20 text-sm font-semibold text-gray-700">会社名</label>
                        <input
                          type="text"
                          value={financialData.company}
                          onChange={(e) => updateFormData('company', e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                          placeholder="例：株式会社ZEALS"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="w-20 text-sm font-semibold text-gray-700">役職</label>
                        <select
                          value={financialData.position}
                          onChange={(e) => updateFormData('position', e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <option value="一般社員">👤 一般社員</option>
                          <option value="管理職・マネージャー">👔 管理職・マネージャー</option>
                          <option value="役員">🎯 役員</option>
                          <option value="経営者">👑 経営者</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="w-20 text-sm font-semibold text-gray-700">職種</label>
                        <select
                          value={financialData.jobType}
                          onChange={(e) => updateFormData('jobType', e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <option value="営業">📞 営業</option>
                          <option value="技術職">⚙️ 技術職</option>
                          <option value="事務">📝 事務</option>
                          <option value="その他">📋 その他</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="w-20 text-sm font-semibold text-gray-700">年収</label>
                        <input
                          type="number"
                          value={Math.round(financialData.annualIncome / 10000) || ''}
                          onChange={(e) => updateFormData('annualIncome', (parseInt(e.target.value) || 0) * 10000)}
                          className="w-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                          placeholder="700"
                        />
                        <span className="text-sm text-gray-600 font-medium">万円</span>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <label className="w-24 text-sm font-semibold text-gray-700">家族構成</label>
                        <div className="flex space-x-3 flex-1">
                          <button
                            type="button"
                            onClick={() => updateFormData('familyType', 'single')}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              financialData.familyType === 'single'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            独身
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFormData('familyType', 'family')}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              financialData.familyType === 'family'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            世帯持ち
                          </button>
                        </div>
                      </div>

                      {financialData.familyType === 'family' && (
                        <div className="border-2 border-blue-200 rounded-xl mb-6 shadow-lg">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-xl text-sm font-bold">
                            👨‍👩‍👧‍👦 家族情報
                          </div>
                          <div className="p-4">
                          {financialData.familyMembers.map((member, index) => (
                            <div key={index} className="grid grid-cols-1 gap-2 mb-3 p-3 bg-white rounded border">
                              <div className="grid grid-cols-3 gap-2">
                                <select
                                  value={member.relation}
                                  onChange={(e) => {
                                    const newMembers = [...financialData.familyMembers];
                                    newMembers[index].relation = e.target.value;
                                    updateFormData('familyMembers', newMembers);
                                  }}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="配偶者">配偶者</option>
                                  <option value="子供">子供</option>
                                  <option value="親">親</option>
                                  <option value="その他">その他</option>
                                </select>
                                <input
                                  type="number"
                                  value={member.age || ''}
                                  onChange={(e) => {
                                    const newMembers = [...financialData.familyMembers];
                                    newMembers[index].age = parseInt(e.target.value) || 0;
                                    updateFormData('familyMembers', newMembers);
                                  }}
                                  className="px-2 py-1 border rounded text-sm"
                                  
                                />
                                <select
                                  value={member.occupation}
                                  onChange={(e) => {
                                    const newMembers = [...financialData.familyMembers];
                                    newMembers[index].occupation = e.target.value;
                                    updateFormData('familyMembers', newMembers);
                                  }}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="会社員">会社員</option>
                                  <option value="自営業">自営業</option>
                                  <option value="学生">学生</option>
                                  <option value="無職">無職</option>
                                  <option value="その他">その他</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newMembers = financialData.familyMembers.filter((_, i) => i !== index);
                                  updateFormData('familyMembers', newMembers);
                                }}
                                className="self-end px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                削除
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newMembers = [...financialData.familyMembers, { relation: '配偶者', age: 30, occupation: '会社員' }];
                              updateFormData('familyMembers', newMembers);
                            }}
                            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                          >
                            +
                          </button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-8">
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          ← 前へ戻る
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          次へ進む →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: 財務状況の入力 */}
                {currentStep === 2 && (
                  <div>
                    <div className="mb-6">
                      <div className="text-sm font-medium text-blue-500 uppercase tracking-wide">Step 2</div>
                      <div className="text-xl font-bold text-gray-800">財務状況の入力</div>
                    </div>
                    <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                      <div className="flex items-center space-x-2">
                        <label className="w-24 text-sm font-medium text-gray-700">貯金額</label>
                        <input
                          type="number"
                          value={Math.round(financialData.savings / 10000) || ''}
                          onChange={(e) => updateFormData('savings', (parseInt(e.target.value) || 0) * 10000)}
                          className="w-32 px-3 py-2 border rounded-lg"
                       
                        />
                        <span className="text-sm text-gray-600">万円</span>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <label className="w-24 text-sm font-semibold text-gray-700">運用資産</label>
                        <div className="flex space-x-3 flex-1">
                          <button
                            type="button"
                            onClick={() => updateFormData('hasInvestments', true)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              financialData.hasInvestments
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            あり
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFormData('hasInvestments', false)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              !financialData.hasInvestments
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            なし
                          </button>
                        </div>
                      </div>

                      {financialData.hasInvestments && (
                        <div className="border-2 border-blue-200 rounded-xl mb-6 shadow-lg">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-xl text-sm font-bold">
                            💼 資産情報
                          </div>
                          <div className="p-4">
                          {financialData.investments.map((investment, index) => (
                            <div key={index} className="grid grid-cols-1 gap-2 mb-4 p-3 bg-white rounded border">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={investment.type}
                                  onChange={(e) => {
                                    const newInvestments = [...financialData.investments];
                                    newInvestments[index].type = e.target.value;
                                    updateFormData('investments', newInvestments);
                                  }}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="投資信託">投資信託</option>
                                  <option value="株式">株式</option>
                                  <option value="債券">債券</option>
                                  <option value="ETF">ETF</option>
                                  <option value="その他">その他</option>
                                </select>
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={Math.round(investment.amount / 10000) || ''}
                                    onChange={(e) => {
                                      const newInvestments = [...financialData.investments];
                                      newInvestments[index].amount = (parseInt(e.target.value) || 0) * 10000;
                                      updateFormData('investments', newInvestments);
                                    }}
                                    className="flex-1 px-2 py-1 border rounded text-sm"
                               
                                  />
                                  <span className="text-xs text-gray-600">万円</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={investment.name}
                                onChange={(e) => {
                                  const newInvestments = [...financialData.investments];
                                  newInvestments[index].name = e.target.value;
                                  updateFormData('investments', newInvestments);
                                }}
                                className="px-2 py-1 border rounded text-sm"
                                
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={investment.risk}
                                  onChange={(e) => {
                                    const newInvestments = [...financialData.investments];
                                    newInvestments[index].risk = e.target.value;
                                    updateFormData('investments', newInvestments);
                                  }}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="">リスクを選択</option>
                                  <option value="低リスク">低リスク</option>
                                  <option value="中リスク">中リスク</option>
                                  <option value="高リスク">高リスク</option>
                                </select>
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newInvestments = [...financialData.investments];
                                      newInvestments[index].hasMaturity = true;
                                      updateFormData('investments', newInvestments);
                                    }}
                                    className={`px-2 py-1 rounded text-xs ${
                                      investment.hasMaturity
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    満期あり
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newInvestments = [...financialData.investments];
                                      newInvestments[index].hasMaturity = false;
                                      updateFormData('investments', newInvestments);
                                    }}
                                    className={`px-2 py-1 rounded text-xs ${
                                      !investment.hasMaturity
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    満期なし
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newInvestments = financialData.investments.filter((_, i) => i !== index);
                                  updateFormData('investments', newInvestments);
                                }}
                                className="self-end px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                削除
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newInvestments = [...financialData.investments, { type: '投資信託', amount: 0, name: '', risk: '', hasMaturity: true }];
                              updateFormData('investments', newInvestments);
                            }}
                            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                          >
                            +
                          </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <label className="w-32 text-sm font-medium text-gray-700">退職金（予定）</label>
                        <input
                          type="number"
                          value={Math.round(financialData.retirementMoney / 10000) || ''}
                          onChange={(e) => updateFormData('retirementMoney', (parseInt(e.target.value) || 0) * 10000)}
                          className="w-32 px-3 py-2 border rounded-lg"
                       
                        />
                        <span className="text-sm text-gray-600">万円</span>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <label className="w-24 text-sm font-semibold text-gray-700">自家用車</label>
                        <div className="flex space-x-3 flex-1">
                          <button
                            type="button"
                            onClick={() => updateFormData('hasCar', true)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              financialData.hasCar
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            🚗 あり
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFormData('hasCar', false)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              !financialData.hasCar
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            なし
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <label className="w-24 text-sm font-semibold text-gray-700">マイホーム</label>
                        <div className="flex space-x-3 flex-1">
                          <button
                            type="button"
                            onClick={() => updateFormData('hasHome', true)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              financialData.hasHome
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            🏠 あり
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFormData('hasHome', false)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              !financialData.hasHome
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            なし
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="w-24 text-sm font-medium text-gray-700">生活費（月）</label>
                        <input
                          type="number"
                          value={Math.round(financialData.monthlyExpenses / 10000) || ''}
                          onChange={(e) => updateFormData('monthlyExpenses', (parseInt(e.target.value) || 0) * 10000)}
                          className="w-32 px-3 py-2 border rounded-lg"
                        
                        />
                        <span className="text-sm text-gray-600">万円</span>
                      </div>

                      <div className="border-2 border-blue-200 rounded-xl mb-6 shadow-lg">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-t-xl text-sm font-bold">
                          💳 ローン情報
                        </div>
                        <div className="p-4">
                        {financialData.loans.map((loan, index) => (
                          <div key={index} className="grid grid-cols-1 gap-2 mb-4 p-3 bg-white rounded border">
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={loan.type}
                                onChange={(e) => {
                                  const newLoans = [...financialData.loans];
                                  newLoans[index].type = e.target.value;
                                  updateFormData('loans', newLoans);
                                }}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                <option value="住宅ローン">住宅ローン</option>
                                <option value="自動車ローン">自動車ローン</option>
                                <option value="教育ローン">教育ローン</option>
                                <option value="フリーローン">フリーローン</option>
                                <option value="その他">その他</option>
                              </select>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  value={Math.round(loan.balance / 10000) || ''}
                                  onChange={(e) => {
                                    const newLoans = [...financialData.loans];
                                    newLoans[index].balance = (parseInt(e.target.value) || 0) * 10000;
                                    updateFormData('loans', newLoans);
                                  }}
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                
                                />
                                <span className="text-xs text-gray-600">万円</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  value={loan.remainingMonths || ''}
                                  onChange={(e) => {
                                    const newLoans = [...financialData.loans];
                                    newLoans[index].remainingMonths = parseInt(e.target.value) || 0;
                                    updateFormData('loans', newLoans);
                                  }}
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                               
                                />
                                <span className="text-xs text-gray-600">ヶ月</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newLoans = financialData.loans.filter((_, i) => i !== index);
                                updateFormData('loans', newLoans);
                              }}
                              className="self-end px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newLoans = [...financialData.loans, { type: '住宅ローン', balance: 0, remainingMonths: 0 }];
                            updateFormData('loans', newLoans);
                          }}
                          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
                        >
                          +
                        </button>
                        </div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          ← 前へ戻る
                        </button>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          次へ進む →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: 各種ご意向 */}
                {currentStep === 3 && (
                  <div>
                    <div className="mb-6">
                      <div className="text-sm font-medium text-blue-500 uppercase tracking-wide">Step 3</div>
                      <div className="text-xl font-bold text-gray-800">各種ご意向</div>
                    </div>
                    <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                      <p className="text-gray-600 text-sm">下記ライフイベントのご予定はありますか？</p>
                      
                      <div className="space-y-3">
                        {[
                          { key: 'carPurchase', label: '🚗 車の購入' },
                          { key: 'homeRemodel', label: '🏠 家のリフォーム' },
                          { key: 'domesticTravel', label: '🗾 国内旅行' },
                          { key: 'internationalTravel', label: '✈️ 海外旅行' },
                          { key: 'petOwnership', label: '🐕 ペットの飼育' },
                          { key: 'careWorries', label: '👴 介護の不安' },
                          { key: 'otherExpenses', label: '💰 その他支出' }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center space-x-4 mb-4">
                            <label className="w-36 text-sm font-semibold text-gray-700">{label}</label>
                            <div className="flex space-x-3 flex-1">
                              <button
                                type="button"
                                onClick={() => updateFormData(key as keyof FinancialData, true)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                                  financialData[key as keyof FinancialData]
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                あり
                              </button>
                              <button
                                type="button"
                                onClick={() => updateFormData(key as keyof FinancialData, false)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                                  !financialData[key as keyof FinancialData]
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                なし
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="w-24 text-sm font-medium text-gray-700">投資スタンス</label>
                        <select
                          value={financialData.investmentStance}
                          onChange={(e) => updateFormData('investmentStance', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg"
                        >
                          <option value="ローリスク ローリターン">ローリスク ローリターン</option>
                          <option value="ミドルリスク ミドルリターン">ミドルリスク ミドルリターン</option>
                          <option value="ハイリスク ハイリターン">ハイリスク ハイリターン</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <label className="w-36 text-sm font-semibold text-gray-700">👶 お子様のご予定</label>
                        <div className="flex space-x-3 flex-1">
                          <button
                            type="button"
                            onClick={() => updateFormData('wantsChildren', true)}
                            className={`px-5 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              financialData.wantsChildren
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            あり / ほしい
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFormData('wantsChildren', false)}
                            className={`px-5 py-3 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                              !financialData.wantsChildren
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            なし
                          </button>
                        </div>
                      </div>

                      {financialData.wantsChildren && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
                          <h3 className="text-lg font-bold text-blue-800 mb-5 flex items-center">
                            🎓 第1子 進学先
                          </h3>
                          <div className="space-y-4">
                            {[
                              { key: 'kindergarten', label: '👶 幼稚園' },
                              { key: 'elementary', label: '📚 小学校' },
                              { key: 'middle', label: '📖 中学校' },
                              { key: 'high', label: '🎒 高校' },
                              { key: 'university', label: '🎓 大学' }
                            ].map(({ key, label }) => (
                              <div key={key} className="flex items-center space-x-4 mb-4">
                                <label className="w-24 text-sm font-semibold text-gray-700">{label}</label>
                                <div className="flex space-x-3 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newEducation = { ...financialData.childEducation };
                                      newEducation[key as keyof ChildEducation] = 'national';
                                      updateFormData('childEducation', newEducation);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                                      financialData.childEducation[key as keyof ChildEducation] === 'national'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    🏛️ 国公立
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newEducation = { ...financialData.childEducation };
                                      newEducation[key as keyof ChildEducation] = 'private';
                                      updateFormData('childEducation', newEducation);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200 ${
                                      financialData.childEducation[key as keyof ChildEducation] === 'private'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 shadow-md transform scale-105'
                                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    🏫 私立
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-8">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          ← 前へ戻る
                        </button>
                        <button
                          onClick={handleSubmitFinancialData}
                          disabled={isLoading}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          {isLoading ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                              分析中...
                            </>
                          ) : (
                            <>
                              <span>🎯 完了</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <StrategyDisplay strategy={strategy || undefined} />
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <LifeplanDisplay 
                  lifeplan={lifeplanData || undefined} 
                  financialData={financialData}
                  onGenerateLifeplan={generateLifeplan}
                />
              </div>
            )}
          </div>

          </div>

          {/* Right Side: Chat Container */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Chat Header - Fixed */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">AI Chat Assistant</h2>
          </div>

          {/* Chat Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center text-gray-500 mt-10">
              <div className="text-4xl mb-4">💬</div>
              <p>AI アシスタントとチャットできます</p>
              <p className="text-sm mt-2">財務情報について質問してください</p>
            </div>
              </div>

          {/* Chat Input - Fixed */}
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="メッセージを入力..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    送信
                  </button>
                </div>
          </div>
        </div>
      </div>

      {/* プロンプト選択モーダル */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* モーダルヘッダー */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">🎯 アドバイザータイプを選択</h2>
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="text-white hover:text-purple-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <p className="text-gray-600 mb-6">
                あなたの投資スタイルに合ったアドバイザータイプを選択してください。選択したタイプに応じてAIがパーソナライズされたアドバイスを提供します。
              </p>
              
              {isLoadingPrompts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-purple-500 mb-4" />
                    <p className="text-gray-600">プロンプトを読み込み中...</p>
                  </div>
                </div>
              ) : promptOptions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">プロンプトが見つかりませんでした。</p>
                  <button
                    onClick={loadPromptOptions}
                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    再読み込み
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promptOptions.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedPrompt?.id === prompt.id
                        ? 'border-purple-500 bg-purple-50 transform scale-105'
                        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {prompt.description}
                      </p>
                      <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
                        <strong>プロンプト:</strong> {prompt.content}
                      </div>
                    </div>
                    {selectedPrompt?.id === prompt.id && (
                      <div className="flex items-center justify-center mt-3">
                        <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          ✓ 選択中
                        </div>
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* モーダルフッター */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedPrompt ? (
                  <span className="text-purple-600 font-medium">
                    選択中: {selectedPrompt.title}
                  </span>
                ) : (
                  <span>アドバイザータイプを選択してください</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={async () => {
                    if (selectedPrompt) {
                      try {
                        // バックエンドのセッションにプロンプト選択を保存
                        const response = await apiRequest('/api/select-prompt', {
                          method: 'POST',
                          body: JSON.stringify({
                            prompt_id: parseInt(selectedPrompt.id)
                          }),
                        });
                        
                        if (response.success) {
                          console.log('プロンプト選択がバックエンドに保存されました:', response);
                        }
                      } catch (error) {
                        console.error('プロンプト選択保存エラー:', error);
                      }
                      
                      setIsPromptModalOpen(false);
                      alert(`${selectedPrompt.title} を選択しました！`);
                    }
                  }}
                  disabled={!selectedPrompt}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 