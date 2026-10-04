import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getSockJsUrl } from '../config/env';
import {
  MessageSquare,
  Send,
  User,
  Inbox,
  Clock,
  CheckCheck,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const initialPartnerId = searchParams.get('with');
  const initialItemId = searchParams.get('item');

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await API.get('/conversations');
        setConversations(res.data || []);

        if (initialPartnerId) {
          const partnerIdNum = parseInt(initialPartnerId);
          const existing = res.data.find((c) => c.id === partnerIdNum);
          if (existing) {
            setActivePartner(existing);
          } else {
            // Target user is new conversation partner
            setActivePartner({
              id: partnerIdNum,
              name: 'Item Reporter',
            });
          }
        } else if (res.data.length > 0) {
          setActivePartner(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
  }, [initialPartnerId]);

  // Load chat history when active partner changes
  useEffect(() => {
    if (!activePartner) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await API.get(`/conversations/${activePartner.id}/messages`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [activePartner]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  // STOMP WebSocket for real-time incoming messages & typing indicators
  useEffect(() => {
    if (!user) return;

    let client = null;
    try {
      client = new Client({
        webSocketFactory: () => new SockJS(getSockJsUrl()),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          // Subscribe to incoming messages
          client.subscribe(`/topic/messages/${user.id}`, (frame) => {
            if (frame.body) {
              const newMsg = JSON.parse(frame.body);
              if (
                activePartner &&
                (newMsg.senderId === activePartner.id || newMsg.receiverId === activePartner.id)
              ) {
                setMessages((prev) => [...prev, newMsg]);
                setIsPartnerTyping(false);
              }
            }
          });

          // Subscribe to typing indicator
          client.subscribe(`/topic/chat/${user.id}/typing`, (frame) => {
            if (frame.body) {
              const typingEvent = JSON.parse(frame.body);
              if (activePartner && typingEvent.senderId === activePartner.id) {
                setIsPartnerTyping(typingEvent.typing);
                if (typingEvent.typing) {
                  clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsPartnerTyping(false);
                  }, 3000);
                }
              }
            }
          });
        },
      });

      client.activate();
    } catch (e) {
      console.warn('STOMP chat client error:', e);
    }

    return () => {
      if (client) {
        try {
          client.deactivate();
        } catch (e) {}
      }
      clearTimeout(typingTimeoutRef.current);
    };
  }, [user, activePartner]);

  // Emit typing status on keystroke
  const handleInputChange = (e) => {
    setInputMsg(e.target.value);
    if (!activePartner) return;

    // Send typing notification to backend
    API.post('/messages/typing', {
      receiverId: activePartner.id,
      typing: e.target.value.length > 0,
    }).catch(() => {});
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activePartner) return;

    const content = inputMsg.trim();
    setInputMsg('');

    // Clear typing status
    API.post('/messages/typing', {
      receiverId: activePartner.id,
      typing: false,
    }).catch(() => {});

    try {
      const res = await API.post('/messages', {
        receiverId: activePartner.id,
        itemId: initialItemId ? parseInt(initialItemId) : null,
        content,
      });

      setMessages((prev) => [...prev, res.data]);

      // If active partner not in conversation list, add them
      setConversations((prev) => {
        if (!prev.some((c) => c.id === activePartner.id)) {
          return [activePartner, ...prev];
        }
        return prev;
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toastError('Failed to deliver message.');
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Privacy reminder banner */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>CampusFind Safe Messenger:</strong> Private verification answers, phone numbers, and contact details are never disclosed. All communication is routed securely through this portal.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 shrink-0">
            End-to-End Portal Protected
          </span>
        </div>

        {/* Main Chat Layout */}
        <div className="bg-white rounded-3xl border border-neutral-200 card-shadow overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
          {/* Left: Conversation List */}
          <div className="md:col-span-4 border-r border-neutral-200 flex flex-col bg-white">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversations
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-primary-dark">
                {conversations.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
              {conversations.length === 0 && !activePartner ? (
                <div className="p-8 text-center text-xs text-neutral-400">
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                  No active conversations yet. Connect with finders or reporters from match pages!
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActivePartner(c)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors relative ${
                      activePartner?.id === c.id
                        ? 'bg-orange-50/70 border-l-4 border-primary'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={
                          c.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`
                        }
                        alt={c.name}
                        className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                      />
                      {/* Online status indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-neutral-900 truncate">{c.name}</h4>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium truncate block">
                        Verified CampusFind Member
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Active Chat Window */}
          <div className="md:col-span-8 flex flex-col bg-neutral-50/30">
            {activePartner ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          activePartner.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${activePartner.name}`
                        }
                        alt={activePartner.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                        {activePartner.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[11px] text-green-700 font-medium">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Privacy Filtered</span>
                  </div>
                </div>

                {/* Messages List Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {loadingHistory ? (
                    <div className="text-center py-12 text-xs text-neutral-400">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-800">
                        Start chatting with {activePartner.name}
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                        Discuss item recovery details safely. Never send sensitive verification questions directly in plain text.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = user && m.senderId === user.id;

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>

                          <div
                            className={`flex items-center gap-1 text-[10px] text-neutral-400 mt-1 px-1 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span>
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                            {isMe && (
                              <CheckCheck
                                className={`w-3 h-3 ${m.isRead ? 'text-primary' : 'text-neutral-400'}`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing Indicator */}
                  {isPartnerTyping && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500 italic bg-white px-3 py-2 rounded-2xl border border-neutral-200 w-fit">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200"></span>
                      </div>
                      <span>{activePartner.name} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <div className="p-4 bg-white border-t border-neutral-200">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={handleInputChange}
                      placeholder={`Message ${activePartner.name}...`}
                      className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-neutral-50/50"
                    />
                    <button
                      type="submit"
                      disabled={!inputMsg.trim()}
                      className="p-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <MessageSquare className="w-12 h-12 mb-3 text-neutral-300" />
                <h3 className="text-base font-bold text-neutral-700">No Conversation Selected</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Select a message thread from the left or contact someone from their report page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
