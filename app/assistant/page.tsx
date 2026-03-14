'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/navigation";
import Link from 'next/link'
import {
  Send, Sparkles, MapPin, Star, ArrowRight,
  RotateCcw, Wrench, Zap, Hammer, Wind,
  Paintbrush, Settings, ChevronRight, Bot, User, ArrowLeft
} from 'lucide-react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Role = 'ai' | 'user'
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface Message {
  id: number
  role: Role
  text: string
  options?: string[]
  workers?: Worker[]
}

interface Worker {
  id: string
  initials: string
  name: string
  skill: string
  location: string
  rating: number
  price: string
  jobs: number
  avatarBg: string
  avatarColor: string
}

// ─── MOCK WORKERS ────────────────────────────────────────────────────────────

const workerPool: Record<string, Worker[]> = {
  plumbing: [
    { id: 'carlos-rivera',  initials: 'CR', name: 'Carlos Rivera',  skill: 'Plumber',     location: 'Miami, USA',    rating: 4.8, price: '$60/hr',    jobs: 189, avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
    { id: 'lucas-mendes',   initials: 'LM', name: 'Lucas Mendes',   skill: 'Plumber',     location: 'São Paulo, BR', rating: 4.5, price: '$35/hr',    jobs: 143, avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
    { id: 'ahmed-hassan',   initials: 'AH', name: 'Ahmed Hassan',   skill: 'Plumber',     location: 'Cairo, Egypt',  rating: 4.7, price: '$28/hr',    jobs: 201, avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  ],
  electrical: [
    { id: 'james-mitchell', initials: 'JM', name: 'James Mitchell', skill: 'Electrician', location: 'London, UK',    rating: 4.9, price: '£45/hr',    jobs: 214, avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
    { id: 'amara-osei',     initials: 'AO', name: 'Amara Osei',     skill: 'Electrician', location: 'Accra, Ghana',  rating: 4.6, price: '$30/hr',    jobs: 98,  avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
    { id: 'david-okonkwo',  initials: 'DO', name: 'David Okonkwo',  skill: 'Electrician', location: 'Lagos, NG',     rating: 4.7, price: '$20/hr',    jobs: 176, avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
  ],
  carpentry: [
    { id: 'kenji-tanaka',   initials: 'KT', name: 'Kenji Tanaka',   skill: 'Carpenter',   location: 'Tokyo, Japan',  rating: 4.7, price: '¥5,500/hr', jobs: 155, avatarBg: '#FFF8EE', avatarColor: '#D97706' },
    { id: 'marco-rossi',    initials: 'MR', name: 'Marco Rossi',    skill: 'Carpenter',   location: 'Milan, Italy',  rating: 4.7, price: '€65/hr',    jobs: 211, avatarBg: '#FFF8EE', avatarColor: '#D97706' },
  ],
  painting: [
    { id: 'aisha-patel',    initials: 'AP', name: 'Aisha Patel',    skill: 'Painter',     location: 'Dubai, UAE',    rating: 5.0, price: 'AED 80/hr', jobs: 302, avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
    { id: 'fatima-rashid',  initials: 'FR', name: 'Fatima Al-Rashid', skill: 'Painter',   location: 'Riyadh, SA',    rating: 4.9, price: '$70/hr',    jobs: 189, avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
  ],
  ac: [
    { id: 'priya-sharma',   initials: 'PS', name: 'Priya Sharma',   skill: 'AC Technician', location: 'Mumbai, IN', rating: 4.8, price: '$25/hr',    jobs: 267, avatarBg: '#F5F0FF', avatarColor: '#7C3AED' },
    { id: 'chen-wei',       initials: 'CW', name: 'Chen Wei',       skill: 'Technician',  location: 'Shanghai, CN',  rating: 4.6, price: '$28/hr',    jobs: 322, avatarBg: '#F5F0FF', avatarColor: '#7C3AED' },
  ],
  general: [
    { id: 'james-mitchell', initials: 'JM', name: 'James Mitchell', skill: 'Electrician', location: 'London, UK',    rating: 4.9, price: '£45/hr',    jobs: 214, avatarBg: '#FFF3EE', avatarColor: '#FF5C1A' },
    { id: 'aisha-patel',    initials: 'AP', name: 'Aisha Patel',    skill: 'Painter',     location: 'Dubai, UAE',    rating: 5.0, price: 'AED 80/hr', jobs: 302, avatarBg: '#F0FDF4', avatarColor: '#16A34A' },
    { id: 'carlos-rivera',  initials: 'CR', name: 'Carlos Rivera',  skill: 'Plumber',     location: 'Miami, USA',    rating: 4.8, price: '$60/hr',    jobs: 189, avatarBg: '#EEF6FF', avatarColor: '#2563EB' },
  ],
}

function detectCategory(text: string): string {
  const t = text.toLowerCase()
  if (t.match(/pipe|leak|water|plumb|tap|drain|toilet|bathroom/))    return 'plumbing'
  if (t.match(/electric|wire|power|socket|light|fuse|volt|panel/))   return 'electrical'
  if (t.match(/wood|cabinet|furniture|door|floor|carpenter|shelf/))  return 'carpentry'
  if (t.match(/paint|wall|colour|color|decor/))                      return 'painting'
  if (t.match(/ac|air con|cooling|hvac|heat/))                       return 'ac'
  return 'general'
}

// ─── CONVERSATION FLOW ───────────────────────────────────────────────────────

function buildFlow(issue: string, when: string, time: string): Message[] {
  const category = detectCategory(issue)
  const workers  = workerPool[category] ?? workerPool.general
  const skill    = workers[0]?.skill ?? 'worker'

  return [
    {
      id: 100, role: 'ai',
      text: `Got it! Let me summarise what you need:\n\n📋 **Job:** ${issue}\n📅 **When:** ${when}\n⏰ **Preferred time:** ${time}\n\nI'm fetching the best ${skill}s available for you now…`,
    },
    {
      id: 101, role: 'ai',
      text: `Great news! I found **${workers.length} verified ${skill}s** near you. Here are the top matches:`,
      workers,
    },
  ]
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = `
  .ai-page {
    min-height: 100vh;
    background: #FAFAF8;
    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .ai-header {
    background: white;
    border-bottom: 1px solid #E8E6E1;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    flex-shrink: 0;
  }
  .ai-header-left { display: flex; align-items: center; gap: 12px; }
  .ai-avatar {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #FF5C1A 0%, #FF7A40 100%);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .ai-avatar-pulse {
    position: absolute;
    width: 10px; height: 10px;
    background: #22C55E;
    border-radius: 50%;
    bottom: -2px; right: -2px;
    border: 2px solid white;
  }
  .ai-header-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 16px; color: #0F0F0F;
  }
  .ai-header-sub { font-size: 12px; color: #6B6B6B; }
  .ai-reset-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1.5px solid #E8E6E1;
    border-radius: 9px; padding: 7px 14px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    color: #6B6B6B; cursor: pointer; transition: all 0.2s;
  }
  .ai-reset-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }

  /* BODY */
  .ai-body {
    flex: 1;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 40px 160px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* WELCOME STATE */
  .ai-welcome { text-align: center; padding: 48px 20px 24px; }
  .ai-welcome-icon {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, #FF5C1A 0%, #FF7A40 100%);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 8px 32px rgba(255,92,26,0.25);
  }
  .ai-welcome-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800; letter-spacing: -1px;
    color: #0F0F0F; margin-bottom: 10px;
  }
  .ai-welcome-title em { color: #FF5C1A; font-style: normal; }
  .ai-welcome-sub {
    font-size: 15px; color: #6B6B6B; font-weight: 300;
    line-height: 1.7; max-width: 480px; margin: 0 auto 32px;
  }
  .quick-prompts { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
  .quick-prompt {
    display: flex; align-items: center; gap: 8px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 100px; padding: 9px 18px;
    font-size: 13px; font-weight: 500; color: #0F0F0F;
    cursor: pointer; transition: all 0.2s;
  }
  .quick-prompt:hover { border-color: #FF5C1A; color: #FF5C1A; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,92,26,0.10); }

  /* MESSAGES */
  .msg-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .msg-row.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 2px;
  }
  .msg-avatar.ai   { background: linear-gradient(135deg, #FF5C1A, #FF7A40); }
  .msg-avatar.user { background: #0F0F0F; }

  .msg-bubble {
    max-width: 75%;
    padding: 14px 18px;
    border-radius: 18px;
    font-size: 14px; line-height: 1.75;
    white-space: pre-line;
  }
  .msg-bubble.ai {
    background: white;
    border: 1px solid #E8E6E1;
    color: #0F0F0F;
    border-top-left-radius: 4px;
  }
  .msg-bubble.user {
    background: #0F0F0F;
    color: white;
    border-top-right-radius: 4px;
  }
  .msg-bubble strong { font-weight: 700; }

  /* OPTION CHIPS */
  .option-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-top: 12px;
  }
  .option-chip {
    background: #FFF3EE; border: 1.5px solid rgba(255,92,26,0.25);
    color: #FF5C1A; border-radius: 100px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    padding: 7px 16px; cursor: pointer; transition: all 0.2s;
  }
  .option-chip:hover { background: #FF5C1A; color: white; }

  /* TYPING INDICATOR */
  .typing-indicator {
    display: flex; align-items: center; gap: 5px;
    padding: 14px 18px;
    background: white; border: 1px solid #E8E6E1;
    border-radius: 18px; border-top-left-radius: 4px;
    width: fit-content;
  }
  .typing-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #AFAFAF; animation: typingPulse 1.2s infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingPulse {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  /* WORKER RESULT CARDS */
  .worker-results { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
  .result-card {
    background: white; border: 1px solid #E8E6E1;
    border-radius: 16px; padding: 16px;
    display: flex; align-items: center; gap: 14px;
    transition: all 0.2s;
  }
  .result-card:hover { border-color: #FF5C1A; box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .result-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px;
    flex-shrink: 0;
  }
  .result-info { flex: 1; min-width: 0; }
  .result-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .result-skill {
    display: inline-block; font-size: 11px; font-weight: 600;
    background: #FFF3EE; color: #FF5C1A;
    padding: 2px 9px; border-radius: 100px; margin: 3px 0;
  }
  .result-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .result-meta-item { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #6B6B6B; }
  .result-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
  .result-book {
    background: #FF5C1A; color: white;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    border: none; border-radius: 8px; padding: 7px 14px;
    text-decoration: none; cursor: pointer; transition: background 0.2s;
    text-align: center;
  }
  .result-book:hover { background: #FF7A40; }
  .result-view {
    background: transparent; color: #6B6B6B;
    font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px;
    border: 1.5px solid #E8E6E1; border-radius: 8px; padding: 6px 14px;
    text-decoration: none; cursor: pointer; transition: all 0.2s;
    text-align: center;
  }
  .result-view:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* INPUT BAR */
  .ai-input-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(250,250,248,0.95);
    backdrop-filter: blur(12px);
    border-top: 1px solid #E8E6E1;
    padding: 16px 40px 20px;
    z-index: 40;
  }
  .ai-input-inner {
    max-width: 800px; margin: 0 auto;
    display: flex; gap: 10px; align-items: flex-end;
  }
  .ai-input-field {
    flex: 1;
    display: flex; align-items: center; gap: 10px;
    background: white; border: 1.5px solid #E8E6E1;
    border-radius: 16px; padding: 13px 18px;
    transition: border-color 0.2s;
  }
  .ai-input-field:focus-within { border-color: #FF5C1A; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .ai-input-field input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F;
  }
  .ai-input-field input::placeholder { color: #AFAFAF; }
  .ai-send-btn {
    width: 48px; height: 48px; border-radius: 14px;
    background: #FF5C1A; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
  }
  .ai-send-btn:hover { background: #FF7A40; transform: scale(1.05); }
  .ai-send-btn:disabled { background: #E8E6E1; cursor: not-allowed; transform: none; }
  .ai-input-hint {
    text-align: center; font-size: 11px; color: #AFAFAF;
    margin-top: 8px; max-width: 800px; margin-left: auto; margin-right: auto;
  }

  @media (max-width: 768px) {
    .ai-header { padding: 0 20px; }
    .ai-body { padding: 24px 20px 140px; }
    .ai-input-bar { padding: 14px 16px 18px; }
    .msg-bubble { max-width: 88%; }
    .result-card { flex-wrap: wrap; }
    .result-actions { flex-direction: row; width: 100%; }
    .result-book, .result-view { flex: 1; }
  }
`

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const quickPrompts = [
  { icon: <Wrench size={14} />,     text: 'I have a leaking pipe' },
  { icon: <Zap size={14} />,        text: 'Power keeps tripping' },
  { icon: <Wind size={14} />,       text: 'AC not cooling properly' },
  { icon: <Hammer size={14} />,     text: 'Need custom furniture' },
  { icon: <Paintbrush size={14} />, text: 'Paint my living room' },
  { icon: <Settings size={14} />,   text: 'Generator not starting' },
]

const timeOptions     = ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–9pm)', 'Flexible / Anytime']
const schedulOptions  = ['Today', 'Tomorrow', 'This weekend', 'Next week', 'I\'m flexible']

let msgId = 1
const nextId = () => ++msgId

export default function AIAssistantPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [step, setStep]           = useState<Step>(0)
  const [isTyping, setIsTyping]   = useState(false)
  const [issue, setIssue]         = useState('')
  const [when, setWhen]           = useState('')
  const bottomRef                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const pushAI = (msg: Omit<Message, 'id' | 'role'>, delay = 800) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(p => [...p, { ...msg, id: nextId(), role: 'ai' }])
    }, delay)
  }

  const pushUser = (text: string) => {
    setMessages(p => [...p, { id: nextId(), role: 'user', text }])
  }

  const handleSend = (text?: string) => {
    const val = (text ?? input).trim()
    if (!val) return
    setInput('')
    pushUser(val)
    advance(val)
  }

  const advance = (val: string) => {
    if (step === 0) {
      setIssue(val)
      setStep(1)
      pushAI({
        text: 'Got it! When would you like this job done?',
        options: schedulOptions,
      })
    } else if (step === 1) {
      setWhen(val)
      setStep(2)
      pushAI({
        text: 'Perfect. What time of day works best for you?',
        options: timeOptions,
      })
    } else if (step === 2) {
      const time = val
      setStep(3)
      const flow = buildFlow(issue, when, time)
      // confirm message
      pushAI({ text: flow[0].text }, 600)
      // results message after delay
      setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          setMessages(p => [...p, { ...flow[1], id: nextId(), role: 'ai' }])
          setStep(6)
        }, 1800)
      }, 1400)
    }
  }

  const handleStart = (promptText: string) => {
    if (step !== 0) return
    setMessages([])
    setTimeout(() => {
      setStep(0)
      pushAI({ text: 'Hi! I\'m your FixMate AI assistant 👋\n\nI\'ll help you find the perfect worker in minutes. First — what do you need fixed or done?' }, 400)
      setTimeout(() => {
        pushUser(promptText)
        setIssue(promptText)
        setStep(1)
        pushAI({ text: 'Got it! When would you like this job done?', options: schedulOptions }, 1200)
      }, 1000)
    }, 100)
  }

  const handleReset = () => {
    setMessages([])
    setStep(0)
    setIssue('')
    setWhen('')
    setInput('')
  }

  const startConversation = () => {
    if (messages.length === 0) {
      pushAI({ text: 'Hi! I\'m your FixMate AI assistant 👋\n\nI\'ll help you find the perfect worker in minutes. First — what do you need fixed or done?' }, 300)
    }
  }
  const router = useRouter();


  return (
    <>
      <style>{S}</style>
      <div className="ai-page">
        <ArrowLeft
          size={30}
          color="#AFAFAF"
          className="cursor-pointer ml-10"
          onClick={() => router.back()}
        />
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">
              <Sparkles size={18} color="white" />
              <div className="ai-avatar-pulse" />
            </div>
            <div>
              <p className="ai-header-title">FixMate AI Assistant</p>
              <p className="ai-header-sub">Always online · Finds workers in seconds</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button className="ai-reset-btn" onClick={handleReset}>
              <RotateCcw size={14} /> New Chat
            </button>
          )}
        </div>

        <div className="ai-body">

          {messages.length === 0 && (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">
                <Sparkles size={32} color="white" />
              </div>
              <h1 className="ai-welcome-title">Your <em>AI</em> Fix-It Assistant</h1>
              <p className="ai-welcome-sub">
                Describe your problem in plain English. I'll ask a few quick questions,
                then find the best verified workers near you — instantly.
              </p>
              <div className="quick-prompts">
                {quickPrompts.map(p => (
                  <button key={p.text} className="quick-prompt" onClick={() => handleStart(p.text)}>
                    {p.icon} {p.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <div key={msg.id} className={`msg-row ${msg.role}`}>
              <div className={`msg-avatar ${msg.role}`}>
                {msg.role === 'ai'
                  ? <Bot size={17} color="white" />
                  : <User size={17} color="white" />
                }
              </div>
              <div>
                <div className={`msg-bubble ${msg.role}`}>
                  {msg.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>

                {/* Option chips */}
                {msg.options && step <= 2 && (
                  <div className="option-chips">
                    {msg.options.map(opt => (
                      <button key={opt} className="option-chip" onClick={() => handleSend(opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Worker results */}
                {msg.workers && (
                  <div className="worker-results">
                    {msg.workers.map(w => (
                      <div key={w.id} className="result-card">
                        <div className="result-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>
                          {w.initials}
                        </div>
                        <div className="result-info">
                          <p className="result-name">{w.name}</p>
                          <span className="result-skill">{w.skill}</span>
                          <div className="result-meta">
                            <span className="result-meta-item"><MapPin size={11} />{w.location}</span>
                            <span className="result-meta-item"><Star size={11} color="#F59E0B" fill="#F59E0B" />{w.rating}</span>
                            <span className="result-meta-item" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#0F0F0F' }}>{w.price}</span>
                          </div>
                        </div>
                        <div className="result-actions">
                          <Link href={`/booking/${w.id}`} className="result-book">Book Now</Link>
                          <Link href={`/explore/${w.id}`} className="result-view">View Profile</Link>
                        </div>
                      </div>
                    ))}
                    <Link href="/explore" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF5C1A', textDecoration: 'none', marginTop: 4 }}>
                      See all workers <ChevronRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="msg-row ai">
              <div className="msg-avatar ai"><Bot size={17} color="white" /></div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="ai-input-bar">
          <div className="ai-input-inner">
            <div className="ai-input-field">
              <Sparkles size={17} color="#FF5C1A" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder={messages.length === 0 ? 'Describe your problem… e.g. "leaking kitchen pipe"' : 'Type your reply…'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => { if (messages.length === 0) startConversation() }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              />
            </div>
            <button
              className="ai-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() && messages.length === 0}
            >
              <Send size={18} color="white" />
            </button>
          </div>
          <p className="ai-input-hint">
            Powered by FixMate AI · Your data is private and never shared
          </p>
        </div>

      </div>
    </>
  )
}