/**
 * ChatPage — ChatGPT-style interface connected to n8n backend.
 * User messages blue/right, assistant messages white/left, typing indicator, auto-scroll.
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../services/api.js';
import { Bot, User, Send } from 'lucide-react';

/**
 * Typing indicator with three animated dots
 */
function TypingIndicator() {
  return (
    <div className="chat-message assistant-message">
      <div className="chat-avatar assistant-avatar">
        <Bot size={20} />
      </div>
      <div className="chat-bubble" style={{ background: '#fff', border: '1px solid #e3e6f0' }}>
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

/**
 * Single chat message bubble
 */
function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      {/* Avatar */}
      <div className={`chat-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      {/* Bubble */}
      <div>
        <div className="chat-bubble">
          <div className="message-content">
            {isUser ? (
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        </div>
        <div className={`chat-timestamp ${isUser ? 'text-end' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory();
      setMessages(res.data.history || []);
    } catch { }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await chatAPI.sendMessage(trimmed);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        timestamp: res.data.timestamp || new Date().toISOString(),
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I couldn\'t process your request. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-container">
      {/* ─── Messages Area ───────────────────────────────── */}
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '80px', height: '80px', backgroundColor: '#e8eaf6' }}
            >
              <Bot size={40} className="text-primary" />
            </div>
            <h4 className="fw-bold text-dark">How can I help you today?</h4>
            <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
              Start a conversation and I'll do my best to assist you.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Area ──────────────────────────────────── */}
      <div className="chat-input-area">
        <div className="d-flex align-items-end gap-2">
          <textarea
            ref={textareaRef}
            className="form-control"
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            style={{ resize: 'none', maxHeight: '120px' }}
          />
          <button
            className="btn btn-primary d-flex align-items-center justify-content-center"
            style={{ width: '44px', height: '44px', flexShrink: 0 }}
            disabled={loading || !input.trim()}
            onClick={handleSend}
            id="chat-send-button"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="chat-helper-text">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}
