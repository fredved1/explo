export async function fetchData() {
  try {
    const response = await fetch("/api/data", {
      cache: "no-store",
    })
    if (!response.ok) throw new Error("Failed to fetch data")
    return await response.json()
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