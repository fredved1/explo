export async function fetchData() {
  try {
    const response = await fetch("/api/data", {
      cache: "no-store",
    })
    
    if (response.ok) {
      const data = await response.json()
      // Save to localStorage as backup
      localStorage.setItem("familieweekend-data", JSON.stringify(data))
      return data
    }
  } catch (error) {
    console.error("Error fetching from database:", error)
  }
  
  // Fallback to localStorage
  const saved = localStorage.getItem("familieweekend-data")
  return saved ? JSON.parse(saved) : { teams: {}, polls: {} }
}

export async function saveData(teams: any, polls: any) {
  const data = { teams, polls }
  
  try {
    // Save to database first
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      console.log("Saved to database successfully")
      localStorage.setItem("familieweekend-data", JSON.stringify(data))
      return { success: true }
    } else {
      console.error("Database save failed:", await response.text())
    }
  } catch (error) {
    console.error("Error saving to database:", error)
  }
  
  // Always save to localStorage as backup
  localStorage.setItem("familieweekend-data", JSON.stringify(data))
  return { success: false }
}