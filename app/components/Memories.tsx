"use client"

export const Memories = () => {
  return (
    <section className="pt-20">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold text-center text-emerald-800 dark:text-emerald-200 mb-6">
          Herinneringen
        </h2>
        <p className="text-lg text-center text-emerald-700 dark:text-emerald-300 mb-8">
          Binnenkort vind je hier een verzameling van mooie momenten van onze familieweekenden.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for memories */}
          <div className="glass-card p-4">
            <p className="text-emerald-700 dark:text-emerald-300">Nog geen herinneringen beschikbaar.</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-emerald-700 dark:text-emerald-300">Nog geen herinneringen beschikbaar.</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-emerald-700 dark:text-emerald-300">Nog geen herinneringen beschikbaar.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
