import { SiOpenai } from 'react-icons/si';

export const TypingIndicator = () => (
  <div className="flex items-start gap-4">
    <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white">
      <SiOpenai className="w-5 h-5" />
    </div>
    <div className="max-w-[70%] rounded-lg p-4 bg-white text-gray-800 shadow border border-[#e5e7eb] flex items-center">
      <span className="flex space-x-1">
        <span className="inline-block w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="inline-block w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="inline-block w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  </div>
); 