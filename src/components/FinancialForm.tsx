"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FinancialData, StrategyData } from '@/types/finance';
import { getCRMData, submitFinancialData } from '@/utils/api';

interface FinancialFormProps {
  onStrategyGenerated?: (strategy: StrategyData) => void;
}

export default function FinancialForm({ onStrategyGenerated }: FinancialFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cifId, setCifId] = useState('1234567890123');
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData>({
    age: 35,
    industry: '',
    company: '',
    position: '',
    annualIncome: 5000000,
    spouse: false,
    children: 0,
    savings: 1000000,
    monthlyExpenses: 300000,
    retirementAge: 65,
    homeOwnership: false,
    carOwnership: false,
    riskTolerance: 'moderate',
    investmentGoals: []
  });

  // CRMデータの取得
  const handleLoadCRMData = async () => {
    setIsLoading(true);
    try {
      const response = await getCRMData(cifId);
      if (response.success && response.data) {
        // CRMデータをフォームに反映
        const crmData = response.data;
        setFinancialData(prev => ({
          ...prev,
          age: crmData.personalInfo.age,
          industry: crmData.personalInfo.industry,
          company: crmData.personalInfo.company,
          position: crmData.personalInfo.position,
          annualIncome: crmData.personalInfo.annualIncome,
          spouse: crmData.familyInfo.spouse,
          spouseAge: crmData.familyInfo.spouseAge,
          spouseIncome: crmData.familyInfo.spouseIncome,
          children: crmData.familyInfo.children,
          childrenAges: crmData.familyInfo.childrenAges,
          savings: crmData.financialInfo.savings,
          monthlyExpenses: crmData.financialInfo.monthlyExpenses,
        }));
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('CRMデータの取得に失敗しました:', error);
      alert('CRMデータの取得に失敗しました。手動で入力してください。');
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  // フォームデータの更新
  const updateFormData = (field: keyof FinancialData, value: string | number | boolean | string[]) => {
    setFinancialData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 財務データの送信
  const handleSubmitFinancialData = async () => {
    setIsLoading(true);
    try {
      const response = await submitFinancialData(financialData);
      if (response.success && response.strategy_data) {
        onStrategyGenerated?.(response.strategy_data);
        alert('財務分析が完了しました！戦略タブで結果をご確認ください。');
      }
    } catch (error) {
      console.error('財務データの送信に失敗しました:', error);
      alert('財務データの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 0: CRM Integration */}
      {currentStep === 0 && (
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500">Step 0</div>
            <div className="text-lg font-semibold">CRM情報と連携する</div>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">CIFを入力し、ボタンを押すとStep1の入力を省略することができます。</p>
            <div className="flex items-center space-x-2">
              <label htmlFor="cif" className="w-24">CIF</label>
              <input
                type="text"
                id="cif"
                value={cifId}
                onChange={(e) => setCifId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <button 
              onClick={handleLoadCRMData}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
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
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              手動で入力する
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500">Step 1</div>
            <div className="text-lg font-semibold">基本情報</div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                <input
                  type="number"
                  value={financialData.age}
                  onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年収（万円）</label>
                <input
                  type="number"
                  value={financialData.annualIncome / 10000}
                  onChange={(e) => updateFormData('annualIncome', parseInt(e.target.value) * 10000)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">業界</label>
              <input
                type="text"
                value={financialData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">勤務先</label>
              <input
                type="text"
                value={financialData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
              <input
                type="text"
                value={financialData.position}
                onChange={(e) => updateFormData('position', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Family Information */}
      {currentStep === 2 && (
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500">Step 2</div>
            <div className="text-lg font-semibold">家族構成</div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={financialData.spouse}
                  onChange={(e) => updateFormData('spouse', e.target.checked)}
                  className="mr-2"
                />
                配偶者がいる
              </label>
            </div>
            {financialData.spouse && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">配偶者の年齢</label>
                  <input
                    type="number"
                    value={financialData.spouseAge || ''}
                    onChange={(e) => updateFormData('spouseAge', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">配偶者の年収（万円）</label>
                  <input
                    type="number"
                    value={financialData.spouseIncome ? financialData.spouseIncome / 10000 : ''}
                    onChange={(e) => updateFormData('spouseIncome', parseInt(e.target.value) * 10000)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">子供の人数</label>
              <input
                type="number"
                value={financialData.children}
                onChange={(e) => updateFormData('children', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Financial Information */}
      {currentStep === 3 && (
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500">Step 3</div>
            <div className="text-lg font-semibold">資産・負債情報</div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">貯蓄額（万円）</label>
              <input
                type="number"
                value={financialData.savings / 10000}
                onChange={(e) => updateFormData('savings', parseInt(e.target.value) * 10000)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月間支出（万円）</label>
              <input
                type="number"
                value={financialData.monthlyExpenses / 10000}
                onChange={(e) => updateFormData('monthlyExpenses', parseInt(e.target.value) * 10000)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">退職予定年齢</label>
              <input
                type="number"
                value={financialData.retirementAge}
                onChange={(e) => updateFormData('retirementAge', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">リスク許容度</label>
              <select
                value={financialData.riskTolerance}
                onChange={(e) => updateFormData('riskTolerance', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="conservative">保守的</option>
                <option value="moderate">中程度</option>
                <option value="aggressive">積極的</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                onClick={handleSubmitFinancialData}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    分析中...
                  </>
                ) : (
                  '財務分析を実行'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 