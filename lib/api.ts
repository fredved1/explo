export async function fetchData() {
  try {
    // First try localStorage for immediate response
    const saved = localStorage.getItem("familieweekend-data")
    let localData = saved ? JSON.parse(saved) : { teams: {}, polls: {} }
    
    // Then try to fetch from API and merge
    const response = await fetch("/api/data", {
      cache: "no-store",
    })
    
    if (response.ok) {
      const serverData = await response.json()
      // Merge server data with local data, preferring local for recent changes
      const mergedData = {
        teams: { ...serverData.teams, ...localData.teams },
        polls: { ...serverData.polls, ...localData.polls }
      }
      // Update localStorage with merged data
      localStorage.setItem("familieweekend-data", JSON.stringify(mergedData))
      return mergedData
    } else {
      console.warn("API not available, using localStorage")
      return localData
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    // Fallback to localStorage if API fails
    const saved = localStorage.getItem("familieweekend-data")
    if (saved) {
      return JSON.parse(saved)
    }
    return { teams: {}, polls: {} }
  }
}

export async function saveData(teams: any, polls: any) {
  try {
    // Save to localStorage first (for immediate update)
    localStorage.setItem("familieweekend-data", JSON.stringify({ teams, polls }))
    
    // Then save to Vercel KV
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teams, polls }),
    })
    
    if (!response.ok) throw new Error("Failed to save data")
    return await response.json()
  } catch (error) {
    console.error("Error saving data:", error)
    // Data is already saved to localStorage, so the user won't lose their input
    return { success: false }
  }
}