'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  collection, query, where, getDocs,
  orderBy, limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Send, Sparkles, MapPin, Star, RotateCcw,
  Wrench, Zap, Hammer, Wind, Paintbrush,
  Settings, ChevronRight, Bot, User, ArrowLeft,
  Briefcase, Clock, CheckCircle
} from 'lucide-react'


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
  price: number
  currency: string
  jobs: number
  available: boolean
  bio: string
  avatarBg: string
  avatarColor: string
  exp?: string
}

// ─── SKILL DETECTION ──────────────────────────────────────────────────────────
// Maps plain-English problem descriptions to Firestore skill category names.
// The more keywords we match, the more relevant the results.

interface SkillMatch {
  skill: string
  confidence: 'high' | 'medium' | 'low'
  keywords: string[]
}

function detectSkills(issue: string): SkillMatch[] {
  const t = issue.toLowerCase()
  const matches: SkillMatch[] = []

  const rules: { skill: string; patterns: RegExp[] }[] = [
    {
      skill: 'Plumber',
      patterns: [
        /pipe|leak|water|plumb|tap|drain|toilet|bathroom|sink|flood|drip|burst|sewage|geyser|boiler/,
      ],
    },
    {
      skill: 'Electrician',
      patterns: [
        /electric|wire|power|socket|light|fuse|volt|panel|circuit|trip|breaker|switch|outlet|plug|sparks|shock/,
      ],
    },
    {
      skill: 'Carpenter',
      patterns: [
        /wood|cabinet|furniture|door|floor|carpenter|shelf|wardrobe|stair|deck|frame|timber|joinery/,
      ],
    },
    {
      skill: 'Painter',
      patterns: [
        /paint|wall|colour|color|decor|ceiling|primer|finish|brush|roller|repaint|coating/,
      ],
    },
    {
      skill: 'AC Technician',
      patterns: [
        /ac|air con|cooling|hvac|heat|ventilat|duct|refriger|split unit|inverter/,
      ],
    },
    {
      skill: 'Tiler',
      patterns: [
        /tile|tiling|grout|mosaic|floor tile|wall tile|ceramic|porcelain|bathroom tile/,
      ],
    },
    {
      skill: 'Technician',
      patterns: [
        /generator|genset|inverter|solar|appliance|washing machine|fridge|oven|repair|technician|gadget/,
      ],
    },
    {
      skill: 'Mason',
      patterns: [
        /brick|block|cement|concrete|plaster|render|masonry|wall crack|foundation|screed/,
      ],
    },
  ]

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(t)) {
        const matched = t.match(pattern)
        matches.push({
          skill: rule.skill,
          confidence: 'high',
          keywords: matched ? [matched[0]] : [],
        })
        break // one match per skill is enough
      }
    }
  }

  return matches
}

// ─── FIREBASE FETCH ───────────────────────────────────────────────────────────
// Fetches workers from Firestore that match the detected skills.
// Priority: available workers → highest rated → most jobs done.

