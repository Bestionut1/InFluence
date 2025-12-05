import { Plus, MessageSquare, Trash2 } from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatSidebar = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 bg-slate-800/50 border-r border-slate-700/60 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-600/70 text-slate-100 rounded-lg transition-all text-sm font-semibold border border-slate-600/40 hover:border-slate-500/60"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Your Chats
          </div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-slate-700/50 text-slate-100 border-l-2 border-slate-400'
                    : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <div
                  onClick={() => onSelectSession(session.id)}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm truncate">{session.title}</p>
                  <p className="text-xs text-slate-500">
                    {session.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600/50 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
