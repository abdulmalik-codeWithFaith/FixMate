'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Send, ChevronLeft, Phone, MoreVertical, CheckCheck,
  Clock, Star, Calendar, Paperclip, ImageIcon, Smile,
  MapPin, Info
} from 'lucide-react'

type Message = {
  id: number
  sender: 'me' | 'them'
  text: string
  time: string
  status: 'sent' | 'delivered' | 'read'
}

const worker = {
  id: 'james-mitchell', initials: 'JM', name: 'James Mitchell',
  skill: 'Electrician', location: 'London, UK', rating: 4.9,
  avatarBg: '#FFF3EE', avatarColor: '#FF5C1A', online: true,
  lastSeen: 'Active now',
}

const initialMessages: Message[] = [
  { id: 1,  sender: 'them', text: 'Hi Sarah! I received your booking request for the consumer unit replacement. Happy to take on the job.', time: '10:02 AM', status: 'read' },
  { id: 2,  sender: 'me',   text: 'Great! Thanks for responding so quickly. When would you be available?',                                    time: '10:04 AM', status: 'read' },
  { id: 3,  sender: 'them', text: 'I can do tomorrow afternoon, say 2pm? The job usually takes around 2 hours for a standard unit swap.',      time: '10:05 AM', status: 'read' },
  { id: 4,  sender: 'me',   text: 'That works perfectly. The address is 12 Baker Street, London. Shall I confirm the booking?',                time: '10:07 AM', status: 'read' },
  { id: 5,  sender: 'them', text: 'Yes, please go ahead and confirm. I\'ll bring all the necessary parts. Just need to know the current unit brand if possible.', time: '10:08 AM', status: 'read' },
  { id: 6,  sender: 'me',   text: 'It\'s a Hager unit. About 10 years old.',                                                                  time: '10:10 AM', status: 'read' },
  { id: 7,  sender: 'them', text: 'Perfect, I carry those in stock. See you tomorrow at 2pm!',                                                time: '10:11 AM', status: 'read' },
]

const quickReplies = ['Sounds good!', 'What time works?', 'Can you send a quote?', 'See you then']

