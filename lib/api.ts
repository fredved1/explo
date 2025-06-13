export async function fetchData() {
  // Use localStorage only for now - reliable and fast
  const saved = localStorage.getItem("familieweekend-data")
  return saved ? JSON.parse(saved) : { teams: {}, polls: {} }
}

export async function saveData(teams: any, polls: any) {
  // Save to localStorage only - reliable and immediate
  localStorage.setItem("familieweekend-data", JSON.stringify({ teams, polls }))
  return { success: true }
}