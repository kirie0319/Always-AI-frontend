"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faDownload, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { StrategyData, CurrentAnalysis, Strategy } from '@/types/finance';
import { getStrategyData } from '@/utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StrategyDisplayProps {
  strategy?: StrategyData;
}

// 円グラフの色設定
const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green 
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

// ポートフォリオデータを円グラフ用データに変換
function convertPortfolioToChartData(portfolio: any[]) {
  if (!portfolio || portfolio.length === 0) return [];
  
  return portfolio.map((item, index) => {
    // 金額から数値を抽出（万円、円などの単位を除去）
    const amountStr = item.amount || '0';
    const numericAmount = parseFloat(amountStr.replace(/[^\d.]/g, '')) || 0;
    
    return {
      name: item.category,
      value: numericAmount,
      formattedValue: item.amount,
      color: CHART_COLORS[index % CHART_COLORS.length]
    };
  });
}

// カスタムトゥールチップ
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{data.payload.name}</p>
        <p className="text-blue-600">{data.payload.formattedValue}</p>
        <p className="text-gray-600 text-sm">
          {((data.value / payload[0].payload.totalValue) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

export default function StrategyDisplay({ strategy }: StrategyDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await getStrategyData();
    } finally {
      setIsLoading(false);
    }
  };

  if (!strategy) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">戦略分析結果はまだありません。</div>
        <p className="text-gray-500 text-sm">まず「顧客情報」タブで財務データを入力・送信してください。</p>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRefresh} className={isLoading ? 'animate-spin mr-2' : 'mr-2'} />
          {isLoading ? '読み込み中...' : 'データを更新'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mr-4">
          <FontAwesomeIcon icon={faChartLine} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-800">ライフプランニング戦略提案</h2>
          <p className="text-gray-600">お客様の状況に合わせた最適な資産運用プランをご提案します。</p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab(0)}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              activeTab === 0 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            現運用
          </button>
          {strategy.strategies.map((_, index) => (
            <button 
              key={index}
              onClick={() => setActiveTab(index + 1)}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                activeTab === index + 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              戦略パターン {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[500px]">
        {activeTab === 0 ? (
          <CurrentAnalysisComponent analysis={strategy.current_analysis} />
        ) : (
          <StrategyComponent strategy={strategy.strategies[activeTab - 1]} />
        )}
      </div>

      {/* アクションボタン */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} className={isLoading ? 'animate-spin mr-2' : 'mr-2'} />
            {isLoading ? '更新中...' : '戦略を更新'}
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            PDFダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}

// 現運用分析コンポーネント
function CurrentAnalysisComponent({ analysis }: { analysis: CurrentAnalysis }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">現運用の状況</h3>
        <p className="text-gray-600 mb-4">{analysis.description}</p>
      </div>

      {/* 課題セクション */}
      {analysis.issues && analysis.issues.length > 0 && (
        <div className="bg-red-50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-red-800 mb-4">現運用の課題</h4>
          <div className="space-y-4">
            {analysis.issues.map((issue, index) => (
              <div key={index} className="border-l-4 border-red-400 pl-4">
                <h5 className="font-semibold text-red-700 mb-2">{issue.title}</h5>
                <ul className="space-y-1">
                  {issue.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-red-600 text-sm flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ポートフォリオテーブル */}
      {analysis.portfolio && analysis.portfolio.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4">現在のポートフォリオ</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full bg-white">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">商品カテゴリー</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-blue-800">保有金額</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">特徴/備考</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analysis.portfolio.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right font-medium">{item.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
              {analysis.total_amount && (
                <tfoot className="bg-blue-50">
                  <tr>
                    <td className="px-6 py-3 text-sm font-bold text-blue-800">合計</td>
                    <td className="px-6 py-3 text-sm font-bold text-blue-800 text-right">{analysis.total_amount}</td>
                    <td className="px-6 py-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ポートフォリオ円グラフ */}
      {analysis.portfolio && analysis.portfolio.length > 0 && (
        <PortfolioChartComponent portfolio={analysis.portfolio} />
      )}
    </div>
  );
}

// ポートフォリオ円グラフコンポーネント
function PortfolioChartComponent({ portfolio }: { portfolio: any[] }) {
  const chartData = convertPortfolioToChartData(portfolio);
  
  if (!chartData || chartData.length === 0) {
    return null;
  }

  // 合計値を計算
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = chartData.map(item => ({
    ...item,
    totalValue: totalValue
  }));

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
      <h4 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        ポートフォリオ構成比
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 円グラフ */}
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 凡例と詳細 */}
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            合計: <span className="font-bold text-indigo-800">{totalValue.toLocaleString()}万円</span>
          </div>
          {dataWithTotal.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-800">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{item.formattedValue}</div>
                <div className="text-sm text-gray-500">
                  {((item.value / totalValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 戦略コンポーネント
function StrategyComponent({ strategy }: { strategy: Strategy }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{strategy.title}</h3>
        <p className="text-gray-600">{strategy.description}</p>
      </div>

      {/* 提案理由 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-blue-800 mb-3">提案理由</h4>
        <p className="text-blue-700">{strategy.reason}</p>
      </div>

      {/* 具体的な戦略 */}
      {strategy.details && strategy.details.length > 0 && (
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-green-800 mb-3">具体的な戦略</h4>
          <ul className="space-y-2">
            {strategy.details.map((detail, index) => (
              <li key={index} className="text-green-700 flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 期待成果 */}
      {strategy.expected_results && strategy.expected_results.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-purple-800 mb-3">期待成果</h4>
          <ul className="space-y-2">
            {strategy.expected_results.map((result, index) => (
              <li key={index} className="text-purple-700 flex items-start">
                <span className="text-purple-500 mr-2 mt-1">★</span>
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 商品ポートフォリオ */}
      {strategy.product_portfolio && strategy.product_portfolio.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4">商品ポートフォリオ</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full bg-white">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-800">目的</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-800">商品名</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-800">投資金額/積立額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {strategy.product_portfolio.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.purpose}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.product}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 