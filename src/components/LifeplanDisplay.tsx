"use client";

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faDownload, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { LifeplanData } from '@/types/finance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Chart.jsの必要な要素を登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface LifeplanDisplayProps {
  lifeplan?: LifeplanData;
  financialData?: any;
  onGenerateLifeplan?: () => Promise<void>;
}

export default function LifeplanDisplay({ lifeplan, financialData, onGenerateLifeplan }: LifeplanDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef<ChartJS>(null);

  const handleGenerateLifeplan = async () => {
    if (!financialData?.age) {
      alert('まず顧客情報を入力してください');
      return;
    }
    
    if (onGenerateLifeplan) {
      setIsLoading(true);
      try {
        await onGenerateLifeplan();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Chart.jsの設定
  const chartData = lifeplan ? {
    labels: lifeplan.chart_summary.age_labels,
    datasets: [
      {
        label: '預金残高 (万円)',
        data: lifeplan.chart_summary.deposit_balance,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y',
        order: 2
      },
      {
        label: '資産残高 (万円)',
        data: lifeplan.chart_summary.asset_balance,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y',
        order: 3
      },
      {
        label: '収支バランス (万円)',
        data: lifeplan.chart_summary.income_expense_balance,
        type: 'line' as const,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.1,
        fill: false,
        yAxisID: 'y1',
        order: 1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: '年齢'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '残高 (万円)'
        },
        suggestedMin: -6000,
        suggestedMax: 6000
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '収支バランス (万円)'
        },
        suggestedMin: -300,
        suggestedMax: 300,
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    plugins: {
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      legend: {
        position: 'bottom' as const,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // ここでライフプランデータを再取得
      // await getLifeplanData();
    } finally {
      setIsLoading(false);
    }
  };

  // 金額を万円表示にフォーマット
  const formatAmount = (amount: number) => {
    if (amount === 0) return '';
    return (amount / 10000).toLocaleString();
  };

  // マイナス値のスタイル
  const getAmountStyle = (amount: number) => {
    return amount < 0 ? { color: '#dc2626' } : {};
  };

  if (!lifeplan) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">ライフプランシミュレーション結果はまだありません。</div>
        <p className="text-gray-500 text-sm">顧客情報を入力して、ライフプランシミュレーションを開始してください。</p>
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleGenerateLifeplan}
            disabled={isLoading || !financialData?.age}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FontAwesomeIcon icon={faChartLine} className={isLoading ? 'animate-spin mr-2' : 'mr-2'} />
            {isLoading ? 'カスタマイズ中...' : 'カスタマイズされたライフプラン生成'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} className={isLoading ? 'animate-spin mr-2' : 'mr-2'} />
            データを更新
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mr-4">
          <FontAwesomeIcon icon={faChartLine} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-800">ライフプランシミュレーション</h2>
          <p className="text-gray-600">
            {lifeplan.advisor_info ? 
              `「${lifeplan.advisor_info.prompt_title}」による65年間の詳細な財務予測とAI分析` :
              '65年間の詳細な財務予測をご確認いただけます。'
            }
          </p>
        </div>
        {lifeplan.advisor_info && (
          <div className="text-right text-sm text-gray-500">
            <div>アドバイザー: {lifeplan.advisor_info.prompt_title}</div>
            <div>投資リターン: {(lifeplan.advisor_info.parameters_used.investment_return_rate * 100).toFixed(1)}%</div>
          </div>
        )}
      </div>

      {/* LLMライフプランアプローチセクション */}
      {lifeplan.llm_lifeplan && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-center mb-6 text-purple-800">
            🤖 AIアドバイザーによるライフプラン設計
          </h3>
          
          {/* アプローチ説明 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
              📋 アドバイザーアプローチ
            </h4>
            <p className="text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg">
              {lifeplan.llm_lifeplan.simulation_approach}
            </p>
          </div>

          {/* 前提条件 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
              🔧 計算の前提条件
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lifeplan.llm_lifeplan.key_assumptions.map((assumption, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400">
                  <span className="text-gray-700 text-sm">{assumption}</span>
                </div>
              ))}
            </div>
          </div>

          {/* グラフのハイライト */}
          {lifeplan.chart_summary.llm_highlights && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                📈 グラフのハイライト
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-medium text-blue-800 mb-2">ピーク資産年齢</div>
                  <div className="text-blue-700">{lifeplan.chart_summary.llm_highlights.peak_wealth_age}歳</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">退職準備状況</div>
                  <div className="text-green-700">{lifeplan.chart_summary.llm_highlights.retirement_readiness}</div>
                </div>
              </div>
              
              {lifeplan.chart_summary.llm_highlights.cash_flow_turning_points.length > 0 && (
                <div className="mt-4">
                  <div className="font-medium text-gray-800 mb-2">キャッシュフロー転換点</div>
                  <div className="space-y-2">
                    {lifeplan.chart_summary.llm_highlights.cash_flow_turning_points.map((point, index) => (
                      <div key={index} className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400 text-sm">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* パーソナライズされた洞察 */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
              💡 パーソナライズされた洞察
            </h4>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="font-medium text-indigo-800 mb-2">資産形成戦略</div>
                <div className="text-indigo-700 text-sm">
                  {lifeplan.llm_lifeplan?.personalized_insights?.wealth_building_strategy || 
                   "アドバイザーによる資産形成戦略を分析中です..."}
                </div>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="font-medium text-teal-800 mb-2">ライフステージ別プランニング</div>
                <div className="text-teal-700 text-sm">
                  {lifeplan.llm_lifeplan?.personalized_insights?.life_stage_planning || 
                   "ライフステージに応じた計画を分析中です..."}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="font-medium text-orange-800 mb-2">リスク対策・コンティンジェンシープラン</div>
                <div className="text-orange-700 text-sm">
                  {lifeplan.llm_lifeplan?.personalized_insights?.contingency_planning || 
                   "リスク対策とコンティンジェンシープランを分析中です..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LLM分析結果セクション */}
      {lifeplan.llm_analysis && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-center mb-6 text-blue-800">📊 AI詳細分析レポート</h3>
          
          {/* 全体評価 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
              📊 全体的な財務状況の評価
            </h4>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">
              {lifeplan.llm_analysis.overall_assessment}
            </p>
          </div>

          {/* リスク分析 */}
          {lifeplan.llm_analysis.risk_analysis.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                ⚠️ リスク分析
              </h4>
              <div className="space-y-3">
                {lifeplan.llm_analysis.risk_analysis.map((risk, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-red-800">{risk.period}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        risk.impact === '高' ? 'bg-red-600 text-white' :
                        risk.impact === '中' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {risk.impact}
                      </span>
                    </div>
                    <div className="text-red-700 mb-2">{risk.risk}</div>
                    <div className="text-red-600 text-sm">{risk.solution}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 機会分析 */}
          {lifeplan.llm_analysis.opportunities.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                🌟 機会分析
              </h4>
              <div className="space-y-3">
                {lifeplan.llm_analysis.opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <div className="font-medium text-green-800 mb-2">{opportunity.period}</div>
                    <div className="text-green-700 mb-2">{opportunity.opportunity}</div>
                    <div className="text-green-600 text-sm mb-1">効果: {opportunity.benefit}</div>
                    <div className="text-green-600 text-sm font-medium">行動: {opportunity.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* カスタマイズされたアドバイス */}
          {lifeplan.llm_analysis.customized_advice.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                💡 カスタマイズされたアドバイス
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lifeplan.llm_analysis.customized_advice.map((advice, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-blue-800">{advice.category}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        advice.priority === '高' ? 'bg-red-500 text-white' :
                        advice.priority === '中' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {advice.priority}
                      </span>
                    </div>
                    <div className="text-blue-700 text-sm">{advice.advice}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 統合グラフセクション */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">残高・収支バランス統合グラフ</h3>
          {lifeplan.chart_summary.data_source && (
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                lifeplan.chart_summary.data_source === 'llm_generated' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {lifeplan.chart_summary.data_source === 'llm_generated' 
                  ? '🤖 AI生成データ' 
                  : '📊 計算ベース'}
              </span>
            </div>
          )}
        </div>

        {lifeplan.chart_summary.insights && (
          <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">預金傾向: </span>
                {lifeplan.chart_summary.insights.deposit_trend}
              </div>
              <div>
                <span className="font-medium">収支パターン: </span>
                {lifeplan.chart_summary.insights.cash_flow_pattern}
              </div>
              <div>
                <span className="font-medium">注意時期: </span>
                {lifeplan.chart_summary.insights.critical_periods}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: '400px' }}>
          {chartData && (
            <Chart
              ref={chartRef}
              type="bar"
              data={chartData}
              options={chartOptions}
            />
          )}
        </div>
      </div>

      {/* 詳細データ表セクション */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-center mb-4">詳細データ表</h3>
        <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-200 rounded-lg">
          <table className="min-w-full border-collapse bg-white">
            <thead className="sticky top-0 bg-gray-100 z-10">
              {/* 年数行 */}
              <tr className="border-b">
                <th className="p-2 text-center font-semibold min-w-32"></th>
                <th className="p-2 text-center font-semibold min-w-20">No</th>
                {lifeplan.years_data.map((yearData, index) => (
                  <th key={index} className="p-2 text-center font-semibold min-w-20">
                    {index + 1}
                  </th>
                ))}
              </tr>
              {/* 年齢行 */}
              <tr className="border-b bg-blue-50">
                <th className="p-2 text-center font-semibold">年齢</th>
                <th className="p-2 text-center font-semibold">本人</th>
                {lifeplan.years_data.map((yearData, index) => (
                  <th key={index} className="p-2 text-center font-semibold">
                    {yearData.primary_age}
                  </th>
                ))}
              </tr>
              {lifeplan.years_data[0].spouse_age && (
                <tr className="border-b bg-blue-50">
                  <th className="p-2 text-center font-semibold"></th>
                  <th className="p-2 text-center font-semibold">配偶者</th>
                  {lifeplan.years_data.map((yearData, index) => (
                    <th key={index} className="p-2 text-center font-semibold">
                      {yearData.spouse_age}
                    </th>
                  ))}
                </tr>
              )}
              {lifeplan.years_data[0].child1_age && (
                <tr className="border-b bg-blue-50">
                  <th className="p-2 text-center font-semibold"></th>
                  <th className="p-2 text-center font-semibold">子供1</th>
                  {lifeplan.years_data.map((yearData, index) => (
                    <th key={index} className="p-2 text-center font-semibold">
                      {yearData.child1_age}
                    </th>
                  ))}
                </tr>
              )}
              {lifeplan.years_data[0].child2_age && (
                <tr className="border-b bg-blue-50">
                  <th className="p-2 text-center font-semibold"></th>
                  <th className="p-2 text-center font-semibold">子供2</th>
                  {lifeplan.years_data.map((yearData, index) => (
                    <th key={index} className="p-2 text-center font-semibold">
                      {yearData.child2_age}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {/* 収入合計 */}
              <tr className="bg-blue-100 font-bold border-b">
                <td className="p-2">収入合計（PL）</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {formatAmount(yearData.total_income)}
                  </td>
                ))}
              </tr>
              
              {/* 本人の想定年収 */}
              <tr className="border-b">
                <td className="p-2 pl-4">　本人の想定年収</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {formatAmount(yearData.primary_income)}
                  </td>
                ))}
              </tr>

              {/* 本人の想定年金 */}
              <tr className="border-b">
                <td className="p-2 pl-4">　本人の想定年金</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {yearData.primary_pension ? formatAmount(yearData.primary_pension) : ''}
                  </td>
                ))}
              </tr>

              {/* 配偶者の想定年収 */}
              {lifeplan.years_data.some(y => y.spouse_income) && (
                <tr className="border-b">
                  <td className="p-2 pl-4">　配偶者の想定年収</td>
                  <td className="p-2"></td>
                  {lifeplan.years_data.map((yearData, index) => (
                    <td key={index} className="p-2 text-right">
                      {yearData.spouse_income ? formatAmount(yearData.spouse_income) : ''}
                    </td>
                  ))}
                </tr>
              )}

              {/* 住宅ローン控除 */}
              {lifeplan.years_data.some(y => y.home_loan_deduction) && (
                <tr className="border-b">
                  <td className="p-2 pl-4">　住宅ローン控除</td>
                  <td className="p-2"></td>
                  {lifeplan.years_data.map((yearData, index) => (
                    <td key={index} className="p-2 text-right">
                      {yearData.home_loan_deduction ? formatAmount(yearData.home_loan_deduction) : ''}
                    </td>
                  ))}
                </tr>
              )}

              {/* 支出合計 */}
              <tr className="bg-orange-100 font-bold border-b">
                <td className="p-2">支出合計（PL）</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {formatAmount(yearData.total_expense)}
                  </td>
                ))}
              </tr>

              {/* 生活費 */}
              <tr className="border-b">
                <td className="p-2 pl-4">　生活費</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {formatAmount(yearData.living_expenses)}
                  </td>
                ))}
              </tr>

              {/* 住宅関連費用 */}
              <tr className="border-b">
                <td className="p-2 pl-4">　住宅関連費用</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {formatAmount(yearData.housing_expenses)}
                  </td>
                ))}
              </tr>

              {/* ローン返済額 */}
              <tr className="border-b">
                <td className="p-2 pl-4">　ローン返済額</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {yearData.loan_repayment ? formatAmount(yearData.loan_repayment) : ''}
                  </td>
                ))}
              </tr>

              {/* 税金 */}
              <tr className="border-b">
                <td className="p-2 pl-4">　税金</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right">
                    {formatAmount(yearData.tax_expenses)}
                  </td>
                ))}
              </tr>

              {/* 子供の学費 */}
              {lifeplan.years_data.some(y => y.child_education) && (
                <tr className="border-b">
                  <td className="p-2 pl-4">　子供の学費</td>
                  <td className="p-2"></td>
                  {lifeplan.years_data.map((yearData, index) => (
                    <td key={index} className="p-2 text-right">
                      {yearData.child_education ? formatAmount(yearData.child_education) : ''}
                    </td>
                  ))}
                </tr>
              )}

              {/* 家計の単年収支 */}
              <tr className="font-bold border-b">
                <td className="p-2">家計の単年収支</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right" style={getAmountStyle(yearData.annual_balance)}>
                    {formatAmount(yearData.annual_balance)}
                  </td>
                ))}
              </tr>

              {/* 期末時点の現預金 */}
              <tr className="bg-blue-100 font-bold border-b">
                <td className="p-2">期末時点の現預金</td>
                <td className="p-2"></td>
                {lifeplan.years_data.map((yearData, index) => (
                  <td key={index} className="p-2 text-right" style={getAmountStyle(yearData.cash_balance)}>
                    {formatAmount(yearData.cash_balance)}
                  </td>
                ))}
              </tr>

              {/* LLM特別イベント */}
              {lifeplan.years_data.some(y => y.special_events && y.special_events.length > 0) && (
                <tr className="bg-purple-100 border-b">
                  <td className="p-2">🎯 特別イベント</td>
                  <td className="p-2"></td>
                  {lifeplan.years_data.map((yearData, index) => (
                    <td key={index} className="p-2 text-center text-xs">
                      {yearData.special_events && yearData.special_events.length > 0 && (
                        <div className="space-y-1">
                          {yearData.special_events.map((event, eventIndex) => (
                            <div key={eventIndex} className="bg-purple-200 px-1 py-1 rounded text-purple-800">
                              {event}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* LLMアドバイザーノート */}
              {lifeplan.years_data.some(y => y.llm_notes) && (
                <tr className="bg-yellow-100 border-b">
                  <td className="p-2">💡 アドバイザーノート</td>
                  <td className="p-2"></td>
                  {lifeplan.years_data.map((yearData, index) => (
                    <td key={index} className="p-2 text-xs">
                      {yearData.llm_notes && (
                        <div className="bg-yellow-200 p-1 rounded text-yellow-800 max-w-32 overflow-hidden">
                          {yearData.llm_notes}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* データソース表示 */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
            <span>データソース:</span>
            {lifeplan.chart_summary.data_source === 'llm_generated' ? (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                🤖 AIアドバイザーによる予測
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                📊 システム計算ベース
              </span>
            )}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <FontAwesomeIcon icon={faRefresh} className={isLoading ? 'animate-spin mr-2' : 'mr-2'} />
          {isLoading ? '更新中...' : 'データを更新'}
        </button>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          PDFダウンロード
        </button>
      </div>
    </div>
  );
} 