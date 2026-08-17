import React, { useState } from 'react';
import { Bot, MessageSquare, Send, X, Sparkles, Building, ArrowLeft } from 'lucide-react';
import { AIMatchBadge } from './AIMatchBadge';
import { Link } from 'react-router-dom';

export const ConversationalSearchWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'assistant',
      textAr: 'مرحباً بك! أنا مساعد العقارات الذكي 🤖. كيف يمكنني مساعدتك اليوم؟ يمكنك كتابة طلبك باللغة الطبيعية (مثال: عايز شقة 3 غرف في الغردقة).',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');
    setLoading(true);

    const newMessages = [
      ...messages,
      {
        sender: 'user',
        textAr: userText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMessages);

    try {
      const res = await fetch('http://localhost:3333/ai/conversational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-client-1',
          message: userText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const lastMsg = data.session?.messages?.slice(-1)[0];
        if (lastMsg) {
          setMessages([
            ...newMessages,
            {
              sender: 'assistant',
              textAr: lastMsg.textAr,
              timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
        if (data.matchedProperties) {
          setMatchedProperties(data.matchedProperties);
        }
      }
    } catch (err) {
      console.error('Conversational Search Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-primary to-navy text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 group"
      >
        <Bot size={26} className="text-accent animate-bounce" />
        <span className="font-bold text-sm hidden md:inline">مساعد البحث الذكي</span>
      </button>

      {/* Slide-over Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start items-end md:items-center p-0 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full md:w-[440px] h-[85vh] md:h-[600px] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy to-primary p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={22} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-base">مساعد العقارات الذكي</h3>
                  <p className="text-xs text-emerald-400">نشط الآن • إجابات فورية</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 text-right">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.textAr}</p>
                    <span className="text-[10px] opacity-60 mt-1 block text-left font-en">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Bot size={14} className="animate-spin text-primary" />
                  <span>الذكاء الاصطناعي يفكر ويحلل النتائج...</span>
                </div>
              )}

              {/* Matched Properties Carousel in Chat */}
              {matchedProperties.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-700 mb-2">أفضل العقارات المطابقة:</p>
                  <div className="space-y-2">
                    {matchedProperties.slice(0, 3).map((prop) => (
                      <div key={prop.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{prop.title}</h4>
                          <p className="text-[11px] text-primary font-bold">{prop.price?.toLocaleString()} EGP</p>
                        </div>
                        <AIMatchBadge score={prop.matchScore} compact />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب ردك أو استفسارك هنا..."
                className="flex-1 py-2.5 px-4 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-right"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-primary hover:bg-navy text-white p-2.5 rounded-xl transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
