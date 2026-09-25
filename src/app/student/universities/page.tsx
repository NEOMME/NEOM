"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useNeomStore } from "@/lib/store";
import { motion } from "framer-motion";
import { MapPin, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

export default function StudentUniversitiesPage() {
  const { universities, countries, categories } = useNeomStore();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return universities
      .filter((u) => u.published)
      .filter((u) => {
        if (countryFilter !== "all" && u.countryId !== countryFilter) return false;
        if (categoryFilter !== "all" && !u.categoryIds.includes(categoryFilter)) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            u.name.toLowerCase().includes(q) ||
            u.programs.some((p) => p.toLowerCase().includes(q))
          );
        }
        return true;
      });
  }, [universities, search, countryFilter, categoryFilter]);

  return (
    <div className="p-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Explore Universities</h1>
        <p className="text-slate-600">Browse partner institutions by country, category, or program.</p>
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities or programs..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((uni, i) => {
          const country = countries.find((c) => c.id === uni.countryId);
          const uniCats = categories.filter((c) => uni.categoryIds.includes(c.id));

          return (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{uni.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {country?.flag} {country?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">#{uni.ranking}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{uni.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {uniCats.map((c) => (
                    <Badge key={c.id} label={c.name} />
                  ))}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  Programs: {uni.programs.join(", ")}
                </div>
                <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>{uni.tuition}</span>
                  <span>Deadline: {uni.deadline}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          No universities match your filters.
        </div>
      )}
    </div>
  );
}