const S = `
  .chat-layout { height: 100vh; display: flex; flex-direction: column; background: #F5F4F1; }

  .chat-header {
    background: white; border-bottom: 1px solid #E8E6E1;
    padding: 0 20px; height: 64px;
    display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    position: sticky; top: 0; z-index: 40;
  }
  .chat-back {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    color: #6B6B6B; text-decoration: none; transition: all 0.2s;
    border: 1.5px solid #E8E6E1; flex-shrink: 0;
  }
  .chat-back:hover { border-color: #0F0F0F; color: #0F0F0F; }
  .chat-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
    flex-shrink: 0; position: relative;
  }
  .chat-online-dot {
    position: absolute; bottom: 1px; right: 1px;
    width: 11px; height: 11px; border-radius: 50%;
    background: #22C55E; border: 2px solid white;
  }
  .chat-header-info { flex: 1; min-width: 0; }
  .chat-worker-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .chat-status { font-size: 12px; color: #22C55E; font-weight: 500; }
  .chat-header-actions { display: flex; align-items: center; gap: 6px; }
  .chat-action-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: #F5F4F1; border: 1px solid #E8E6E1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #6B6B6B; transition: all 0.2s;
  }
  .chat-action-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .booking-banner {
    background: #FFF3EE; border-bottom: 1px solid rgba(255,92,26,0.15);
    padding: 12px 20px; display: flex; align-items: center;
    justify-content: space-between; gap: 12px; flex-shrink: 0; flex-wrap: wrap;
  }
  .booking-banner-left { display: flex; align-items: center; gap: 10px; }
  .booking-banner-icon { width: 32px; height: 32px; background: #FF5C1A; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .booking-banner-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #FF5C1A; }
  .booking-banner-sub { font-size: 12px; color: rgba(255,92,26,0.7); }
  .booking-banner-btn {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    border: none; border-radius: 8px; padding: 7px 14px;
    cursor: pointer; text-decoration: none; transition: background 0.2s; white-space: nowrap;
  }
  .booking-banner-btn:hover { background: #FF7A40; }

  .chat-body { display: flex; flex: 1; overflow: hidden; }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 24px 20px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-thumb { background: #E8E6E1; border-radius: 2px; }

  .date-sep { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
  .date-sep-line { flex: 1; height: 1px; background: #E8E6E1; }
  .date-sep-text { font-size: 11px; color: #AFAFAF; font-weight: 500; white-space: nowrap; }

  .msg-row { display: flex; gap: 8px; align-items: flex-end; }
  .msg-row.me { flex-direction: row-reverse; }
  .msg-mini-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10px; flex-shrink: 0;
  }
  .bubble {
    max-width: 68%; padding: 11px 16px;
    border-radius: 18px; font-size: 14px; line-height: 1.65;
  }
  .bubble.them { background: white; color: #0F0F0F; border: 1px solid #E8E6E1; border-bottom-left-radius: 4px; }
  .bubble.me   { background: #0F0F0F; color: white; border-bottom-right-radius: 4px; }
  .bubble-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; justify-content: flex-end; }
  .bubble-time { font-size: 10px; color: rgba(255,255,255,0.5); }
  .bubble-time.them-time { color: #AFAFAF; }

  .quick-replies {
    display: flex; flex-wrap: wrap; gap: 8px;
    padding: 8px 20px 12px; justify-content: flex-end;
    background: #F5F4F1;
  }
  .quick-reply {
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 100px; padding: 7px 16px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #0F0F0F; cursor: pointer; transition: all 0.2s;
  }
  .quick-reply:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .chat-input-area {
    background: white; border-top: 1px solid #E8E6E1;
    padding: 14px 20px; flex-shrink: 0;
  }
  .chat-input-inner { display: flex; align-items: flex-end; gap: 10px; }
  .chat-input-actions { display: flex; gap: 6px; }
  .chat-input-action {
    width: 36px; height: 36px; border-radius: 9px;
    background: #F5F4F1; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6B6B6B; transition: all 0.2s; flex-shrink: 0;
  }
  .chat-input-action:hover { background: #FFF3EE; color: #FF5C1A; }
  .chat-input-field {
    flex: 1; display: flex; align-items: center;
    background: #F5F4F1; border: 1.5px solid #E8E6E1;
    border-radius: 20px; padding: 10px 16px; transition: border-color 0.2s;
  }
  .chat-input-field:focus-within { border-color: #FF5C1A; background: white; }
  .chat-input-field input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0F0F0F;
  }
  .chat-input-field input::placeholder { color: #AFAFAF; }
  .chat-send-btn {
    width: 42px; height: 42px; border-radius: 50%;
    background: #FF5C1A; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
  }
  .chat-send-btn:hover { background: #FF7A40; transform: scale(1.05); }
  .chat-send-btn:disabled { background: #E8E6E1; cursor: not-allowed; transform: none; }

  /* SIDEBAR */
  .chat-sidebar {
    width: 280px; background: white; border-left: 1px solid #E8E6E1;
    padding: 24px; overflow-y: auto; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 0;
  }
  .cs-avatar {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px;
    margin: 0 auto 14px;
  }
  .cs-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #0F0F0F; text-align: center; margin-bottom: 4px; }
  .cs-skill { display: flex; justify-content: center; margin-bottom: 16px; }
  .cs-skill span { background: #FFF3EE; color: #FF5C1A; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
  .cs-stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
  .cs-stat { text-align: center; }
  .cs-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #0F0F0F; }
  .cs-stat-label { font-size: 11px; color: #6B6B6B; }
  .cs-divider { height: 1px; background: #E8E6E1; margin: 14px 0; }
  .cs-action {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: none; border-radius: 11px; padding: 12px;
    text-decoration: none; cursor: pointer; transition: background 0.2s; margin-bottom: 8px;
  }
  .cs-action:hover { background: #FF7A40; }
  .cs-action-sec {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; background: transparent; color: #0F0F0F;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px;
    border: 1.5px solid #E8E6E1; border-radius: 11px; padding: 11px;
    text-decoration: none; cursor: pointer; transition: all 0.2s;
  }
  .cs-action-sec:hover { background: #F5F4F1; }
  .cs-info { font-size: 13px; color: #6B6B6B; line-height: 1.65; }
  .cs-info strong { font-family: 'Syne', sans-serif; font-size: 13px; color: #0F0F0F; display: block; margin-bottom: 4px; }

  @keyframes typeDot {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  @media (max-width: 1000px) { .chat-sidebar { display: none; } }
  @media (max-width: 600px) {
    .bubble { max-width: 82%; }
    .chat-input-actions { display: none; }
  }
`

