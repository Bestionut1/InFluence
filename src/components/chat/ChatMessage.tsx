import { type ReactNode, memo } from 'react';
import { User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  children: ReactNode;
  timestamp?: Date;
}

const ChatMessageComponent = ({ role, children, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-2xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 ring-2 ring-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
              : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {children}
          </div>
          {timestamp && (
            <div className={`text-xs mt-2 ${isUser ? 'text-indigo-100/70' : 'text-slate-500'}`}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-500/30">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);
