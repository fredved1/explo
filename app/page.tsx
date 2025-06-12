"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  HomeIcon,
  Coffee,
  Utensils,
  Sparkles,
  ChevronDown,
  PartyPopper,
  TreePine,
} from "lucide-react"
import confetti from "canvas-confetti"
import { fetchData, saveData as saveDataToKV } from "@/lib/api"

export default function ModernFamilieweekendExloo() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [activeTab, setActiveTab] = useState("home")
  const [selectedTeams, setSelectedTeams] = useState<{ [key: string]: string[] }>({})
  const [polls, setPolls] = useState<{ [key: string]: { [option: string]: { count: number; voters: string[] } } }>({
    bbq: {
      "Ik neem de BBQ mee!": { count: 0, voters: [] },
      "Iemand anders mag": { count: 0, voters: [] },
    },
    activity: {
      Wildlands: { count: 0, voters: [] },
      Boomkroonpad: { count: 0, voters: [] },
      Hunebedden: { count: 0, voters: [] },
      "Gewoon chillen": { count: 0, voters: [] },
      "Klimpark Joytime": { count: 0, voters: [] },
    },
  })
  const [nameInput, setNameInput] = useState("")
  const [showNameInput, setShowNameInput] = useState<string | null>(null)
  const [pollNameInput, setPollNameInput] = useState("")
  const [showPollNameInput, setShowPollNameInput] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const familyImages = [
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
  ]

  useEffect(() => {
    const eventDate = new Date("2025-06-20T16:00:00")

    const timer = setInterval(() => {
      const now = new Date()
      const difference = eventDate.getTime() - now.getTime()

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % familyImages.length)
    }, 4000)

    return () => clearInterval(imageTimer)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData()

      // Migrate old string format to array format
      const teams = data.teams || {}
      const migratedTeams: Record<string, string[]> = {}
      Object.entries(teams).forEach(([key, value]) => {
        if (typeof value === "string") {
          migratedTeams[key] = [value]
        } else if (Array.isArray(value)) {
          migratedTeams[key] = value
        } else {
          migratedTeams[key] = []
        }
      })

      setSelectedTeams(migratedTeams)

      // Migrate old poll format to new format with voters
      const polls = data.polls || {}
      const migratedPolls: Record<string, Record<string, { count: number; voters: string[] }>> = {}
      Object.entries(polls).forEach(([pollId, options]) => {
        migratedPolls[pollId] = {}
        Object.entries(options as Record<string, any>).forEach(([option, value]) => {
          if (typeof value === "number") {
            migratedPolls[pollId][option] = { count: value, voters: [] }
          } else if (value && typeof value === "object" && "count" in value) {
            migratedPolls[pollId][option] = value
          } else {
            migratedPolls[pollId][option] = { count: 0, voters: [] }
          }
        })
      })

      setPolls(
        migratedPolls.bbq
          ? migratedPolls
          : {
              bbq: {
                "Ik neem de BBQ mee!": { count: 0, voters: [] },
                "Iemand anders mag": { count: 0, voters: [] },
              },
              activity: {
                Wildlands: { count: 0, voters: [] },
                Boomkroonpad: { count: 0, voters: [] },
                Hunebedden: { count: 0, voters: [] },
                "Gewoon chillen": { count: 0, voters: [] },
                "Klimpark Joytime": { count: 0, voters: [] },
              },
            },
      )
    }
    
    loadData()
    
    // Refresh data every 5 seconds to see updates from other users
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const saveData = (
    teams: Record<string, string[]>,
    pollData: Record<string, Record<string, { count: number; voters: string[] }>>,
  ) => {
    saveDataToKV(teams, pollData)
  }

  const handleTeamSelect = (team: string) => {
    setShowNameInput(team)
  }

  const handleNameSubmit = (team: string) => {
    if (!nameInput.trim()) return

    const newTeams = {
      ...selectedTeams,
      [team]: [...(selectedTeams[team] || []), nameInput.trim()],
    }
    setSelectedTeams(newTeams)
    saveData(newTeams, polls)
    setNameInput("")
    setShowNameInput(null)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
    })
  }

  const handlePollVote = (pollId: string, option: string) => {
    setShowPollNameInput(`${pollId}-${option}`)
  }

  const handlePollNameSubmit = (pollId: string, option: string) => {
    if (!pollNameInput.trim()) return

    const newPolls = {
      ...polls,
      [pollId]: {
        ...polls[pollId],
        [option]: {
          count: (polls[pollId][option]?.count || 0) + 1,
          voters: [...(polls[pollId][option]?.voters || []), pollNameInput.trim()],
        },
      },
    }
    setPolls(newPolls)
    saveData(selectedTeams, newPolls)
    setPollNameInput("")
    setShowPollNameInput(null)
  }

  const handleTeamUnsubscribe = (teamId: string, memberName: string) => {
    const currentMembers = selectedTeams[teamId] || []
    const newMembers = currentMembers.filter((name) => name !== memberName)

    const newTeams = {
      ...selectedTeams,
      [teamId]: newMembers,
    }
    setSelectedTeams(newTeams)
    saveData(newTeams, polls)
  }

  const handlePollUnsubscribe = (pollId: string, option: string, voterName: string) => {
    const currentData = polls[pollId][option]
    const newVoters = currentData.voters.filter((name) => name !== voterName)

    const newPolls = {
      ...polls,
      [pollId]: {
        ...polls[pollId],
        [option]: {
          count: Math.max(0, currentData.count - 1),
          voters: newVoters,
        },
      },
    }
    setPolls(newPolls)
    saveData(selectedTeams, newPolls)
  }

  const triggerCelebration = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.4 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#065f46"],
    })
  }

  const tabs = [
    { id: "home", label: "Home", icon: Sparkles },
    { id: "verhaal", label: "Ons Verhaal", icon: Users },
    { id: "details", label: "Details", icon: Calendar },
    { id: "teams", label: "Teams", icon: Utensils },
    { id: "activiteiten", label: "Activiteiten", icon: TreePine },
    { id: "polls", label: "Polls", icon: PartyPopper },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20 safe-top">
        <div className="max-w-7xl mx-auto px-2 py-2 md:px-4 md:py-3">
          <div className="flex justify-start md:justify-center gap-1 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap text-xs md:text-sm ${
                  activeTab === tab.id ? "bg-white text-green-900 shadow-lg" : "text-white hover:bg-white/20"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">{tab.label}</span>
                <span className="font-medium sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20"
          >
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
              <div className="absolute inset-0">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${familyImages[currentImageIndex]})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent" />
              </div>

              <div className="relative z-10 text-center max-w-5xl mx-auto">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Familieweekend
                  </h1>
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-2 md:mb-4">Exloo 2025</h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light">Veddertjes & Antonisse</p>
                  <p className="text-base sm:text-lg md:text-xl text-white/80 mt-2">20-23 Juni 2025</p>
                </motion.div>

                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-8 border border-white/20"
                >
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Nog even geduld...</h3>
                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <motion.div key={unit} whileHover={{ scale: 1.05 }} className="text-center">
                        <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2">{value}</div>
                        <div className="text-xs sm:text-sm md:text-base text-white/70 font-medium capitalize">{unit}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
                >
                  <button
                    onClick={triggerCelebration}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Het is bijna zover! 🌳
                  </button>
                  <button
                    onClick={() => setActiveTab("verhaal")}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    Lees ons verhaal
                  </button>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  className="mt-12"
                >
                  <ChevronDown className="w-8 h-8 text-white/60 mx-auto" />
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === "verhaal" && (
          <motion.div
            key="verhaal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 md:pt-24 pb-20 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white text-center mb-12"
              >
                HET IS BIJNA ZOVER! 🌳
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 space-y-6 text-white/90 leading-relaxed"
              >
                <p className="text-lg font-medium">Lieve Veddertjes & Antonisses,</p>

                <p>
                  Deze groepsapp, onze digitale huiskamer sinds Loes in 2015 op 'maak groep' drukte, is een tijdcapsule.
                  Het is het levende bewijs van ons allemaal: een kroniek van bijna tien jaar lief en leed, verpakt in
                  duizenden appjes.
                </p>

                <p>
                  Het is de plek waar we huizen zagen veranderen in droomhuizen (hallo, Ibiza-tuin van Thijs & Daph!),
                  en waar Charlotte & Daan hun roots herontdekten met een terugkeer naar Hengelo. We zagen carrières een
                  vlucht nemen: Gideon als agent in Twente, Daph als kersverse jurist die IKEA verliet.
                </p>

                <p>
                  We hebben de wereld rondgereisd: van wintersport in Oostenrijk en onze gezamenlijke avonturen in Sri
                  Lanka tot de onvergetelijke familietrip naar Rhodos – waar Isabelle, onze wereldreiziger, dacht dat we
                  op Samos zaten en Rick naadloos in de chaos werd opgenomen.
                </p>

                <p>
                  We zagen de volgende generatie arriveren: Thirza & Daantje die opgroeien van dreumes tot stoere kids,
                  en de komst van onze nieuwste neefjes, de lieve Philippe en de kersverse Freddie Lewis.
                </p>

                <p>
                  We hebben avonturen beleefd die we nooit vergeten: Charlotte die de zwaartekracht uitdaagde met een
                  skydive en nu de boksring in stapt, de heldhaftige Mudmasters-run, en de legendarische Gaypride op de
                  boot van neef Jaap.
                </p>

                <p>
                  En we hebben samen de adem ingehouden, geduimd en gehoopt in spannende tijden. Gezien hoe sterk de
                  basis is als het er echt op aankomt. Peter, jouw reis de laatste tijd is daar het krachtigste bewijs
                  van, met Heleen, het warme hart van de familie, rotsvast aan je zijde.
                </p>

                <p>
                  Deze app is het bewijs van wie we zijn: een familie die deelt. Van de AI-serenades van Thomas en de{" "}
                  <em>White Lotus</em>-aftermovies van Daan tot de steun van Jassie, ons emotionele kompas. Van de
                  eindeloze discussies over wie-wat-betaalt-voor-kerst tot het onopgeloste mysterie van de indoor
                  wondertol.
                </p>

                <p className="font-semibold text-lg text-green-300">
                  En nu, lieve allemaal, voegen we een nieuw, belangrijk hoofdstuk toe aan dit verhaal. Een weekend
                  speciaal voor jou, Peter. Om te proosten op een leven vol toewijding in je praktijk en op het
                  prachtige nieuwe hoofdstuk dat voor je ligt.
                </p>

                <p className="text-xl font-bold text-center mt-8 text-green-300">
                  Tijd om de telefoons even weg te leggen en live herinneringen te maken.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 md:pt-24 pb-20 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white text-center mb-12"
              >
                Praktische Info
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <MapPin className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Locatie</h3>
                  <p className="text-white/80 text-lg">Landal Puur Exloo</p>
                  <p className="text-white/80">2 wellness huisjes met sauna</p>
                  <p className="text-white/60 mt-2">Midden in de prachtige bossen van Drenthe</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <Calendar className="w-12 h-12 text-emerald-400 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Wanneer</h3>
                  <p className="text-white/80 text-lg">Vrijdag 20 juni (16:00)</p>
                  <p className="text-white/80">t/m Maandag 23 juni (10:30)</p>
                  <p className="text-white/60 mt-2">Een lang weekend vol familie tijd</p>
                </motion.div>
              </div>

              {/* Reistijden */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8"
              >
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <MapPin className="w-8 h-8" />
                  Reistijden naar Landal Puur Exloo
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-bold text-xl text-white mb-2">Vanuit Amsterdam</h4>
                    <p className="text-white/80 text-lg">🚗 1 uur 45 min</p>
                    <p className="text-white/60">± 165 km</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-bold text-xl text-white mb-2">Vanuit Apeldoorn</h4>
                    <p className="text-white/80 text-lg">🚗 1 uur 15 min</p>
                    <p className="text-white/60">± 90 km</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-bold text-xl text-white mb-2">Vanuit Hengelo</h4>
                    <p className="text-white/80 text-lg">🚗 50 min</p>
                    <p className="text-white/60">± 70 km</p>
                  </div>
                </div>
              </motion.div>

              {/* Huisjes Faciliteiten */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8"
              >
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  Luxe Wellness Villa's - Wat is er?
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        🛁 Wellness & Badkamers
                      </h4>
                      <ul className="text-white/80 space-y-1 text-sm">
                        <li>• Privé Finse sauna in elk huisje</li>
                        <li>• 3 badkamers met regendouches</li>
                        <li>• Bubbelbad & sunshower</li>
                        <li>• Gratis toegang zwembad Fletcher hotel</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        🏠 Wooncomfort
                      </h4>
                      <ul className="text-white/80 space-y-1 text-sm">
                        <li>• Ruime woonkamer met flatscreen TV</li>
                        <li>• Terras met tuinmeubilair</li>
                        <li>• 2 verdiepingen</li>
                        <li>• Bedden zijn opgemaakt bij aankomst</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        👨‍🍳 Keuken
                      </h4>
                      <ul className="text-white/80 space-y-1 text-sm">
                        <li>• Volledig uitgeruste open keuken</li>
                        <li>• Vaatwasser & combi-magnetron</li>
                        <li>• Quooker (kokend water kraan)</li>
                        <li>• Nespresso koffieapparaat</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        🛏️ Slapen
                      </h4>
                      <ul className="text-white/80 space-y-1 text-sm">
                        <li>• 4 slaapkamers op 1e verdieping</li>
                        <li>• 3 kamers met 2 boxspring bedden</li>
                        <li>• 1 kamer met bedstee voor 2 personen</li>
                        <li>• Kleine & grote handdoek per persoon</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Huisindeling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
              >
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <HomeIcon className="w-8 h-8" />
                  Huisindeling & Slaapverdeling
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-bold text-xl text-white mb-3">Huisje 349 - De Baby-Bubble</h4>
                    <div className="space-y-3 text-white/80">
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 1 (Master):</p>
                        <p className="text-sm">Peter & Heleen</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 2:</p>
                        <p className="text-sm">Thomas & Jassie (+ Freddie Lewis)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 3:</p>
                        <p className="text-sm">Loes & Gideon (+ Philippe)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 4 (Bedstee):</p>
                        <p className="text-sm">Reserve/opslag</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-bold text-xl text-white mb-3">Huisje 391 - De Avonturiers</h4>
                    <div className="space-y-3 text-white/80">
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 1:</p>
                        <p className="text-sm">Charlotte & Daan</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 2:</p>
                        <p className="text-sm">Thirza & Daantje</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 3:</p>
                        <p className="text-sm">Thijs & Daph</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Slaapkamer 4 (Bedstee):</p>
                        <p className="text-sm">Isabelle & Rick</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-4">
                  <p className="text-white/90 text-sm">
                    <strong>💡 Tip:</strong> Elk huisje heeft 3 badkamers, dus geen ochtendspits bij het douchen! 
                    De sauna's zijn perfect voor een ontspannen avond na een dag vol activiteiten.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "teams" && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 md:pt-24 pb-20 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white text-center mb-12"
              >
                Operatie Culinair Commando
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/80 text-center mb-12 text-lg"
              >
                Klik op een team om je aan te melden met je naam!
              </motion.p>

              <div className="space-y-6">
                {[
                  {
                    id: "breakfast",
                    name: "Team Ochtendgloren",
                    icon: Coffee,
                    desc: "Ontbijt & Lunch",
                    details:
                      "De helden die zorgen voor brood, croissants, beleg (zoet & hartig), eieren, yoghurt en sapjes voor de zaterdag en zondag.",
                    color: "from-yellow-500/20 to-orange-500/20",
                  },
                  {
                    id: "friday",
                    name: "Team Vrijdagavond",
                    icon: Sparkles,
                    desc: "Diner Dag 1",
                    details:
                      "Neemt de leiding voor het diner op de aankomstdag. Iets makkelijks en gezelligs om het weekend mee in te luiden?",
                    color: "from-purple-500/20 to-pink-500/20",
                  },
                  {
                    id: "saturday",
                    name: "Team Zaterdagavond",
                    icon: Utensils,
                    desc: "Het Hoofdgerecht!",
                    details: "Pakt uit met het hoofdgerecht van het weekend. De culinaire climax!",
                    color: "from-red-500/20 to-orange-500/20",
                  },
                  {
                    id: "drinks",
                    name: "Team Vloeibare Vreugde & Snacks",
                    icon: PartyPopper,
                    desc: "Drank & Borrelhappen",
                    details:
                      "De onmisbare curatoren van de goede sfeer. Zij regelen de strategische voorraad wijn, bier, fris, chips en borrelhappen voor het hele weekend.",
                    color: "from-blue-500/20 to-cyan-500/20",
                  },
                ].map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${team.color} backdrop-blur-lg rounded-3xl p-8 border border-white/20`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <team.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-2xl text-white mb-2">{team.name}</h4>
                        <p className="text-white/80 mb-4">{team.details}</p>

                        {selectedTeams[team.id] &&
                          Array.isArray(selectedTeams[team.id]) &&
                          selectedTeams[team.id].length > 0 && (
                            <div className="mb-4">
                              <p className="font-semibold text-white mb-2">Aangemeld:</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedTeams[team.id].map((name, index) => (
                                  <span
                                    key={index}
                                    className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                                  >
                                    {name}
                                    <button
                                      onClick={() => handleTeamUnsubscribe(team.id, name)}
                                      className="text-white/70 hover:text-white ml-1 text-xs"
                                      title="Afmelden"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {showNameInput === team.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder="Je naam..."
                              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              onKeyPress={(e) => e.key === "Enter" && handleNameSubmit(team.id)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleNameSubmit(team.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
                            >
                              Aanmelden
                            </button>
                            <button
                              onClick={() => setShowNameInput(null)}
                              className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300"
                            >
                              Annuleren
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleTeamSelect(team.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
                          >
                            Aanmelden voor {team.name}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 bg-yellow-500/20 backdrop-blur-lg border border-yellow-400/30 rounded-2xl p-6"
              >
                <p className="text-white/90">
                  <strong>Voor zondagavond</strong> doen we lekker makkelijk. Voor degenen die blijven, kunnen we
                  creatief zijn met de restjes óf gezamenlijk een (pannenkoeken)restaurant in de buurt opzoeken om het
                  weekend in stijl af te sluiten. Geen stress!
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === "activiteiten" && (
          <motion.div
            key="activiteiten"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 md:pt-24 pb-20 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white text-center mb-12"
              >
                🎯 Activiteiten in de Omgeving
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center text-white/80 mb-12 text-lg"
              >
                Naast alle gezelligheid in de huisjes, is er in de Drentse omgeving genoeg te ontdekken. Hier zijn wat
                ideeën waar we ter plekke uit kunnen kiezen:
              </motion.p>

              <div className="space-y-8">
                {/* Natuurliefhebbers */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <TreePine className="w-8 h-8" />
                    Voor de Natuurliefhebbers & Wandelaars
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h4 className="text-xl font-semibold text-white mb-2">De Hondsrug verkennen</h4>
                      <p className="text-white/80 mb-2">
                        We zitten midden in het UNESCO Geopark de Hondsrug. Direct vanuit het park starten prachtige
                        wandel- en fietsroutes door bos en over heide.
                      </p>
                      <p className="text-sm text-green-300">
                        <strong>Afstand:</strong> Direct om de hoek
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">Het Boomkroonpad</h4>
                          <p className="text-white/80 mb-2">
                            Een unieke wandeling door de toppen van de bomen. Een avontuur voor jong en oud!
                          </p>
                          <p className="text-sm text-green-300 mb-2">
                            <strong>Afstand:</strong> ca. 20 min rijden
                          </p>
                          <a
                            href="https://www.staatsbosbeheer.nl/boomkroonpad"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            🔗 www.staatsbosbeheer.nl/boomkroonpad
                          </a>
                        </div>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-4">
                          {polls.activity["Boomkroonpad"]?.count || 0}
                        </span>
                      </div>

                      {polls.activity["Boomkroonpad"]?.voters && polls.activity["Boomkroonpad"].voters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {polls.activity["Boomkroonpad"].voters.map((voter, index) => (
                            <span
                              key={index}
                              className="bg-white/20 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              {voter}
                              <button
                                onClick={() => handlePollUnsubscribe("activity", "Boomkroonpad", voter)}
                                className="text-white/70 hover:text-white ml-1 text-xs"
                                title="Afmelden"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {showPollNameInput === "activity-Boomkroonpad" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pollNameInput}
                            onChange={(e) => setPollNameInput(e.target.value)}
                            placeholder="Je naam..."
                            className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("activity", "Boomkroonpad")}
                            autoFocus
                          />
                          <button
                            onClick={() => handlePollNameSubmit("activity", "Boomkroonpad")}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 text-sm rounded hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                          >
                            Stemmen
                          </button>
                          <button
                            onClick={() => setShowPollNameInput(null)}
                            className="bg-white/20 text-white px-3 py-2 text-sm rounded hover:bg-white/30 transition-all duration-300"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePollVote("activity", "Boomkroonpad")}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm rounded hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
                        >
                          Stem voor Boomkroonpad
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Cultuursnuivers */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    🗿 Voor de Cultuursnuivers & Ontdekkers
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">Hunebedcentrum Borger</h4>
                          <p className="text-white/80 mb-2">
                            Hier ligt het grootste hunebed van Nederland. Een duik in de prehistorie die je in Drenthe
                            niet mag missen.
                          </p>
                          <p className="text-sm text-orange-300 mb-2">
                            <strong>Afstand:</strong> ca. 10 min rijden
                          </p>
                          <a
                            href="https://www.hunebedcentrum.nl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            🔗 www.hunebedcentrum.nl
                          </a>
                        </div>
                        <span className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-4">
                          {polls.activity["Hunebedden"]?.count || 0}
                        </span>
                      </div>

                      {polls.activity["Hunebedden"]?.voters && polls.activity["Hunebedden"].voters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {polls.activity["Hunebedden"].voters.map((voter, index) => (
                            <span
                              key={index}
                              className="bg-white/20 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              {voter}
                              <button
                                onClick={() => handlePollUnsubscribe("activity", "Hunebedden", voter)}
                                className="text-white/70 hover:text-white ml-1 text-xs"
                                title="Afmelden"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {showPollNameInput === "activity-Hunebedden" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pollNameInput}
                            onChange={(e) => setPollNameInput(e.target.value)}
                            placeholder="Je naam..."
                            className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("activity", "Hunebedden")}
                            autoFocus
                          />
                          <button
                            onClick={() => handlePollNameSubmit("activity", "Hunebedden")}
                            className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-3 py-2 text-sm rounded hover:from-orange-600 hover:to-yellow-700 transition-all duration-300"
                          >
                            Stemmen
                          </button>
                          <button
                            onClick={() => setShowPollNameInput(null)}
                            className="bg-white/20 text-white px-3 py-2 text-sm rounded hover:bg-white/30 transition-all duration-300"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePollVote("activity", "Hunebedden")}
                          className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-4 py-2 text-sm rounded hover:from-orange-600 hover:to-yellow-700 transition-all duration-300 font-medium"
                        >
                          Stem voor Hunebedden
                        </button>
                      )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h4 className="text-xl font-semibold text-white mb-2">Museumdorp Orvelte</h4>
                      <p className="text-white/80 mb-2">
                        Wandel terug in de tijd in dit prachtige, monumentale dorp vol oude boerderijen, ambachten en
                        gezellige horeca.
                      </p>
                      <p className="text-sm text-orange-300 mb-2">
                        <strong>Afstand:</strong> ca. 25 min rijden
                      </p>
                      <a
                        href="https://www.orvelte.nl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-sm"
                      >
                        🔗 www.orvelte.nl
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Avonturiers */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    🦁 Voor de Avonturiers & Families
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">WILDLANDS Adventure Zoo Emmen</h4>
                          <p className="text-white/80 mb-2">
                            Een van de mooiste dierentuinen van Nederland, waar je een wereldreis maakt door de jungle,
                            savanne en het poolgebied. Een topdag voor de kids (en volwassenen!).
                          </p>
                          <p className="text-sm text-purple-300 mb-2">
                            <strong>Afstand:</strong> ca. 20 min rijden
                          </p>
                          <a
                            href="https://www.wildlands.nl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            🔗 www.wildlands.nl
                          </a>
                        </div>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-4">
                          {polls.activity["Wildlands"]?.count || 0}
                        </span>
                      </div>

                      {polls.activity["Wildlands"]?.voters && polls.activity["Wildlands"].voters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {polls.activity["Wildlands"].voters.map((voter, index) => (
                            <span
                              key={index}
                              className="bg-white/20 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              {voter}
                              <button
                                onClick={() => handlePollUnsubscribe("activity", "Wildlands", voter)}
                                className="text-white/70 hover:text-white ml-1 text-xs"
                                title="Afmelden"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {showPollNameInput === "activity-Wildlands" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pollNameInput}
                            onChange={(e) => setPollNameInput(e.target.value)}
                            placeholder="Je naam..."
                            className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("activity", "Wildlands")}
                            autoFocus
                          />
                          <button
                            onClick={() => handlePollNameSubmit("activity", "Wildlands")}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-2 text-sm rounded hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                          >
                            Stemmen
                          </button>
                          <button
                            onClick={() => setShowPollNameInput(null)}
                            className="bg-white/20 text-white px-3 py-2 text-sm rounded hover:bg-white/30 transition-all duration-300"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePollVote("activity", "Wildlands")}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 text-sm rounded hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
                        >
                          Stem voor Wildlands
                        </button>
                      )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">Klimpark 'Joytime' Grolloo</h4>
                          <p className="text-white/80 mb-2">
                            Voor degenen die (net als Charlotte) geen hoogtevrees hebben. Een uitdagend klim- en
                            klauterparadijs in de bossen.
                          </p>
                          <p className="text-sm text-purple-300 mb-2">
                            <strong>Afstand:</strong> ca. 20 min rijden
                          </p>
                          <a
                            href="https://www.joytime.nl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            🔗 www.joytime.nl
                          </a>
                        </div>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-4">
                          {polls.activity["Klimpark Joytime"]?.count || 0}
                        </span>
                      </div>

                      {polls.activity["Klimpark Joytime"]?.voters &&
                        polls.activity["Klimpark Joytime"].voters.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {polls.activity["Klimpark Joytime"].voters.map((voter, index) => (
                              <span
                                key={index}
                                className="bg-white/20 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                {voter}
                                <button
                                  onClick={() => handlePollUnsubscribe("activity", "Klimpark Joytime", voter)}
                                  className="text-white/70 hover:text-white ml-1 text-xs"
                                  title="Afmelden"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                      {showPollNameInput === "activity-Klimpark Joytime" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pollNameInput}
                            onChange={(e) => setPollNameInput(e.target.value)}
                            placeholder="Je naam..."
                            className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handlePollNameSubmit("activity", "Klimpark Joytime")
                            }
                            autoFocus
                          />
                          <button
                            onClick={() => handlePollNameSubmit("activity", "Klimpark Joytime")}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-2 text-sm rounded hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                          >
                            Stemmen
                          </button>
                          <button
                            onClick={() => setShowPollNameInput(null)}
                            className="bg-white/20 text-white px-3 py-2 text-sm rounded hover:bg-white/30 transition-all duration-300"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePollVote("activity", "Klimpark Joytime")}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 text-sm rounded hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
                        >
                          Stem voor Klimpark
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Op het Park */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold text-white flex items-center gap-3">🧖‍♀️ Gewoon op het Park</h3>
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {polls.activity["Gewoon chillen"]?.count || 0}
                    </span>
                  </div>

                  {polls.activity["Gewoon chillen"]?.voters && polls.activity["Gewoon chillen"].voters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {polls.activity["Gewoon chillen"].voters.map((voter, index) => (
                        <span
                          key={index}
                          className="bg-white/20 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {voter}
                          <button
                            onClick={() => handlePollUnsubscribe("activity", "Gewoon chillen", voter)}
                            className="text-white/70 hover:text-white ml-1 text-xs"
                            title="Afmelden"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-1">Wellness & Ontspanning</h4>
                      <p className="text-white/80">
                        Vergeet niet dat we in wellness-huisjes zitten! Volop gebruikmaken van de sauna is natuurlijk
                        ook een topactiviteit.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-1">Zwemmen</h4>
                      <p className="text-white/80">Een duik in het overdekte zwembad op het park.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-1">Spelen</h4>
                      <p className="text-white/80">Minigolf, de speeltuin, of gewoon een potje voetbal op het gras.</p>
                    </div>
                  </div>

                  {showPollNameInput === "activity-Gewoon chillen" ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pollNameInput}
                        onChange={(e) => setPollNameInput(e.target.value)}
                        placeholder="Je naam..."
                        className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("activity", "Gewoon chillen")}
                        autoFocus
                      />
                      <button
                        onClick={() => handlePollNameSubmit("activity", "Gewoon chillen")}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-2 text-sm rounded hover:from-blue-600 hover:to-cyan-700 transition-all duration-300"
                      >
                        Stemmen
                      </button>
                      <button
                        onClick={() => setShowPollNameInput(null)}
                        className="bg-white/20 text-white px-3 py-2 text-sm rounded hover:bg-white/30 transition-all duration-300"
                      >
                        Annuleren
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePollVote("activity", "Gewoon chillen")}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 text-sm rounded hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium"
                    >
                      Stem voor Gewoon Chillen
                    </button>
                  )}
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center text-white/80 mt-12 text-lg font-medium"
              >
                We kunnen ter plekke kijken waar we zin in hebben. Geen verplichtingen, alles mag. ✨
              </motion.p>
            </div>
          </motion.div>
        )}

        {activeTab === "polls" && (
          <motion.div
            key="polls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-20 md:pt-24 pb-20 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white text-center mb-12"
              >
                Polls
              </motion.h2>

              <div className="space-y-12">
                {/* BBQ Poll */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                >
                  <h3 className="text-3xl font-bold text-white mb-6">🔥 Wie neemt de elektrische BBQ mee?</h3>
                  <div className="space-y-4">
                    {Object.entries(polls.bbq).map(([option, data]) => (
                      <div key={option} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white font-semibold text-lg">{option}</span>
                          <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold">
                            {data.count}
                          </span>
                        </div>

                        {data.voters && data.voters.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {data.voters.map((voter, index) => (
                              <span
                                key={index}
                                className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                              >
                                {voter}
                                <button
                                  onClick={() => handlePollUnsubscribe("bbq", option, voter)}
                                  className="text-white/70 hover:text-white ml-1 text-xs"
                                  title="Afmelden"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {showPollNameInput === `bbq-${option}` ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={pollNameInput}
                              onChange={(e) => setPollNameInput(e.target.value)}
                              placeholder="Je naam..."
                              className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("bbq", option)}
                              autoFocus
                            />
                            <button
                              onClick={() => handlePollNameSubmit("bbq", option)}
                              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                            >
                              Stemmen
                            </button>
                            <button
                              onClick={() => setShowPollNameInput(null)}
                              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300"
                            >
                              Annuleren
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePollVote("bbq", option)}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-medium"
                          >
                            Stem op deze optie
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={triggerCelebration}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 z-40 safe-bottom"
      >
        <PartyPopper className="w-5 h-5 md:w-6 md:h-6" />
      </motion.button>

      {/* Footer */}
      <footer className="bg-green-800/50 backdrop-blur-lg text-white py-12 px-4 text-center border-t border-white/20">
        <p className="text-2xl font-semibold mb-2">Tot in Exloo!</p>
        <p className="text-green-100 text-lg">Met liefs, de familie</p>
      </footer>
    </div>
  )
}