async function fetchMatchingWorkers(
  issue: string
): Promise<{ workers: Worker[]; primarySkill: string; allSkills: string[] }> {
  const matches = detectSkills(issue)

  // Primary skill — first match. Fallback to a broad fetch if nothing detected.
  const primarySkill = matches.length > 0 ? matches[0].skill : 'General'
  const allSkills    = matches.map(m => m.skill)

  let workers: Worker[] = []

  try {
    if (matches.length > 0) {
      // ── Try to fetch for each matched skill (up to 2 skills) ────────────────
      const skillsToFetch = allSkills.slice(0, 2)

      for (const skill of skillsToFetch) {
        // First try: available workers only, ordered by rating
        const availableSnap = await getDocs(
          query(
            collection(db, 'workers'),
            where('skill', '==', skill),
            where('available', '==', true),
            orderBy('rating', 'desc'),
            limit(3)
          )
        )

        availableSnap.forEach(doc => {
          const d = doc.data() as any
          if (!workers.find(w => w.id === doc.id)) {
            workers.push({
              id:          doc.id,
              initials:    d.initials    || d.name?.charAt(0) || 'W',
              name:        d.name        || 'Pro Worker',
              skill:       d.skill       || skill,
              location:    d.location    || 'Nearby',
              rating:      d.rating      || 4.5,
              price:       d.price       || 0,
              currency:    d.currency    || '$',
              jobs:        d.jobs        || 0,
              available:   d.available   ?? true,
              bio:         d.bio         || '',
              avatarBg:    d.avatarBg    || '#FFF3EE',
              avatarColor: d.avatarColor || '#FF5C1A',
              exp:         d.exp,
            })
          }
        })

        // If fewer than 2 available, also pull non-available workers to fill
        if (workers.filter(w => w.skill === skill).length < 2) {
          const allSnap = await getDocs(
            query(
              collection(db, 'workers'),
              where('skill', '==', skill),
              orderBy('rating', 'desc'),
              limit(3)
            )
          )
          allSnap.forEach(doc => {
            const d = doc.data() as any
            if (!workers.find(w => w.id === doc.id)) {
              workers.push({
                id:          doc.id,
                initials:    d.initials    || d.name?.charAt(0) || 'W',
                name:        d.name        || 'Pro Worker',
                skill:       d.skill       || skill,
                location:    d.location    || 'Nearby',
                rating:      d.rating      || 4.5,
                price:       d.price       || 0,
                currency:    d.currency    || '$',
                jobs:        d.jobs        || 0,
                available:   d.available   ?? false,
                bio:         d.bio         || '',
                avatarBg:    d.avatarBg    || '#FFF3EE',
                avatarColor: d.avatarColor || '#FF5C1A',
                exp:         d.exp,
              })
            }
          })
        }
      }
    }

    // ── Broad fallback if still no workers found ─────────────────────────────
    if (workers.length === 0) {
      const fallbackSnap = await getDocs(
        query(
          collection(db, 'workers'),
          where('available', '==', true),
          orderBy('rating', 'desc'),
          limit(4)
        )
      )
      fallbackSnap.forEach(doc => {
        const d = doc.data() as any
        workers.push({
          id:          doc.id,
          initials:    d.initials    || d.name?.charAt(0) || 'W',
          name:        d.name        || 'Pro Worker',
          skill:       d.skill       || primarySkill,
          location:    d.location    || 'Nearby',
          rating:      d.rating      || 4.5,
          price:       d.price       || 0,
          currency:    d.currency    || '$',
          jobs:        d.jobs        || 0,
          available:   d.available   ?? true,
          bio:         d.bio         || '',
          avatarBg:    d.avatarBg    || '#FFF3EE',
          avatarColor: d.avatarColor || '#FF5C1A',
          exp:         d.exp,
        })
      })
    }

    // Sort: available first, then by rating desc
    workers.sort((a, b) => {
      if (a.available && !b.available) return -1
      if (!a.available && b.available)  return  1
      return b.rating - a.rating
    })

    // Cap at 4 results
    return { workers: workers.slice(0, 4), primarySkill, allSkills }
  } catch (err) {
    console.error('Firebase worker fetch error:', err)
    return { workers: [], primarySkill, allSkills }
  }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = `
  .ai-page { min-height: 100vh; background: #FAFAF8; display: flex; flex-direction: column; }
  .ai-back { display: flex; align-items: center; gap: 6px; color: #AFAFAF; cursor: pointer; background: none; border: none; padding: 16px 40px 0; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: color 0.2s; width: fit-content; }
  .ai-back:hover { color: #0F0F0F; }
  .ai-header { background: white; border-bottom: 1px solid #E8E6E1; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; height: 64px; flex-shrink: 0; }
  .ai-header-left { display: flex; align-items: center; gap: 12px; }
  .ai-avatar { width: 38px; height: 38px; background: linear-gradient(135deg, #FF5C1A 0%, #FF7A40 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; }
  .ai-avatar-pulse { position: absolute; width: 10px; height: 10px; background: #22C55E; border-radius: 50%; bottom: -2px; right: -2px; border: 2px solid white; }
  .ai-header-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0F0F0F; }
  .ai-header-sub { font-size: 12px; color: #6B6B6B; }
  .ai-reset-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1.5px solid #E8E6E1; border-radius: 9px; padding: 7px 14px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #6B6B6B; cursor: pointer; transition: all 0.2s; }
  .ai-reset-btn:hover { border-color: #FF5C1A; color: #FF5C1A; }

  .ai-body { flex: 1; max-width: 800px; width: 100%; margin: 0 auto; padding: 32px 40px 160px; display: flex; flex-direction: column; gap: 20px; }

  .ai-welcome { text-align: center; padding: 32px 20px 24px; }
  .ai-welcome-icon { width: 72px; height: 72px; background: linear-gradient(135deg, #FF5C1A 0%, #FF7A40 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 32px rgba(255,92,26,0.25); }
  .ai-welcome-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -1px; color: #0F0F0F; margin-bottom: 10px; }
  .ai-welcome-title em { color: #FF5C1A; font-style: normal; }
  .ai-welcome-sub { font-size: 15px; color: #6B6B6B; font-weight: 300; line-height: 1.7; max-width: 480px; margin: 0 auto 32px; }
  .quick-prompts { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
  .quick-prompt { display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid #E8E6E1; border-radius: 100px; padding: 9px 18px; font-size: 13px; font-weight: 500; color: #0F0F0F; cursor: pointer; transition: all 0.2s; }
  .quick-prompt:hover { border-color: #FF5C1A; color: #FF5C1A; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,92,26,0.10); }

  .msg-row { display: flex; gap: 12px; align-items: flex-start; }
  .msg-row.user { flex-direction: row-reverse; }
  .msg-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .msg-avatar.ai   { background: linear-gradient(135deg, #FF5C1A, #FF7A40); }
  .msg-avatar.user { background: #0F0F0F; }
  .msg-bubble { max-width: 75%; padding: 14px 18px; border-radius: 18px; font-size: 14px; line-height: 1.75; white-space: pre-line; }
  .msg-bubble.ai { background: white; border: 1px solid #E8E6E1; color: #0F0F0F; border-top-left-radius: 4px; }
  .msg-bubble.user { background: #0F0F0F; color: white; border-top-right-radius: 4px; }
  .msg-bubble strong { font-weight: 700; }

  .option-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .option-chip { background: #FFF3EE; border: 1.5px solid rgba(255,92,26,0.25); color: #FF5C1A; border-radius: 100px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; padding: 7px 16px; cursor: pointer; transition: all 0.2s; }
  .option-chip:hover { background: #FF5C1A; color: white; }
  .option-chip:disabled { opacity: 0.4; cursor: not-allowed; }

  .typing-indicator { display: flex; align-items: center; gap: 5px; padding: 14px 18px; background: white; border: 1px solid #E8E6E1; border-radius: 18px; border-top-left-radius: 4px; width: fit-content; }
  .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #AFAFAF; animation: typingPulse 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingPulse { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }

  /* WORKER RESULT CARDS */
  .worker-results { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
  .result-card { background: white; border: 1px solid #E8E6E1; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
  .result-card:hover { border-color: #FF5C1A; box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .result-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; flex-shrink: 0; position: relative; }
  .result-avail-dot { position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; border-radius: 50%; border: 2px solid white; }
  .result-info { flex: 1; min-width: 0; }
  .result-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #0F0F0F; }
  .result-skill { display: inline-block; font-size: 11px; font-weight: 600; background: #FFF3EE; color: #FF5C1A; padding: 2px 9px; border-radius: 100px; margin: 3px 0; }
  .result-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 2px; }
  .result-meta-item { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #6B6B6B; }
  .result-bio { font-size: 12px; color: #6B6B6B; font-weight: 300; line-height: 1.5; margin-top: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .result-price { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-top: 5px; }
  .result-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
  .result-book { background: #FF5C1A; color: white; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px; border: none; border-radius: 8px; padding: 8px 16px; text-decoration: none; cursor: pointer; transition: background 0.2s; text-align: center; white-space: nowrap; }
  .result-book:hover { background: #FF7A40; }
  .result-view { background: transparent; color: #6B6B6B; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 12px; border: 1.5px solid #E8E6E1; border-radius: 8px; padding: 6px 16px; text-decoration: none; cursor: pointer; transition: all 0.2s; text-align: center; white-space: nowrap; }
  .result-view:hover { border-color: #0F0F0F; color: #0F0F0F; }

  /* SKILL MATCH BANNER */
  .skill-match-banner { display: flex; align-items: center; gap: 8px; background: #F0FDF4; border: 1px solid rgba(22,163,74,0.2); border-radius: 10px; padding: 9px 14px; margin-top: 10px; font-size: 12px; color: #16A34A; font-weight: 500; }
  .skill-pill { display: inline-flex; align-items: center; gap: 4px; background: #FFF3EE; color: #FF5C1A; border: 1px solid rgba(255,92,26,0.2); font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; }

  /* NO RESULTS */
  .no-results { background: #F5F4F1; border: 1px solid #E8E6E1; border-radius: 12px; padding: 20px; text-align: center; margin-top: 10px; }
  .no-results-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #0F0F0F; margin-bottom: 6px; }
  .no-results-sub { font-size: 13px; color: #6B6B6B; font-weight: 300; }

  .ai-input-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(250,250,248,0.95); backdrop-filter: blur(12px); border-top: 1px solid #E8E6E1; padding: 16px 40px 20px; z-index: 40; }
  .ai-input-inner { max-width: 800px; margin: 0 auto; display: flex; gap: 10px; align-items: flex-end; }
  .ai-input-field { flex: 1; display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid #E8E6E1; border-radius: 16px; padding: 13px 18px; transition: border-color 0.2s; }
  .ai-input-field:focus-within { border-color: #FF5C1A; box-shadow: 0 0 0 3px rgba(255,92,26,0.08); }
  .ai-input-field input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0F0F0F; }
  .ai-input-field input::placeholder { color: #AFAFAF; }
  .ai-send-btn { width: 48px; height: 48px; border-radius: 14px; background: #FF5C1A; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .ai-send-btn:hover { background: #FF7A40; transform: scale(1.05); }
  .ai-send-btn:disabled { background: #E8E6E1; cursor: not-allowed; transform: none; }
  .ai-input-hint { text-align: center; font-size: 11px; color: #AFAFAF; margin-top: 8px; max-width: 800px; margin-left: auto; margin-right: auto; }

  @media (max-width: 768px) {
    .ai-back { padding: 14px 20px 0; }
    .ai-header { padding: 0 20px; }
    .ai-body { padding: 24px 20px 140px; }
    .ai-input-bar { padding: 14px 16px 18px; }
    .msg-bubble { max-width: 88%; }
    .result-card { flex-wrap: wrap; }
    .result-actions { flex-direction: row; width: 100%; }
    .result-book, .result-view { flex: 1; }
  }
`

// ─── QUICK PROMPTS ────────────────────────────────────────────────────────────

const quickPrompts = [
  { icon: <Wrench size={14} />,     text: 'I have a leaking pipe'       },
  { icon: <Zap size={14} />,        text: 'Power keeps tripping'        },
  { icon: <Wind size={14} />,       text: 'AC not cooling properly'     },
  { icon: <Hammer size={14} />,     text: 'Need custom furniture built' },
  { icon: <Paintbrush size={14} />, text: 'Paint my living room'        },
  { icon: <Settings size={14} />,   text: 'Generator not starting'      },
]

const scheduleOptions = ['Today', 'Tomorrow', 'This weekend', 'Next week', "I'm flexible"]
const timeOptions     = ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–9pm)', 'Flexible / Anytime']

