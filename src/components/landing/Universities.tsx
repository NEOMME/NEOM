"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { categories, countries, universities } from "@/lib/data";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";

export function Universities() {
  const published = universities.filter((u) => u.published);

  return (
    <section id="universities" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Partner <span className="text-gradient">Universities</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore world-class institutions across multiple countries and categories.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((uni, i) => {
            const country = countries.find((c) => c.id === uni.countryId);
            const uniCategories = categories.filter((c) =>
              uni.categoryIds.includes(c.id)
            );

            return (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full group hover:glow-cyan">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {country?.flag} {country?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">#{uni.ranking}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{uni.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {uniCategories.slice(0, 2).map((cat) => (
                      <Badge key={cat.id} label={cat.name} />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                    <span>{uni.tuition}</span>
                    <span>Deadline: {uni.deadline}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
