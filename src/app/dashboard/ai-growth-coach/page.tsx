'use client';

import { useChat } from 'ai/react';

export default function AIGrowthCoachPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1rem 8rem 1rem' }}>
        {/* Empty State - Pulsing Logo */}
        {messages.length === 0 && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                filter: 'blur(72px)',
                background: 'rgba(0, 255, 255, 0.3)',
                borderRadius: '9999px',
                animation: 'pulse 3s infinite'
              }} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '20rem', height: '20rem', color: '#00ffff', filter: 'drop-shadow(0 0 40px #00ffff)' }}
                viewBox="0 0 163.53 163.53"
              >
                <rect width="163.53" height="163.53" fill="currentColor" rx="40" opacity="0.2" />
                <polygon points="105.02 34.51 38.72 129.19 58.68 129.19 124.98 34.51 105.02 34.51" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '0 1rem' }}>
          {messages.map((m, index) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem',
                marginBottom: '3rem',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: 'rgba(30, 30, 60, 0.8)',
                border: '3px solid rgba(0, 255, 255, 0.6)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                flexShrink: 0
              }} />

              {/* Message Group */}
              <div style={{ maxWidth: '80%' }}>
                {/* Status Text - Only for Assistant Messages */}
                {m.role === 'assistant' && (
                  <p className="glow-soft" style={{
                    color: '#00ffff',
                    fontSize: '0.9rem',
                    marginBottom: '0.8rem',
                    textAlign: 'left'  // Fixed: always left for assistant
                  }}>
                    {index === 0 ? 'User connected\nGrok online' : 'Grok online'}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={m.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}
                  style={{
                    position: 'relative',
                    padding: '1.8rem 2.5rem',
                    borderRadius: '2.5rem',
                    border: '4px solid',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 40px rgba(0, 255, 255, 0.4)',
                    borderRadius: m.role === 'user' ? '2.5rem 2.5rem 0.5rem 2.5rem' : '2.5rem 2.5rem 2.5rem 0.5rem'
                  }}
                >
                  {/* Speech Bubble Tail */}
                  <div style={{
                    position: 'absolute',
                    top: '1.8rem',
                    width: '1.8rem',
                    height: '1.8rem',
                    background: 'inherit',
                    border: 'inherit',
                    clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
                    [m.role === 'user' ? 'right' : 'left']: '-0.9rem',
                    transform: 'rotate(45deg)'
                  }} />

                  <p className="glow-medium" style={{
                    fontSize: '1.6rem',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: '#ffffff'
                  }}>
                    {m.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: 'rgba(30, 30, 60, 0.8)',
                border: '3px solid rgba(0, 255, 255, 0.6)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)'
              }} />
              <div>
                <p className="glow-soft" style={{
                  color: '#00ffff',
                  fontSize: '0.9rem',
                  marginBottom: '0.8rem',
                  textAlign: 'left'
                }}>
                  Grok online
                </p>
                <div className="ai-chat-message-assistant" style={{
                  position: 'relative',
                  padding: '1.8rem 2.5rem',
                  borderRadius: '2.5rem 2.5rem 2.5rem 0.5rem',
                  border: '4px solid #00ffff80',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 0 40px rgba(0, 255, 255, 0.4)'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-0.9rem',
                    top: '1.8rem',
                    width: '1.8rem',
                    height: '1.8rem',
                    background: 'inherit',
                    border: 'inherit',
                    clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
                    transform: 'rotate(45deg)'
                  }} />
                  <p style={{ fontSize: '1.8rem', color: '#00ffff', animation: 'pulse 1.5s infinite', margin: 0 }}>
                    Thinking...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Input Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1.5rem',
        background: 'linear-gradient(to top, rgba(10,15,44,0.95), transparent)',
        backdropFilter: 'blur(20px)',
        borderTop: '3px solid rgba(0,255,255,0.4)'
      }}>
        <div style={{
          maxWidth: '90rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button type="button" style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(20,20,40,0.8)',
            border: '3px solid rgba(0,255,255,0.5)',
            boxShadow: '0 0 15px rgba(0,255,255,0.3)',
            fontSize: '1.5rem'
          }}>📎</button>

          <button type="button" style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(20,20,40,0.8)',
            border: '3px solid rgba(0,255,255,0.5)',
            boxShadow: '0 0 15px rgba(0,255,255,0.3)',
            fontSize: '1.5rem'
          }}>🖼</button>

          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Message..."
              style={{
                width: '100%',
                padding: '1.5rem 4rem 1.5rem 4rem',
                borderRadius: '2rem',
                background: 'rgba(15,20,40,0.9)',
                border: '4px solid rgba(0,255,255,0.6)',
                color: 'white',
                fontSize: '1.4rem',
                backdropFilter: 'blur(12px)',
                outline: 'none'
              }}
              autoFocus
            />
            <span style={{
              position: 'absolute',
              left: '1.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.8rem',
              color: '#00ffff'
            }}>←</span>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="cyber-btn"
            style={{ padding: '1.5rem 3.5rem', fontSize: '1.8rem' }}
          >
            Send
          </button>

          <button type="button" style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(20,20,40,0.8)',
            border: '3px solid rgba(0,255,255,0.5)',
            boxShadow: '0 0 15px rgba(0,255,255,0.3)',
            fontSize: '1.5rem'
          }}>😊</button>

          <button type="button" style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: 'rgba(20,20,40,0.8)',
            border: '3px solid rgba(0,255,255,0.5)',
            boxShadow: '0 0 15px rgba(0,255,255,0.3)',
            fontSize: '1.5rem'
          }}>🙂</button>
        </div>
      </div>
    </div>
  );
}