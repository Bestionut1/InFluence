import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, Plus, MessageSquare, Trash2, Brain } from 'lucide-react';
import { useGenogramStore } from '../store/genogramStore';
import { GoogleGenAI } from '@google/genai';
import { AppHeader } from '../components/layout/AppHeader';
import { createPsychologySystemPrompt, assistantSettings } from '../services/aiChat';
import { extractRelationshipsFromChat, resolveExtractedRelationships } from '../services/relationshipExtractor';
import { chatDB } from '../services/chatDB';
import type { ChatSession } from '../components/chat/ChatSidebar';
import { ChatMessage } from '../components/chat/ChatMessage';
import { StreamRenderer, TypingIndicator } from '../components/chat/TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import type { ChatMessage as ChatMessageType } from '../services/aiChat';
import { useTranslation } from '../hooks/useTranslation';

export const PsychologyChatPage = () => {
  const { people, relations, addPerson, addRelation } = useGenogramStore();
  const t = useTranslation();

  // Chat state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [relationshipUpdates, setRelationshipUpdates] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const systemPromptRef = useRef<string>('');
  const genogramData = { people, relations };
  const shouldAutoScrollRef = useRef(true);

  // Initialize AI and load chat data from IndexedDB
  useEffect(() => {
    const initializeChat = async () => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        aiRef.current = new GoogleGenAI({ apiKey });
        systemPromptRef.current = createPsychologySystemPrompt(genogramData);
      }

      // Load sessions from IndexedDB
      try {
        await chatDB.init();
        const savedSessions = await chatDB.getSessions();
        const sessionsWithDates: ChatSession[] = savedSessions.map((s: unknown) => {
          const session = s as Record<string, unknown>;
          const createdAtValue = typeof session.createdAt === 'string' 
            ? new Date(session.createdAt as string) 
            : session.createdAt instanceof Date 
            ? session.createdAt 
            : new Date();
          return {
            id: String(session.id || ''),
            title: String(session.title || ''),
            createdAt: createdAtValue,
            personId: session.personId ? String(session.personId) : undefined,
          } as ChatSession;
        });
        setSessions(sessionsWithDates);
      } catch (e) {
        console.error('Failed to load sessions from IndexedDB:', e);
      }

      // Initialize with welcome message
      const welcomeMessage: ChatMessageType = {
        id: '1',
        role: 'assistant',
        content: t.chat.welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    };

    initializeChat();
  }, [t]);

  // Auto-scroll only when new assistant messages arrive (not on user input)
  useEffect(() => {
    if (shouldAutoScrollRef.current && messagesContainerRef.current) {
      // Scroll the messages container to bottom
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages, streaming, streamingText]);

  // Create new chat
  const handleNewChat = useCallback(async () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
    setStreamingText('');
    setInput('');
    setRelationshipUpdates([]);

    const welcomeMessage: ChatMessageType = {
      id: '1',
      role: 'assistant',
      content: t.chat.welcomeShortMessage,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // Save to IndexedDB
    try {
      await chatDB.saveSessions([newSession, ...sessions]);
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [sessions, t]);

  // Select existing chat
  const handleSelectSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    // Load messages from IndexedDB for this session
    try {
      const messages = await chatDB.getMessages(sessionId);
      const messagesWithDates: ChatMessageType[] = messages.map((m: unknown) => {
        const msg = m as Record<string, unknown>;
        const timestampValue = typeof msg.timestamp === 'string'
          ? new Date(msg.timestamp as string)
          : msg.timestamp instanceof Date
          ? msg.timestamp
          : new Date();
        return {
          id: String(msg.id || ''),
          role: (msg.role as 'user' | 'assistant' | 'system') || 'user',
          content: String(msg.content || ''),
          timestamp: timestampValue,
        } as ChatMessageType;
      });
      setMessages(messagesWithDates);
    } catch (e) {
      console.error('Failed to load messages:', e);
      setMessages([]);
    }
    setStreamingText('');
    setInput('');
  }, []);

  // Delete session
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      
      // Delete from IndexedDB
      try {
        await chatDB.deleteSession(sessionId);
        await chatDB.deleteSessionMessages(sessionId);
      } catch (e) {
        console.error('Failed to delete session:', e);
      }

      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    },
    [sessions, activeSessionId, handleNewChat]
  );

  // Stream response character by character
  const streamResponse = async (text: string) => {
    setStreaming(true);
    let currentText = '';

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setStreamingText(currentText);
      await new Promise(resolve => setTimeout(resolve, 20)); // Adjust speed here
    }

    setStreaming(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !aiRef.current) return;

    // Disable auto-scroll while user is interacting
    shouldAutoScrollRef.current = false;

    // Add user message
    const userMessage: ChatMessageType = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const userInput = input;
    setInput('');
    setLoading(true);
    setRelationshipUpdates([]);

    try {
      const conversationHistory = updatedMessages
        .slice(1)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = `${systemPromptRef.current}

${conversationHistory ? `CONVERSATION:\n${conversationHistory}\n\n` : ''}User: ${userInput}`;

      const response = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      let assistantContent = response?.text || t.chat.errorMessage;

      // Truncate if too long
      if (assistantContent.length > assistantSettings.maxResponseLength) {
        assistantContent = assistantContent.substring(0, assistantSettings.maxResponseLength).trim() + '...';
      }

      // Extract relationships
      const extracted = extractRelationshipsFromChat(userInput, assistantContent);
      console.log('🔍 Extracted relationships:', extracted);
      
      const { newPeople, newRelations, updates } = resolveExtractedRelationships(extracted, people);
      console.log('📦 New people to add:', newPeople);
      console.log('📦 New relations to add:', newRelations);
      console.log('📋 Updates:', updates);

      console.log('➕ Adding people to store...');
      newPeople.forEach(person => {
        console.log('  ➕ Adding person:', person.name, person.id);
        addPerson(person);
      });
      
      console.log('➕ Adding relations to store...');
      newRelations.forEach(relation => {
        console.log('  ➕ Adding relation:', relation.sourceId, '→', relation.targetId);
        addRelation(relation);
      });

      if (updates.length > 0) {
        console.log('✅ Setting relationship updates notification');
        setRelationshipUpdates(updates);
      }

      // Stream the response
      setStreamingText('');
      await streamResponse(assistantContent);

      // Add assistant message to chat
      const assistantMessage: ChatMessageType = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save messages to IndexedDB for this session
      if (activeSessionId) {
        try {
          // Save user message
          await chatDB.saveMessage({
            id: userMessage.id,
            sessionId: activeSessionId,
            role: userMessage.role,
            content: userMessage.content,
            timestamp: userMessage.timestamp.toISOString(),
          });
          
          // Save assistant message
          await chatDB.saveMessage({
            id: assistantMessage.id,
            sessionId: activeSessionId,
            role: assistantMessage.role,
            content: assistantMessage.content,
            timestamp: assistantMessage.timestamp.toISOString(),
          });
          
          // Update session title from first user message if title is still "New Chat"
          setSessions(prevSessions => {
            const updated = prevSessions.map(session => {
              if (session.id === activeSessionId && session.title === 'New Chat') {
                const newTitle = userInput.substring(0, 40) + (userInput.length > 40 ? '...' : '');
                return { ...session, title: newTitle, updatedAt: new Date() };
              }
              return session;
            });
            // Save updated sessions to IndexedDB
            chatDB.saveSessions(updated).catch(e => console.error('Failed to update sessions:', e));
            return updated;
          });
        } catch (e) {
          console.error('Failed to save messages to IndexedDB:', e);
        }
      }

      // Re-enable auto-scroll after response is complete
      shouldAutoScrollRef.current = true;
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessageType = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: t.chat.errorMessage,
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Save error state too
      if (activeSessionId) {
        localStorage.setItem(`chat_messages_${activeSessionId}`, JSON.stringify(finalMessages));
      }

      // Re-enable auto-scroll after error
      shouldAutoScrollRef.current = true;
    } finally {
      setLoading(false);
      setStreamingText('');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col overflow-hidden">
      <AppHeader showLogo showUserMenu sticky={true} />

      <div className="flex-1 flex overflow-hidden gap-0">
        {/* Enhanced Sidebar */}
        <div className="w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col p-4 space-y-4 overflow-hidden">
          <AnimatedButton
            onClick={handleNewChat}
            variant="primary"
            className="w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            {t.chat.newChatButton}
          </AnimatedButton>

          <div className="flex-1 overflow-y-auto space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">{t.chat.sessions}</p>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 px-2">{t.chat.noSessions}</p>
            ) : (
              sessions.map(session => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    activeSessionId === session.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{session.title}</p>
                    <p className="text-xs text-slate-500">
                      {session.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* Messages Container - Fixed height, scrollable */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Relationship Updates Notification */}
            <AnimatePresence>
              {relationshipUpdates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-700/50 rounded-lg p-4 max-w-2xl"
                >
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
                    <Sparkles className="w-4 h-4" />
                    {t.chat.genogramUpdated}
                  </div>
                  <div className="space-y-1">
                    {relationshipUpdates.map((update, idx) => (
                      <p key={idx} className="text-xs text-emerald-300 ml-6">
                        ✓ {update}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Welcome Message */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{t.chat.psychologyAssistant}</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  {t.chat.psychologyAssistantDesc}
                </p>
              </motion.div>
            )}

            {/* Chat Messages */}
            <AnimatePresence mode="wait">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ChatMessage
                    role={message.role}
                    timestamp={message.timestamp}
                  >
                    {message.content}
                  </ChatMessage>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming Response */}
            {streaming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ChatMessage role="assistant">
                  <StreamRenderer text={streamingText} isStreaming={true} />
                </ChatMessage>
              </motion.div>
            )}

            {/* Typing Indicator */}
            {loading && !streaming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TypingIndicator isVisible={true} />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-slate-700 bg-slate-800/50 p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <input
                  id="chat-input"
                  name="chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chat.chatPlaceholder}
                  disabled={loading}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t.chat.send}</span>
              </motion.button>
            </form>
            {input.length > 0 && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                {t.chat.pressEnterOrClick}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