// ─── MARKDOWN BOLD RENDERER ───────────────────────────────────────────────────

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) =>
        i % 2 === 1
          ? <strong key={i}>{part}</strong>
          : part
      )}
    </>
  )
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const router = useRouter()

  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [step, setStep]             = useState<Step>(0)
  const [isTyping, setIsTyping]     = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [issue, setIssue]           = useState('')
  const [when, setWhen]             = useState('')
  const [optionsDisabled, setOptionsDisabled] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Message helpers ────────────────────────────────────────────────────────

  const pushAI = (msg: Omit<Message, 'id' | 'role'>, delay = 800) =>
    new Promise<void>(resolve => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(p => [...p, { ...msg, id: Date.now(), role: 'ai' }])
        resolve()
      }, delay)
    })

  const pushUser = (text: string) =>
    setMessages(p => [...p, { id: Date.now(), role: 'user', text }])

  // ── Main conversation flow ─────────────────────────────────────────────────

  const advance = async (val: string) => {
    setOptionsDisabled(true)

    if (step === 0) {
      // User described the issue → ask when
      const detectedSkills = detectSkills(val)
      const skillLabel = detectedSkills.length > 0
        ? detectedSkills.map(m => m.skill).join(' / ')
        : 'a skilled worker'

      setIssue(val)
      setStep(1)
      await pushAI({
        text: `Got it — sounds like you need a **${skillLabel}**.\n\nWhen would you like this sorted?`,
        options: scheduleOptions,
      })
      setOptionsDisabled(false)

    } else if (step === 1) {
      // User picked a schedule → ask time of day
      setWhen(val)
      setStep(2)
      await pushAI({
        text: 'Perfect. What time of day works best for you?',
        options: timeOptions,
      })
      setOptionsDisabled(false)

    } else if (step === 2) {
      // User picked a time → fetch workers from Firebase
      const timeSlot = val
      setStep(3)
      setIsFetching(true)

      // Show the summary and a searching message
      await pushAI({
        text: `Here's what I have:\n\n**Job:** ${issue}\n**When:** ${when}\n**Time:** ${timeSlot}\n\nSearching our verified worker database now…`,
      }, 600)

      // Fetch from Firestore
      const { workers, primarySkill, allSkills } = await fetchMatchingWorkers(issue)
      setIsFetching(false)

      if (workers.length === 0) {
        await pushAI({
          text: `I couldn't find any **${primarySkill}s** available right now. You can browse all workers on the explore page, or try describing your issue differently.`,
        }, 1000)
        setStep(6)
        return
      }

      const availableCount = workers.filter(w => w.available).length
      const skillsLabel    = allSkills.length > 1
        ? allSkills.join(' and ')
        : primarySkill

      await pushAI({
        text: `Found **${workers.length} verified ${skillsLabel}${workers.length > 1 ? 's' : ''}** near you${availableCount > 0 ? ` — **${availableCount} available now**` : ''}. Here are the top matches:`,
        workers,
      }, 1200)

      setStep(6)
    }
  }

  const handleSend = (text?: string) => {
    const val = (text ?? input).trim()
    if (!val || isTyping || isFetching) return
    setInput('')
    pushUser(val)
    advance(val)
  }

  // ── Quick prompt tap ───────────────────────────────────────────────────────

  const handleStart = async (promptText: string) => {
    if (step !== 0) return
    setMessages([])
    setStep(0)
    setOptionsDisabled(false)

    await pushAI({
      text: "Hi! I'm your FixMate AI assistant.\n\nI'll help you find the perfect worker in minutes. First — what do you need fixed or done?",
    }, 400)

    setTimeout(() => {
      pushUser(promptText)
      advance(promptText)
    }, 600)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setMessages([])
    setStep(0)
    setIssue('')
    setWhen('')
    setInput('')
    setOptionsDisabled(false)
    setIsFetching(false)
  }

  // ── First message on input focus ───────────────────────────────────────────

  const startConversation = () => {
    if (messages.length === 0 && !isTyping) {
      pushAI({
        text: "Hi! I'm your FixMate AI assistant.\n\nI'll help you find the perfect worker in minutes. First — what do you need fixed or done?",
      }, 300)
    }
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{S}</style>
      <div className="ai-page">

        {/* Back button */}
        <button className="ai-back" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">
              <Sparkles size={18} color="white" />
              <div className="ai-avatar-pulse" />
            </div>
            <div>
              <p className="ai-header-title">FixMate AI Assistant</p>
              <p className="ai-header-sub">Always online · Finds verified workers instantly</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button className="ai-reset-btn" onClick={handleReset}>
              <RotateCcw size={14} /> New Chat
            </button>
          )}
        </div>

        {/* Chat body */}
        <div className="ai-body">

          {/* Welcome screen */}
          {messages.length === 0 && (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">
                <Sparkles size={32} color="white" />
              </div>
              <h1 className="ai-welcome-title">Your <em>AI</em> Fix-It Assistant</h1>
              <p className="ai-welcome-sub">
                Describe your problem in plain English. I'll detect what kind of worker you need,
                ask a couple of quick questions, then pull the best verified matches from our database — instantly.
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
                {msg.role === 'ai' ? <Bot size={17} color="white" /> : <User size={17} color="white" />}
              </div>
              <div>
                <div className={`msg-bubble ${msg.role}`}>
                  <RichText text={msg.text} />
                </div>

                {/* Option chips — only show for the last AI message that has them */}
                {msg.options && !optionsDisabled && msg.id === Math.max(...messages.filter(m => m.options).map(m => m.id)) && (
                  <div className="option-chips">
                    {msg.options.map(opt => (
                      <button
                        key={opt}
                        className="option-chip"
                        disabled={isTyping || isFetching}
                        onClick={() => handleSend(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Worker results */}
                {msg.workers && msg.workers.length > 0 && (
                  <div className="worker-results">

                    {/* Skill detection banner */}
                    {(() => {
                      const skills = [...new Set(msg.workers!.map(w => w.skill))]
                      return (
                        <div className="skill-match-banner">
                          <CheckCircle size={13} />
                          Matched to:&nbsp;
                          {skills.map(s => <span key={s} className="skill-pill" style={{ marginRight: 4 }}>{s}</span>)}
                          &nbsp;based on your description
                        </div>
                      )
                    })()}

                    {msg.workers.map(w => (
                      <div key={w.id} className="result-card">
                        <div className="result-avatar" style={{ background: w.avatarBg, color: w.avatarColor }}>
                          {w.initials}
                          <span
                            className="result-avail-dot"
                            style={{ background: w.available ? '#22C55E' : '#D1D5DB' }}
                          />
                        </div>
                        <div className="result-info">
                          <p className="result-name">{w.name}</p>
                          <span className="result-skill">{w.skill}</span>
                          <div className="result-meta">
                            <span className="result-meta-item">
                              <MapPin size={10} /> {w.location}
                            </span>
                            <span className="result-meta-item">
                              <Star size={10} color="#F59E0B" fill="#F59E0B" /> {w.rating}
                            </span>
                            <span className="result-meta-item">
                              <Briefcase size={10} /> {w.jobs} jobs
                            </span>
                            {w.exp && (
                              <span className="result-meta-item">
                                <Clock size={10} /> {w.exp}
                              </span>
                            )}
                            <span className="result-meta-item" style={{ color: w.available ? '#16A34A' : '#6B6B6B', fontWeight: 600, fontFamily: 'Syne, sans-serif', fontSize: 11 }}>
                              {w.available ? '● Available' : '○ Busy'}
                            </span>
                          </div>
                          {w.bio && <p className="result-bio">{w.bio}</p>}
                          <p className="result-price">{w.currency}{w.price}/hr</p>
                        </div>
                        <div className="result-actions">
                          <Link href={`/booking/${w.id}`} className="result-book">Book Now</Link>
                          <Link href={`/explore/${w.id}`} className="result-view">Profile</Link>
                        </div>
                      </div>
                    ))}

                    <Link
                      href={`/explore?skill=${encodeURIComponent(msg.workers[0].skill)}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF5C1A', textDecoration: 'none', marginTop: 4 }}
                    >
                      See all {msg.workers[0].skill}s <ChevronRight size={14} />
                    </Link>
                  </div>
                )}

                {/* Empty worker results */}
                {msg.workers && msg.workers.length === 0 && (
                  <div className="no-results">
                    <p className="no-results-title">No workers found</p>
                    <p className="no-results-sub">Try browsing all workers or describe your issue differently.</p>
                    <Link href="/explore" style={{ display: 'inline-block', marginTop: 10, color: '#FF5C1A', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                      Browse all workers →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {(isTyping || isFetching) && (
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

        {/* Input bar */}
        <div className="ai-input-bar">
          <div className="ai-input-inner">
            <div className="ai-input-field">
              <Sparkles size={17} color="#FF5C1A" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder={messages.length === 0
                  ? 'Describe your problem… e.g. "my kitchen pipe is leaking"'
                  : 'Type your reply…'
                }
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => { if (messages.length === 0) startConversation() }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isFetching}
              />
            </div>
            <button
              className="ai-send-btn"
              onClick={() => handleSend()}
              disabled={(!input.trim() && messages.length === 0) || isTyping || isFetching}
            >
              <Send size={18} color="white" />
            </button>
          </div>
          <p className="ai-input-hint">
            Powered by FixMate AI · Real workers fetched live from our database
          </p>
        </div>
      </div>
    </>
  )
}