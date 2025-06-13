"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, Utensils, Home, ChevronDown, TreePine, Camera, Menu, X, MapPin, Coffee, Sparkles, PartyPopper } from "lucide-react"
import confetti from "canvas-confetti"
import { fetchData, saveData as saveDataToKV } from "@/lib/api"

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
    "/family-photo.jpg",
    "/family-photo.jpg",
    "/family-photo.jpg",
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
    
    // Refresh data every 30 seconds to see updates from other users (reduced frequency to prevent data loss)
    const interval = setInterval(loadData, 30000)
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

  const handleNameSubmit = async (team: string) => {
    if (!nameInput.trim()) return

    const newTeams = {
      ...selectedTeams,
      [team]: [...(selectedTeams[team] || []), nameInput.trim()],
    }
    setSelectedTeams(newTeams)
    
    // Save immediately and wait for completion
    await saveData(newTeams, polls)
    
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

  const handlePollNameSubmit = async (pollId: string, option: string) => {
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
    
    // Save immediately and wait for completion
    await saveData(selectedTeams, newPolls)
    
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
    { id: "home", label: "Home", icon: Sparkles },
    { id: "verhaal", label: "Ons Verhaal", icon: Users },
    { id: "details", label: "Details", icon: Calendar },
    { id: "teams", label: "Teams", icon: Utensils },
    { id: "activiteiten", label: "Activiteiten", icon: TreePine },
    { id: "polls", label: "Polls", icon: PartyPopper },
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
                    Als je door de duizenden berichten, foto's en stickers van onze familie-app scrollt, scroll je eigenlijk 
                    door de afgelopen tien jaar van ons leven. Het begon in 2015, een simpel digitaal groepje. Nu is het een 
                    archief van ons leven samen; een digitaal kampvuur waar we alles delen, van het alledaagse tot de momenten 
                    die een leven tekenen.
                  </p>

                  <p>
                    Het is een tijdlijn van groei. We zagen Thirza en Daantje veranderen van kleine dreumesen in stoere kids 
                    die ons van de skipistes af blazen. We zagen onze kring groter worden met de komst van Rick, die 
                    moeiteloos werd opgenomen in onze gezellige chaos. We zagen hoe iedereen zijn eigen pad vond: Gideon 
                    die de wet ging handhaven (en ons uitnodigde voor padeltoernooien met 'meesterlijke balletjes'), 
                    Charlotte die besloot dat skydiven nog niet eng genoeg was en de boksring in stapte, en Daph die de 
                    IKEA-gehaktballetjes vaarwel zei om jurist te worden. We zagen Jassie uitgroeien tot onze creatieve 
                    duizendpoot, altijd met een camera in de hand of een briljant idee voor een dobbelspel.
                  </p>

                  <p>
                    We hebben huizen gekocht, verbouwd en weer verkocht. Van de klusprojecten van Thijs en Daph tot het 
                    prachtige nieuwe thuis van Loes en Gideon, en de grote terugkeer van de familie Eenkhoorn naar het 
                    oude, vertrouwde Hengelo. Onze app werd een stroom van Funda-links, verhuisupdates en interieurtips. 
                    En tussendoor creëerde 'Fred Vedd' de soundtrack van ons leven, met onvergetelijke hits over halve 
                    marathons en de rivaliteit tussen Daan en Gideon.
                  </p>

                  <p>
                    Onze avonturen reikten verder dan Hengelo en Amsterdam. We creëerden herinneringen onder de Griekse 
                    zon op Rhodos (of was het Samos, Bellie?), waar we zagen hoe Peter, een God op ski's, ook een God op 
                    het strand kan zijn. We zagen Isabelle de wereld over reizen, van de bergen in Nepal tot de outback 
                    van Australië, maar altijd weer terugkeren voor een borrel, een feestje of een rondje op de 
                    Amsterdamse grachten.
                  </p>

                  <p>
                    En dan de liefde. Die groeide en bloeide. We zagen hoe Loes en Gideon hun lieve Philippe verwelkomden, 
                    en recenter mochten we Freddie Lewis in onze armen sluiten. Momenten van puur geluk. Maar de app 
                    was er ook in tijden van spanning en onzekerheid. Juist op die momenten, zoals de afgelopen tijd 
                    rondom de gezondheid van Peter, zagen we wat deze groep echt betekent: een onvoorwaardelijke muur 
                    van steun, liefde en saamhorigheid, met Heleen als het warme, zorgzame hart van de familie.
                  </p>

                  <p>
                    En nu staan we aan de vooravond van een nieuw hoofdstuk. Niet alleen voor ons als familie, maar 
                    speciaal voor één iemand: Peter. Onze eigen reisleider, de man van de gedetailleerde planningen, 
                    de rots in de branding en de stille kracht die altijd voor iedereen klaarstaat.
                  </p>

                  <p className="font-semibold text-landal-green">
                    Dit weekend in Exloo is meer dan zomaar een uitje. Het is ons gezamenlijke 'dankjewel'. Een cadeau 
                    om te proosten op alles wat achter hem ligt: een indrukwekkende carrière, een leven vol toewijding. 
                    En nog belangrijker, om te proosten op alles wat vóór hem ligt: een nieuw begin, vol vrijheid, reizen, 
                    en hopelijk heel veel tijd met zijn (schoon)kinderen en kleinkinderen.
                  </p>

                  <p>
                    Laten we dit weekend die digitale wereld even voor wat het is. Laten we nieuwe herinneringen maken, 
                    lachen om de oude verhalen, en proosten op de man die dit allemaal mede mogelijk heeft gemaakt.
                  </p>

                  <p className="text-lg font-bold text-center mt-6 text-landal-green">
                    Op naar Exloo. Op de familie. En bovenal, op jou, Peter.
                  </p>

                  <p className="text-center text-landal-light-green font-medium">
                    We hebben er zin in!
                  </p>

                  <p className="text-right text-landal-gray text-sm mt-4">
                    Liefs,<br />
                    De Veddertjes & Antonisses
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

              {/* Location */}
              <div className="landal-card p-6 shadow-card mb-6">
                <div className="w-12 h-12 bg-landal-light rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="w-6 h-6 text-landal-green" />
                </div>
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">📍 Locatie & Aankomst</h3>
                <div className="space-y-3 text-center">
                  <p className="text-gray-800 text-lg font-semibold">Landal PUUR Exloo</p>
                  <p className="text-landal-gray">Zuiderdiep 104, 9571 BE Tweede Exloermond</p>
                  <p className="text-landal-light-green text-sm">Luxe wellness villa's met eigen Finse sauna</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center border-b border-landal-border pb-2">
                      <span className="text-landal-gray">Aankomst</span>
                      <span className="text-gray-800 font-semibold">Vrij 20 juni, 16:00</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-landal-border pb-2">
                      <span className="text-landal-gray">Vertrek</span>
                      <span className="text-gray-800 font-semibold">Maa 23 juni, 10:30</span>
                    </div>
                  </div>

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

              {/* Travel Times */}
              <div className="landal-card p-6 shadow-card mb-6">
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">🚗 Reistijden naar Exloo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-landal-light rounded-lg p-3">
                    <span className="text-gray-800 font-medium">Vanuit Hengelo</span>
                    <span className="text-landal-green font-semibold">50 min (70 km)</span>
                  </div>
                  <div className="flex justify-between items-center bg-landal-light rounded-lg p-3">
                    <span className="text-gray-800 font-medium">Vanuit Apeldoorn</span>
                    <span className="text-landal-green font-semibold">1u 15m (90 km)</span>
                  </div>
                  <div className="flex justify-between items-center bg-landal-light rounded-lg p-3">
                    <span className="text-gray-800 font-medium">Vanuit Amsterdam</span>
                    <span className="text-landal-green font-semibold">1u 45m (165 km)</span>
                  </div>
                </div>
              </div>

              {/* Weather */}
              <div className="landal-card p-6 shadow-card mb-6">
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">🌤️ Weersvoorspelling</h3>
                <div className="text-center">
                  <p className="text-landal-gray mb-4">Live weersvoorspelling voor Exloo</p>
                  
                  {/* Live Weather Widget */}
                  <div className="bg-white rounded-lg border border-landal-border overflow-hidden mb-4">
                    <iframe
                      src="https://gadgets.buienradar.nl/gadget/zoommap/?lat=52.8667&lon=6.9167&overname=2&zoom=8&naam=Exloo&size=2b&voor=0"
                      width="100%"
                      height="256"
                      frameBorder="0"
                      scrolling="no"
                      className="w-full"
                      title="Live Buienradar Exloo"
                    ></iframe>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href="https://www.buienradar.nl/weer/exloo/nl/2758019"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="landal-button text-sm"
                    >
                      🌦️ Uitgebreide voorspelling
                    </a>
                    <a
                      href="https://www.buienradar.nl/nederland/neerslag"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="landal-button-secondary text-sm"
                    >
                      ⚡ Live neerslag radar
                    </a>
                  </div>
                </div>
              </div>

              {/* House Facilities */}
              <div className="landal-card p-6 shadow-card mb-6">
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">🏠 Wat is er in de huisjes?</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">🛁 Wellness</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Privé Finse sauna</li>
                        <li>• 3 badkamers met regendouches</li>
                        <li>• Bubbelbad & sunshower</li>
                        <li>• Gratis zwembad toegang</li>
                      </ul>
                    </div>
                    
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">🍳 Keuken</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Volledig uitgeruste keuken</li>
                        <li>• Vaatwasser & combi-magnetron</li>
                        <li>• Quooker (kokend water)</li>
                        <li>• Nespresso koffieapparaat</li>
                      </ul>
                    </div>
                    
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">🛏️ Slapen</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 4 slaapkamers per villa</li>
                        <li>• Bedden opgemaakt bij aankomst</li>
                        <li>• Handdoeken aanwezig</li>
                        <li>• 2 wellness villa's voor 16 personen</li>
                      </ul>
                    </div>
                    
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">🏡 Comfort</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Ruime woonkamer met TV</li>
                        <li>• Terras met tuinmeubilair</li>
                        <li>• 2 verdiepingen</li>
                        <li>• Gratis WiFi & parkeren</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* House Distribution */}
              <div className="landal-card p-6 shadow-card mb-6">
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">🏠 Huisjesverdeling</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Babybubble Huisje */}
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <div className="text-center mb-3">
                        <h4 className="text-lg font-bold text-landal-green">Huisje 349</h4>
                        <p className="text-sm text-landal-light-green font-medium">👶 De Babybubble</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-landal-border">
                          <span className="text-gray-800 text-sm">Peter & Heleen</span>
                          <span className="text-xs text-landal-gray">👥</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-landal-border">
                          <span className="text-gray-800 text-sm">Thomas & Jasmin</span>
                          <span className="text-xs text-landal-gray">👶 Freddy Lewis</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-landal-border">
                          <span className="text-gray-800 text-sm">Gideon & Loes</span>
                          <span className="text-xs text-landal-gray">👶 Philippe</span>
                        </div>
                      </div>
                    </div>

                    {/* Avonturiers Huisje */}
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <div className="text-center mb-3">
                        <h4 className="text-lg font-bold text-landal-green">Huisje 391</h4>
                        <p className="text-sm text-landal-light-green font-medium">🌟 De Avonturiers & Bouwers</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-landal-border">
                          <span className="text-gray-800 text-sm">Isabelle & Rick</span>
                          <span className="text-xs text-landal-gray">👥</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-landal-border">
                          <span className="text-gray-800 text-sm">Charlotte & Daan</span>
                          <span className="text-xs text-landal-gray">👧 Thirza & 👦 Daantje</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-landal-border">
                          <span className="text-gray-800 text-sm">Thijs & Daphne</span>
                          <span className="text-xs text-landal-gray">👥</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-landal-light rounded-lg p-3 border border-landal-border text-center">
                    <p className="text-gray-700 text-sm">
                      <strong>💡 Handig:</strong> Beide huisjes liggen dicht bij elkaar op het park en hebben dezelfde luxe faciliteiten!
                    </p>
                  </div>
                </div>
              </div>

              {/* Packing List */}
              <div className="landal-card p-6 shadow-card mb-6">
                <h3 className="text-xl font-bold text-landal-green text-center mb-4">🎒 Paklijst - Wat meenemen?</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">👕 Kleding</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Zwemkleding voor zwembad/sauna</li>
                        <li>• Comfortabele kleding</li>
                        <li>• Regenjack (voor zekerheid)</li>
                        <li>• Slippers voor sauna</li>
                      </ul>
                    </div>
                    
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">🎮 Ontspanning</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Spelletjes voor gezellige avonden</li>
                        <li>• Camera voor mooie herinneringen</li>
                        <li>• Sportkleding voor activiteiten</li>
                        <li>• Goede schoenen voor wandelen</li>
                      </ul>
                    </div>
                    
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">💊 Persoonlijk</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Medicijnen & EHBO</li>
                        <li>• Toiletspullen & tandenborstel</li>
                        <li>• Zonnebrandcrème</li>
                        <li>• Opladers voor apparaten</li>
                      </ul>
                    </div>
                    
                    <div className="bg-landal-light rounded-lg p-4 border border-landal-border">
                      <h4 className="font-semibold text-landal-green mb-2">✅ Handig</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Lekker flesje wijn of biertjes</li>
                        <li>• Favoriete snacks</li>
                        <li>• Powerbank</li>
                        <li>• Goede stemming! 😄</li>
                      </ul>
                    </div>
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
                    id: "friday",
                    name: "Team Vrijdagavond",
                    icon: "🌅",
                    desc: "Vrijdag diner",
                    details: "Welkomstdiner voor de aankomstdag. Iets makkelijks en gezelligs!",
                  },
                  {
                    id: "breakfast",
                    name: "Team Ochtendgloren",
                    icon: "☀️",
                    desc: "Ontbijt (zat + zon)",
                    details: "Zorgt voor brood, croissants, beleg, eieren, yoghurt en sapjes voor zaterdag en zondag.",
                  },
                  {
                    id: "saturday",
                    name: "Team Zaterdagavond",
                    icon: "🍽️",
                    desc: "Zaterdag diner",
                    details: "Het hoofdgerecht van het weekend - de culinaire climax!",
                  },
                  {
                    id: "lunch",
                    name: "Team Zondaglunch",
                    icon: "🥪",
                    desc: "Lunch (zat + zon)",
                    details: "Verzorgt lekkere lunches voor zaterdag én zondag. Iets hartigs en voedzaams voor beide dagen.",
                  },
                  {
                    id: "drinks",
                    name: "Team Vloeibare Vreugde",
                    icon: "🥂",
                    desc: "Drank & Snacks",
                    details: "Wijn, bier, fris, chips en borrelhappen voor het hele weekend.",
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
                            Aanmelden
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

          {activeTab === "polls" && (
            <motion.div
              key="polls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-2xl font-bold text-landal-green text-center mb-6">Polls</h2>

              <div className="space-y-6">
                {/* BBQ Poll */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4">🔥 Wie neemt de elektrische BBQ mee?</h3>
                  <div className="space-y-4">
                    {Object.entries(polls.bbq).map(([option, data]) => (
                      <div key={option} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-800 font-semibold">{option}</span>
                          <span className="bg-landal-green text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {data.count}
                          </span>
                        </div>

                        {data.voters && data.voters.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {data.voters.map((voter, index) => (
                              <span
                                key={index}
                                className="bg-white text-landal-green px-2 py-1 rounded text-xs flex items-center gap-1 border border-landal-border"
                              >
                                {voter}
                                <button
                                  onClick={() => handlePollUnsubscribe("bbq", option, voter)}
                                  className="text-landal-gray hover:text-landal-green ml-1 text-xs"
                                  title="Afmelden"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {showPollNameInput === `bbq-${option}` ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={pollNameInput}
                              onChange={(e) => setPollNameInput(e.target.value)}
                              placeholder="Je naam..."
                              className="w-full px-3 py-2 bg-white border border-landal-border rounded-lg text-gray-800 placeholder-landal-gray focus:ring-2 focus:ring-landal-green focus:border-transparent"
                              onKeyPress={(e) => e.key === "Enter" && handlePollNameSubmit("bbq", option)}
                              autoFocus
                            />
                            <button
                              onClick={() => handlePollNameSubmit("bbq", option)}
                              className="landal-button text-sm py-2"
                            >
                              Stemmen
                            </button>
                            <button
                              onClick={() => setShowPollNameInput(null)}
                              className="landal-button-secondary text-sm py-2"
                            >
                              Annuleren
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePollVote("bbq", option)}
                            className="landal-button w-full text-sm py-2"
                          >
                            Stem op deze optie
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
              <h2 className="text-2xl font-bold text-landal-green text-center mb-6">🎯 Activiteiten & Uitjes</h2>

              <p className="text-landal-gray text-center mb-6">
                Van wellness op het park tot avonturen in de prachtige Drentse natuur:
              </p>

              <div className="space-y-6">
                {/* Op het Park */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏕️</span>
                    <span>Op Landal PUUR Exloo</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Wellness & Sauna",
                        description: "Ontspan in jullie privé Finse sauna of neem een duik in het verwarmde zwembad.",
                        distance: "In jullie huisje",
                        cost: "Gratis",
                      },
                      {
                        name: "Tennisbaan",
                        description: "Een potje tennis op de park tennisbaan. Rackets zijn te huur bij de receptie.",
                        distance: "Op het park",
                        cost: "€10 per uur",
                      },
                      {
                        name: "Minigolf",
                        description: "Leuke 18-holes minigolfbaan voor jong en oud. Perfecte familie activiteit!",
                        distance: "Op het park", 
                        cost: "€5 pp",
                      },
                      {
                        name: "Speeltuin & Sportveld",
                        description: "Grote speeltuin voor de kids en open veld voor voetbal, frisbee of andere spellen.",
                        distance: "Op het park",
                        cost: "Gratis",
                      },
                    ].map((activity) => (
                      <div key={activity.name} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <h4 className="text-base font-semibold text-landal-green mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex justify-between items-center text-xs text-landal-gray">
                          <span><strong>Locatie:</strong> {activity.distance}</span>
                          <span><strong>Kosten:</strong> {activity.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Natuur & Outdoor */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4 flex items-center gap-2">
                    <TreePine className="w-5 h-5 flex-shrink-0" />
                    <span>Natuur & Outdoor</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Boomkroonpad Drouwen",
                        description: "Unieke wandeling door de toppen van de bomen. 125m lang pad op 22m hoogte!",
                        distance: "20 min rijden",
                        cost: "€12,50 volw. / €8,50 kind",
                        link: "https://www.staatsbosbeheer.nl/boomkroonpad",
                      },
                      {
                        name: "De Hondsrug Wandeling",
                        description: "UNESCO Geopark wandelroutes direct vanuit het park. Prachtige natuur!",
                        distance: "Direct om de hoek",
                        cost: "Gratis",
                      },
                      {
                        name: "Kanoën op de Hunze",
                        description: "Ontdek Drenthe vanaf het water. Rustige tocht door natuurgebieden.",
                        distance: "15 min rijden",
                        cost: "€25 pp (3 uur)",
                        link: "https://www.kanoverhuurhunze.nl",
                      },
                      {
                        name: "Hunebed Wandelroute",
                        description: "Bezoek de mysterieuze hunebedden rondom Exloo. Fiets- en wandelroutes.",
                        distance: "5-15 min rijden",
                        cost: "Gratis",
                      },
                    ].map((activity) => (
                      <div key={activity.name} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <h4 className="text-base font-semibold text-landal-green mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex justify-between items-center text-xs text-landal-gray mb-2">
                          <span><strong>Afstand:</strong> {activity.distance}</span>
                          <span><strong>Kosten:</strong> {activity.cost}</span>
                        </div>
                        {activity.link && (
                          <a
                            href={activity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-landal-light-green hover:text-landal-green underline text-xs"
                          >
                            🔗 Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Familie Uitjes */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎠</span>
                    <span>Familie Uitjes</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        name: "WILDLANDS Adventure Zoo",
                        description: "Wereldreis door jungle, savanne en poolgebied. Een van de mooiste dierentuinen!",
                        distance: "20 min rijden naar Emmen",
                        cost: "€28 volw. / €25 kind",
                        link: "https://www.wildlands.nl",
                      },
                      {
                        name: "Klimpark Joytime",
                        description: "Uitdagend klim- en klauterparadijs in de bossen. Voor echte avonturiers!",
                        distance: "20 min rijden naar Grolloo",
                        cost: "€19 pp (3 uur)",
                        link: "https://www.joytime.nl",
                      },
                      {
                        name: "Attractiepark Slagharen",
                        description: "Thrill rides en family fun in Wild West sfeer. Perfect voor een dagje uit!",
                        distance: "45 min rijden",
                        cost: "€32 pp",
                        link: "https://www.slagharen.com",
                      },
                      {
                        name: "Speelstad Oranje",
                        description: "Indoor speelparadijs voor als het regent. Ook leuk voor volwassenen!",
                        distance: "15 min rijden naar Oranje",
                        cost: "€8,50 pp",
                      },
                    ].map((activity) => (
                      <div key={activity.name} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <h4 className="text-base font-semibold text-landal-green mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex justify-between items-center text-xs text-landal-gray mb-2">
                          <span><strong>Afstand:</strong> {activity.distance}</span>
                          <span><strong>Kosten:</strong> {activity.cost}</span>
                        </div>
                        {activity.link && (
                          <a
                            href={activity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-landal-light-green hover:text-landal-green underline text-xs"
                          >
                            🔗 Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultuur & Historie */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <span>Cultuur & Historie</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Hunebedcentrum Borger",
                        description: "Het grootste hunebed van Nederland + informatiecentrum. Duik in de prehistorie!",
                        distance: "10 min rijden",
                        cost: "€8 volw. / €6 kind",
                        link: "https://www.hunebedcentrum.nl",
                      },
                      {
                        name: "Museumdorp Orvelte",
                        description: "Levend musemdorp met ambachten en gezellige horeca. Terug in de tijd!",
                        distance: "25 min rijden",
                        cost: "€5 pp",
                        link: "https://www.orvelte.nl",
                      },
                      {
                        name: "Drents Museum Assen",
                        description: "Prachtige collecties over Drentse geschiedenis en wereldculturen.",
                        distance: "30 min rijden",
                        cost: "€15 pp",
                        link: "https://www.drentsmuseum.nl",
                      },
                      {
                        name: "Veenpark Barger-Compascuum",
                        description: "Ontdek het verhaal van de veenarbeiders. Historisch park met rondrit.",
                        distance: "35 min rijden",
                        cost: "€16 volw. / €12 kind",
                        link: "https://www.veenpark.nl",
                      },
                    ].map((activity) => (
                      <div key={activity.name} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <h4 className="text-base font-semibold text-landal-green mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex justify-between items-center text-xs text-landal-gray mb-2">
                          <span><strong>Afstand:</strong> {activity.distance}</span>
                          <span><strong>Kosten:</strong> {activity.cost}</span>
                        </div>
                        {activity.link && (
                          <a
                            href={activity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-landal-light-green hover:text-landal-green underline text-xs"
                          >
                            🔗 Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gezelligheid */}
                <div className="landal-card p-6 shadow-card">
                  <h3 className="text-xl font-bold text-landal-green mb-4 flex items-center gap-2">
                    <span className="text-2xl">🍻</span>
                    <span>Gezelligheid & Horeca</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Restaurant Park Exloo",
                        description: "Lekker uit eten op het park zelf. Nederlandse keuken en internationale gerechten.",
                        distance: "Op het park",
                        cost: "€15-25 hoofdgerecht",
                      },
                      {
                        name: "Pannenkoekenhuis Borger",
                        description: "Traditionele Nederlandse pannenkoeken in gezellige sfeer.",
                        distance: "10 min rijden",
                        cost: "€8-12 pp",
                      },
                      {
                        name: "Brouwerij de Kikker",
                        description: "Lokale brouwerij met proeverij en rondleiding. Drentse biertjes!",
                        distance: "25 min rijden naar Odoorn",
                        cost: "€12,50 proeverij",
                        link: "https://www.brouwerijdekikker.nl",
                      },
                      {
                        name: "Café Restaurant De Zeven Geitjes",
                        description: "Gezellig dorpscafé met lokale specialiteiten en goede sfeer.",
                        distance: "5 min rijden naar Exloo",
                        cost: "€12-18 hoofdgerecht",
                      },
                    ].map((activity) => (
                      <div key={activity.name} className="bg-landal-light rounded-lg p-4 border border-landal-border">
                        <h4 className="text-base font-semibold text-landal-green mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                        <div className="flex justify-between items-center text-xs text-landal-gray mb-2">
                          <span><strong>Afstand:</strong> {activity.distance}</span>
                          <span><strong>Kosten:</strong> {activity.cost}</span>
                        </div>
                        {activity.link && (
                          <a
                            href={activity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-landal-light-green hover:text-landal-green underline text-xs"
                          >
                            🔗 Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-landal-gray mt-6 text-sm font-medium">
                  Keuze genoeg! We kijken ter plekke waar we zin in hebben. Geen verplichtingen, alles mag! ✨
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
