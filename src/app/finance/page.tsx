"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faEdit, 
  faListAlt, 
  faArrowLeft,
  faPlus 
} from '@fortawesome/free-solid-svg-icons';

export default function FinanceProject() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const changeTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <div className="min-h-screen bg-[#f5faff]">
      <div className="w-full h-screen px-4 py-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 bg-white rounded-lg shadow hover:bg-gray-50">
              <FontAwesomeIcon icon={faArrowLeft} className="text-blue-600" />
            </a>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faChartLine} className="text-2xl text-blue-600" />
              <h1 className="text-3xl font-bold">
                <span className="text-blue-600">F</span>inancial 
                <span className="text-blue-600">S</span>upporter 
                <span className="text-blue-600">AI</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full flex-1">
          {/* Left Side: Form Area */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300 h-full">
            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
              <button
                className={`px-4 py-2 ${activeTab === 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => changeTab(0)}
              >
                顧客情報
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 1 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => changeTab(1)}
              >
                ライフシミュレーション
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 2 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => changeTab(2)}
              >
                投資戦略
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 0 && (
              <div className="space-y-6">
                {/* Step 0: CRM Integration */}
                <div className={`${currentStep === 0 ? 'block' : 'hidden'}`}>
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
                        defaultValue="1234567890123"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      情報を連携する
                    </button>
                  </div>
                </div>

                {/* Additional steps will be added here */}
              </div>
            )}

            {activeTab === 1 && (
              <div className="text-center py-8">
                <p className="text-gray-600">ライフシミュレーションの内容は準備中です。</p>
              </div>
            )}

            {activeTab === 2 && (
              <div className="text-center py-8">
                <p className="text-gray-600">投資戦略の内容は準備中です。</p>
              </div>
            )}
          </div>

          {/* Right Side: Chat Container */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300 h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                {/* Chat messages will be displayed here */}
              </div>
              <div className="pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="メッセージを入力..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 