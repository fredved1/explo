"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, Utensils, Home, ChevronDown, TreePine, Camera, Menu, X } from "lucide-react"
import confetti from "canvas-confetti"

export default function LandalFamilieweekendApp() {
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
      "Museumdorp Orvelte": { count: 0, voters: [] },
      "De Hondsrug": { count: 0, voters: [] },
    },
  })
  const [nameInput, setNameInput] = useState("")
  const [showNameInput, setShowNameInput] = useState<string | null>(null)
  const [pollNameInput, setPollNameInput] = useState("")
  const [showPollNameInput, setShowPollNameInput] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const familyImages = [
    "/placeholder.svg?height=600&width=400",
    "/placeholder.svg?height=600&width=400",
    "/placeholder.svg?height=600&width=400",
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
    const saved = localStorage.getItem("familieweekend-data")
    if (saved) {
      const data = JSON.parse(saved)

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
            // Validate data integrity: count should match voters length
            const voters = Array.isArray(value.voters) ? value.voters : []
            const validCount = Math.max(0, voters.length) // Use voter count as source of truth
            migratedPolls[pollId][option] = { count: validCount, voters }
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
                "Museumdorp Orvelte": { count: 0, voters: [] },
                "De Hondsrug": { count: 0, voters: [] },
              },
            },
      )
    }
  }, [])

  const saveData = (
    teams: Record<string, string[]>,
    pollData: Record<string, Record<string, { count: number; voters: string[] }>>,
  ) => {
    localStorage.setItem("familieweekend-data", JSON.stringify({ teams, polls: pollData }))
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
      colors: ["#00573c", "#4a8c7a", "#f5a623"],
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
      colors: ["#00573c", "#4a8c7a", "#f5a623"],
    })
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetAllData = () => {
    localStorage.removeItem("familieweekend-data")
    setSelectedTeams({})
    setPolls({
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
        "Museumdorp Orvelte": { count: 0, voters: [] },
        "De Hondsrug": { count: 0, voters: [] },
      },
    })
  }

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "verhaal", label: "Verhaal", icon: Users },
    { id: "details", label: "Info", icon: Calendar },
    { id: "teams", label: "Teams", icon: Utensils },
    { id: "activiteiten", label: "Activiteiten", icon: TreePine },
    { id: "memories", label: "Foto's", icon: Camera },
  ]

  return (
    <div className="min-h-screen bg-landal-light">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 landal-gradient text-white shadow-md">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <img src="/placeholder.svg?height=40&width=40" alt="Landal Logo" className="w-8 h-8 mr-2" />
            <h1 className="text-lg font-semibold">Familieweekend Exloo</h1>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-landal-light-green">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-landal-green border-t border-landal-light-green"
          >
            <div className="py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center w-full px-6 py-3 ${
                    activeTab === tab.id ? "bg-landal-light-green" : "hover:bg-landal-light-green/30"
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      <main className="pt-16 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Hero Section */}
              <section className="relative h-[50vh] overflow-hidden">
                <div className="absolute inset-0">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${familyImages[currentImageIndex]})` }}
                  />
                  <div className="absolute inset-0 hero-overlay" />
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-4">
                  <h1 className="text-3xl font-bold mb-2">Familieweekend</h1>
                  <h2 className="text-2xl font-semibold mb-1">Exloo 2025</h2>
                  <p className="text-lg font-light">Veddertjes & Antonisse</p>
                  <p className="text-sm mt-1 opacity-90">20-23 Juni 2025</p>
                </div>
              </section>

              {/* Countdown */}
              <section className="px-4 -mt-6 relative z-20">
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-lg font-semibold text-landal-green mb-4 text-center">Nog even geduld...</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center countdown-item p-3">
                        <div className="text-xl font-bold text-landal-green mb-1">{value}</div>
                        <div className="text-landal-gray text-xs capitalize">{unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Quick Links */}
              <section className="px-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTabChange("details")}
                    className="landal-card p-4 flex flex-col items-center justify-center text-center h-32"
                  >
                    <Calendar className="w-8 h-8 text-landal-green mb-2" />
                    <span className="text-landal-green font-medium">Praktische Info</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("teams")}
                    className="landal-card p-4 flex flex-col items-center justify-center text-center h-32"
                  >
                    <Utensils className="w-8 h-8 text-landal-green mb-2" />
                    <span className="text-landal-green font-medium">Teams & Taken</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("activiteiten")}
                    className="landal-card p-4 flex flex-col items-center justify-center text-center h-32"
                  >
                    <TreePine className="w-8 h-8 text-landal-green mb-2" />
                    <span className="text-landal-green font-medium">Activiteiten</span>
                  </button>
                  <button
                    onClick={() => handleTabChange("verhaal")}
                    className="landal-card p-4 flex flex-col items-center justify-center text-center h-32"
                  >
                    <Users className="w-8 h-8 text-landal-green mb-2" />
                    <span className="text-landal-green font-medium">Ons Verhaal</span>
                  </button>
                </div>
              </section>

              {/* Call to action */}
              <section className="px-4 mt-8 mb-6">
                <button
                  onClick={triggerCelebration}
                  className="landal-button w-full py-4 flex items-center justify-center"
                >
                  <span>Het is bijna zover! 🌳</span>
                </button>
              </section>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                className="flex justify-center mt-4"
              >
                <ChevronDown className="w-6 h-6 text-landal-gray" />
              </motion.div>
            </motion.div>
          )}

          {activeTab === "verhaal" && (
            <motion.div
              key="verhaal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4"
            >
              <div className="landal-card p-6 shadow-card">
                <h2 className="text-2xl font-bold text-landal-green text-center mb-6">HET IS BIJNA ZOVER! 🌳</h2>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p className="font-medium text-landal-green">Lieve Veddertjes & Antonisses,</p>

                  <p>
                    Deze groepsapp, onze digitale huiskamer sinds Loes in 2015 op 'maak groep' drukte, is een
                    tijdcapsule. Het is het levende bewijs van ons allemaal: een kroniek van bijna tien jaar lief en
                    leed, verpakt in duizenden appjes.
                  </p>

                  <p>
                    Het is de plek waar we huizen zagen veranderen in droomhuizen (hallo, Ibiza-tuin van Thijs & Daph!),
                    en waar Charlotte & Daan hun roots herontdekten met een terugkeer naar Hengelo. We zagen carrières
                    een vlucht nemen: Gideon als agent in Twente, Daph als kersverse jurist die IKEA verliet.
                  </p>

                  <p>
                    We hebben de wereld rondgereisd: van wintersport in Oostenrijk en onze gezamenlijke avonturen in Sri
                    Lanka tot de onvergetelijke familietrip naar Rhodos – waar Isabelle, onze wereldreiziger, dacht dat
                    we op Samos zaten en Rick naadloos in de chaos werd opgenomen.
                  </p>

                  <p>
                    We zagen de volgende generatie arriveren: Thirza & Daantje die opgroeien van dreumes tot stoere
                    kids, en de komst van onze nieuwste neefjes, de lieve Philippe en de kersverse Freddie Lewis.
                  </p>

                  <p className="font-semibold text-landal-green">
                    En nu, lieve allemaal, voegen we een nieuw, belangrijk hoofdstuk toe aan dit verhaal. Een weekend
                    speciaal voor jou, Peter. Om te proosten op een leven vol toewijding in je praktijk en op het
                    prachtige nieuwe hoofdstuk dat voor je ligt.
                  </p>

                  <p className="text-lg font-bold text-center mt-6 text-landal-green">
                    Tijd om de telefoons even weg te leggen en live herinneringen te maken.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-2xl font-bold text-landal-green text-center mb-6">Praktische Info</h2>

              {/* Quick Overview */}
              <div className="landal-card p-6 shadow-card mb-6">
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">📅 Weekend Overzicht</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-landal-light rounded-lg p-3 border border-landal-border text-center">
                    <div className="text-xl font-bold text-landal-green mb-1">4</div>
                    <div className="text-landal-gray text-sm">Dagen</div>
                  </div>
                  <div className="bg-landal-light rounded-lg p-3 border border-landal-border text-center">
                    <div className="text-xl font-bold text-landal-green mb-1">16</div>
                    <div className="text-landal-gray text-sm">Familie leden</div>
                  </div>
                  <div className="bg-landal-light rounded-lg p-3 border border-landal-border text-center">
                    <div className="text-xl font-bold text-landal-green mb-1">2</div>
                    <div className="text-landal-gray text-sm">Wellness huisjes</div>
                  </div>
                  <div className="bg-landal-light rounded-lg p-3 border border-landal-border text-center">
                    <div className="text-xl font-bold text-landal-green mb-1">∞</div>
                    <div className="text-landal-gray text-sm">Herinneringen</div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="landal-card p-6 shadow-card mb-6">
                <div className="w-12 h-12 bg-landal-light rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">Locatie</h3>
                <div className="space-y-2 text-center">
                  <p className="text-gray-800 text-lg font-semibold">Landal PUUR Exloo</p>
                  <p className="text-landal-gray">Zuiderdiep 104</p>
                  <p className="text-landal-gray">9571 BE Tweede Exloermond</p>
                  <p className="text-landal-light-green text-sm mt-2">Luxe villa's met eigen Finse sauna</p>
                  <a
                    href="https://maps.google.com/?q=Landal+PUUR+Exloo,+Zuiderdiep+104,+9571+BE+Tweede+Exloermond"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landal-button inline-block mt-4 text-sm"
                  >
                    📍 Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Planning */}
              <div className="landal-card p-6 shadow-card mb-6">
                <div className="w-12 h-12 bg-landal-light rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-6 h-6 text-landal-green" />
                </div>
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">🕐 Planning</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-landal-border pb-2">
                    <span className="text-landal-gray">Aankomst</span>
                    <span className="text-gray-800 font-semibold">Vrij 20 juni, 16:00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-landal-border pb-2">
                    <span className="text-landal-gray">Vertrek</span>
                    <span className="text-gray-800 font-semibold">Maa 23 juni, 10:30</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-landal-border pb-2">
                    <span className="text-landal-gray">Check-in</span>
                    <span className="text-gray-800 font-semibold">Vanaf 16:00</span>
                  </div>
                  <div className="bg-landal-light rounded-lg p-3 mt-4">
                    <p className="text-gray-800 text-sm">
                      💡 <strong>Tip:</strong> Parkeren gratis op centrale parkeerplaats
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "teams" && (
            <motion.div
              key="teams"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-2xl font-bold text-landal-green text-center mb-6">Operatie Culinair Commando</h2>

              <p className="text-landal-gray text-center mb-6">Klik op een team om je aan te melden met je naam!</p>

              <div className="space-y-4">
                {[
                  {
                    id: "breakfast",
                    name: "Team Ochtendgloren",
                    icon: "☀️",
                    desc: "Ontbijt & Lunch",
                    details:
                      "De helden die zorgen voor brood, croissants, beleg (zoet & hartig), eieren, yoghurt en sapjes voor de zaterdag en zondag.",
                  },
                  {
                    id: "friday",
                    name: "Team Vrijdagavond",
                    icon: "✨",
                    desc: "Diner Dag 1",
                    details:
                      "Neemt de leiding voor het diner op de aankomstdag. Iets makkelijks en gezelligs om het weekend mee in te luiden?",
                  },
                  {
                    id: "saturday",
                    name: "Team Zaterdagavond",
                    icon: "🍽️",
                    desc: "Het Hoofdgerecht!",
                    details: "Pakt uit met het hoofdgerecht van het weekend. De culinaire climax!",
                  },
                  {
                    id: "drinks",
                    name: "Team Vloeibare Vreugde & Snacks",
                    icon: "🥂",
                    desc: "Drank & Borrelhappen",
                    details:
                      "De onmisbare curatoren van de goede sfeer. Zij regelen de strategische voorraad wijn, bier, fris, chips en borrelhappen voor het hele weekend.",
                  },
                ].map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="landal-card p-5 shadow-card"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-landal-light flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{team.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-landal-green mb-1 leading-tight">{team.name}</h4>
                        <p className="text-sm text-gray-700 mb-4">{team.details}</p>

                        {selectedTeams[team.id] &&
                          Array.isArray(selectedTeams[team.id]) &&
                          selectedTeams[team.id].length > 0 && (
                            <div className="mb-4">
                              <p className="font-semibold text-landal-green mb-2">Aangemeld:</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedTeams[team.id].map((name, index) => (
                                  <span
                                    key={index}
                                    className="bg-landal-light text-landal-green px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                                  >
                                    {name}
                                    <button
                                      onClick={() => handleTeamUnsubscribe(team.id, name)}
                                      className="text-landal-gray hover:text-landal-green ml-1 text-xs"
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
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder="Je naam..."
                              className="w-full px-4 py-3 bg-landal-light border border-landal-border rounded-lg text-gray-800 placeholder-landal-gray focus:ring-2 focus:ring-landal-green focus:border-transparent"
                              onKeyPress={(e) => e.key === "Enter" && handleNameSubmit(team.id)}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleNameSubmit(team.id)} className="landal-button flex-1">
                                Aanmelden
                              </button>
                              <button onClick={() => setShowNameInput(null)} className="landal-button-secondary flex-1">
                                Annuleren
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => handleTeamSelect(team.id)} className="landal-button w-full">
                            Aanmelden voor {team.name}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-landal-light rounded-lg p-5 border border-landal-border">
                <p className="text-gray-800">
                  <strong>Voor zondagavond</strong> doen we lekker makkelijk. Voor degenen die blijven, kunnen we
                  creatief zijn met de restjes óf gezamenlijk een (pannenkoeken)restaurant in de buurt opzoeken om het
                  weekend in stijl af te sluiten. Geen stress!
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "memories" && (
            <motion.div
              key="memories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-2xl font-bold text-landal-green text-center mb-6">📸 Onze Herinneringen</h2>

              <div className="landal-card p-6 shadow-card">
                <h3 className="text-xl font-bold text-landal-green mb-6 flex items-center justify-center gap-2">
                  <Camera className="w-6 h-6" />
                  Onze Mooie Herinneringen
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Placeholder memory cards */}
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-landal-light rounded-lg overflow-hidden border border-landal-border">
                      <div className="aspect-square bg-gray-200 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-landal-gray" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-landal-green text-sm mb-1">Familieherinnering {i}</h4>
                        <p className="text-xs text-landal-gray">Binnenkort gevuld met mooie momenten.</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-landal-gray text-sm mt-6">
                  Van kerstdiners tot zomervakanties - elke foto vertelt ons verhaal 💕
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "activiteiten" && (
            <motion.div
              key="activiteiten"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-2xl font-bold text-landal-green text-center mb-6">🎯 Activiteiten in de Omgeving</h2>

              <p className="text-landal-gray text-center mb-6">
                Naast alle gezelligheid in de huisjes, is er in de Drentse omgeving genoeg te ontdekken:
              </p>

              <div className="space-y-6">
                {/* Natuurliefhebbers */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4 flex items-center gap-2">
                    <TreePine className="w-5 h-5 flex-shrink-0" />
                    <span>Voor de Natuurliefhebbers</span>
                  </h3>

                  <div className="space-y-4">
                    {/* Activity cards with Landal styling */}
                    {[
                      {
                        name: "De Hondsrug",
                        description:
                          "We zitten midden in het UNESCO Geopark de Hondsrug. Direct vanuit het park starten prachtige wandel- en fietsroutes door bos en over heide.",
                        distance: "Direct om de hoek",
                      },
                      {
                        name: "Boomkroonpad",
                        description: "Een unieke wandeling door de toppen van de bomen. Een avontuur voor jong en oud!",
                        distance: "ca. 20 min rijden",
                        link: "https://www.staatsbosbeheer.nl/boomkroonpad",
                      },
                    ].map((activity) => (
                      <div key={activity.name} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <div className="flex flex-col mb-3 gap-2">
                          <div>
                            <h4 className="text-base font-semibold text-landal-green mb-2">{activity.name}</h4>
                            <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                            <p className="text-xs text-landal-gray">
                              <strong>Afstand:</strong> {activity.distance}
                            </p>
                            {activity.link && (
                              <a
                                href={activity.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-landal-light-green hover:text-landal-green underline text-xs break-all mt-1 block"
                              >
                                🔗 {activity.link.replace("https://", "")}
                              </a>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="bg-landal-green text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {polls.activity[activity.name]?.count || 0} stemmen
                            </span>

                            {showPollNameInput === `activity-${activity.name}` ? (
                              <button onClick={() => setShowPollNameInput(null)} className="text-landal-gray text-sm">
                                Annuleren
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePollVote("activity", activity.name)}
                                className="text-landal-green font-medium text-sm"
                              >
                                Stem
                              </button>
                            )}
                          </div>
                        </div>

                        {polls.activity[activity.name]?.voters && polls.activity[activity.name].voters.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {polls.activity[activity.name].voters.map((voter, index) => (
                              <span
                                key={index}
                                className="bg-white text-landal-green px-2 py-1 rounded text-xs flex items-center gap-1 border border-landal-border"
                              >
                                {voter}
                                <button
                                  onClick={() => handlePollUnsubscribe("activity", activity.name, voter)}
                                  className="text-landal-gray hover:text-landal-green ml-1 text-xs"
                                  title="Afmelden"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {showPollNameInput === `activity-${activity.name}` && (
                          <div className="flex flex-col gap-2 mt-3">
                            <input
                              type="text"
                              value={pollNameInput}
                              onChange={(e) => setPollNameInput(e.target.value)}
                              placeholder="Je naam..."
                              className="w-full px-3 py-2 text-sm bg-white border border-landal-border rounded-lg text-gray-800 placeholder-landal-gray focus:ring-2 focus:ring-landal-green focus:border-transparent"
                              onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("activity", activity.name)}
                              autoFocus
                            />
                            <button
                              onClick={() => handlePollNameSubmit("activity", activity.name)}
                              className="landal-button text-sm py-2"
                            >
                              Stem voor {activity.name}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-landal-gray mt-6 text-sm">
                  We kunnen ter plekke kijken waar we zin in hebben. Geen verplichtingen, alles mag. ✨
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-landal-border bottom-nav z-50">
        <div className="flex justify-around">
          {tabs.slice(0, 5).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-1 ${
                activeTab === tab.id ? "text-landal-green" : "text-landal-gray"
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Hidden Admin Reset Button */}
      <div className="fixed bottom-24 right-4 opacity-30">
        <button
          onClick={resetAllData}
          className="bg-landal-light text-landal-gray p-2 rounded-full text-xs"
          title="Reset alle data (alleen voor admin)"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
