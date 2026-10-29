import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyChatMessages, sendChatMessage } from '../features/chat/chat.js';
import { toast } from 'react-toastify';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const user = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch customer messages
  const fetchMessages = async () => {
    if (!user.isLoggedIn || user.user?.isAdmin) return;
    try {
      setLoading(true);
      const res = await getMyChatMessages();
      setMessages(res.data || []);
    } catch (err) {
      console.error("Could not fetch chat history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user.isLoggedIn && !user.user?.isAdmin) {
      fetchMessages();
      // Optional polling every 6 seconds while open to receive admin replies
      const interval = setInterval(fetchMessages, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen, user.isLoggedIn]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (!user.isLoggedIn) {
      toast.info("Please sign in to chat with the seller");
      return navigate("/login");
    }

    try {
      setSending(true);
      setInputText('');
      const res = await sendChatMessage(text);
      if (res && res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // If user is admin, don't show the customer widget (admin uses dashboard tab)
  if (user.user?.isAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white rounded-full shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer border border-indigo-400/30"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="text-xl">💬</span>
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            Chat with Seller
          </span>
        </button>
      )}

      {/* Expanded Chat Box Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-96 h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl shadow-slate-900/25 border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-lg">
                  🏪
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">Seller & Admin Support</h3>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>●</span> Online & Ready to Help
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer text-sm"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
            {!user.isLoggedIn ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <span className="text-4xl">🔒</span>
                <h4 className="font-bold text-slate-800 text-sm">Sign in to Chat with Seller</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Log in so the store admin can identify your orders and give personalized answers.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <>
                {/* Greeting Card */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                    <span>👋</span>
                    <span>Welcome to ShopVerse Live Help</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Have questions about specs, shipping status, or warranties? Send a message directly to the seller below.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      "When will my order ship?",
                      "Can I customize RAM?",
                      "Is delivery free?"
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInputText(q)}
                        className="text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2 py-1 rounded-lg transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {loading && messages.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">Loading conversation...</div>
                )}

                {/* Messages List */}
                {messages.map((msg) => {
                  const isUser = msg.senderRole === 'USER';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-baseline gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {isUser ? 'You' : 'ShopVerse Seller'}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Bar */}
          {user.isLoggedIn && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message to seller..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer shrink-0"
              >
                {sending ? '⏳' : '➔'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
