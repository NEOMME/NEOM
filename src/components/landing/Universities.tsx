"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { categories, countries, universities } from "@/lib/data";
import { MapPin, Star } from "lucide-react";

export function Universities() {
  const published = universities.filter((u) => u.published);

  return (
    <section id="universities" className="py-20 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Partner universities</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore institutions across countries and academic fields.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map((uni) => {
            const country = countries.find((c) => c.id === uni.countryId);
            const uniCategories = categories.filter((c) =>
              uni.categoryIds.includes(c.id)
            );

            return (
              <Card key={uni.id} className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{uni.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {country?.flag} {country?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">#{uni.ranking}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{uni.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {uniCategories.slice(0, 2).map((cat) => (
                    <Badge key={cat.id} label={cat.name} />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>{uni.tuition}</span>
                  <span>Deadline: {uni.deadline}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