let msgCounter = 100

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text?: string) => {
    const val = (text ?? input).trim()
    if (!val) return
    setInput('')
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setMessages(p => [...p, { id: ++msgCounter, sender: 'me', text: val, time: now, status: 'sent' }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const replies = ['Got it, thanks!', 'Sure, that works perfectly.', 'No problem at all!', 'I\'ll make a note of that.']
      setMessages(p => [...p, {
        id: ++msgCounter, sender: 'them',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      }])
    }, 1500)
  }

  return (
    <>
      <style>{S}</style>
      <div className="chat-layout">

        <div className="chat-header">
          <Link href="/orders" className="chat-back"><ChevronLeft size={18} /></Link>
          <div className="chat-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>
            {worker.initials}
            {worker.online && <div className="chat-online-dot" />}
          </div>
          <div className="chat-header-info">
            <p className="chat-worker-name">{worker.name}</p>
            <p className="chat-status">{worker.lastSeen}</p>
          </div>
          <div className="chat-header-actions">
            <div className="chat-action-btn"><Phone size={16} /></div>
            <div className="chat-action-btn"><Info size={16} /></div>
            <div className="chat-action-btn"><MoreVertical size={16} /></div>
          </div>
        </div>

        <div className="booking-banner">
          <div className="booking-banner-left">
            <div className="booking-banner-icon"><Calendar size={16} color="white" /></div>
            <div>
              <p className="booking-banner-title">Upcoming booking — Tomorrow, 2:00 PM</p>
              <p className="booking-banner-sub">Consumer unit replacement · 12 Baker St, London</p>
            </div>
          </div>
          <Link href="/orders/o1" className="booking-banner-btn">View Details</Link>
        </div>

        <div className="chat-body">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="chat-messages">
              <div className="date-sep">
                <div className="date-sep-line" />
                <span className="date-sep-text">Today</span>
                <div className="date-sep-line" />
              </div>

              {messages.map(msg => (
                <div key={msg.id} className={`msg-row ${msg.sender}`}>
                  {msg.sender === 'them' && (
                    <div className="msg-mini-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>
                      {worker.initials}
                    </div>
                  )}
                  <div>
                    <div className={`bubble ${msg.sender}`}>{msg.text}</div>
                    <div className="bubble-meta">
                      <span className={`bubble-time${msg.sender === 'them' ? ' them-time' : ''}`}>{msg.time}</span>
                      {msg.sender === 'me' && (
                        msg.status === 'read'
                          ? <CheckCheck size={13} color="#22C55E" />
                          : <Clock size={11} color="rgba(255,255,255,0.4)" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="msg-row them">
                  <div className="msg-mini-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>{worker.initials}</div>
                  <div className="bubble them" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#AFAFAF', animation: 'typeDot 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="quick-replies">
              {quickReplies.map(q => (
                <button key={q} className="quick-reply" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            <div className="chat-input-area">
              <div className="chat-input-inner">
                <div className="chat-input-actions">
                  <button className="chat-input-action"><Paperclip size={17} /></button>
                  <button className="chat-input-action"><ImageIcon size={17} /></button>
                </div>
                <div className="chat-input-field">
                  <input
                    type="text"
                    placeholder="Type a message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AFAFAF', display: 'flex' }}>
                    <Smile size={18} />
                  </button>
                </div>
                <button className="chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim()}>
                  <Send size={17} color="white" />
                </button>
              </div>
            </div>
          </div>

          <div className="chat-sidebar">
            <div className="cs-avatar" style={{ background: worker.avatarBg, color: worker.avatarColor }}>{worker.initials}</div>
            <p className="cs-name">{worker.name}</p>
            <div className="cs-skill"><span>{worker.skill}</span></div>
            <div className="cs-stats">
              <div className="cs-stat"><div className="cs-stat-val">{worker.rating}</div><div className="cs-stat-label">Rating</div></div>
              <div className="cs-stat"><div className="cs-stat-val">214</div><div className="cs-stat-label">Jobs</div></div>
              <div className="cs-stat"><div className="cs-stat-val">9yr</div><div className="cs-stat-label">Exp</div></div>
            </div>
            <div className="cs-divider" />
            <Link href="/booking/james-mitchell" className="cs-action"><Calendar size={15} />Book Again</Link>
            <Link href="/explore/james-mitchell" className="cs-action-sec"><Star size={15} />View Profile</Link>
            <div className="cs-divider" />
            <div className="cs-info">
              <strong>Upcoming Job</strong>
              Tomorrow · 2:00 PM<br />
              Consumer unit replacement<br />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <MapPin size={12} color="#AFAFAF" /> 12 Baker St, London
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}