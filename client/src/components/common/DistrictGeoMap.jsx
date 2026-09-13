import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Building2 } from "lucide-react";

export const MAHARASHTRA_DISTRICT_COORDS = {
  Mumbai: [19.076, 72.8777],
  "Mumbai Suburban": [19.125, 72.885],
  Pune: [18.5204, 73.8567],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Aurangabad: [19.8762, 75.3433],
  "Chhatrapati Sambhajinagar": [19.8762, 75.3433],
  Solapur: [17.6599, 75.9064],
  Kolhapur: [16.705, 74.2433],
  Thane: [19.2183, 72.9781],
  Amravati: [20.9374, 77.7796],
  Nanded: [19.1383, 77.321],
  Sangli: [16.8524, 74.5815],
  Jalgaon: [21.0077, 75.5626],
  Akola: [20.7002, 77.0082],
  Latur: [18.4088, 76.5604],
  Dhule: [20.9042, 74.7749],
  Ahmednagar: [19.0948, 74.748],
  Satara: [17.6805, 74.0183],
  Chandrapur: [19.9615, 79.2961],
  Ratnagiri: [16.9902, 73.312],
  Sindhudurg: [16.1158, 73.7144],
  Raigad: [18.5158, 73.1822],
  Palghar: [19.6967, 72.7699],
  Beed: [18.9891, 75.7601],
  Osmanabad: [18.1856, 76.0419],
  Dharashiv: [18.1856, 76.0419],
  Yavatmal: [20.3888, 78.1204],
  Wardha: [20.7453, 78.6022],
  Bhandara: [21.1714, 79.6548],
  Gondia: [21.4598, 80.1961],
  Gadchiroli: [20.1809, 80.0152],
  Washim: [20.1112, 77.1352],
  Buldhana: [20.5312, 76.1824],
  Jalna: [19.8347, 75.8816],
  Parbhani: [19.2612, 76.7749],
  Hingoli: [19.7183, 77.1472],
  Nandurbar: [21.3687, 74.2403],
};

const MAHARASHTRA_CENTER = [19.45, 76.25];

function createClusterIcon(count) {
  return L.divIcon({
    className: "custom-cluster-pin",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #2563EB;
        color: #ffffff;
        font-weight: 700;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
        border: 2.5px solid #ffffff;
        cursor: pointer;
      ">
        ${count}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export function DistrictGeoMap({ problems = [], className = "" }) {
  const districtGroups = useMemo(() => {
    const map = {};

    problems.forEach((problem) => {
      const districts = problem.geography?.districts?.length
        ? problem.geography.districts
        : ["Mumbai", "Pune"]; // Default statewide coverage pins

      districts.forEach((dist) => {
        const matchedKey = Object.keys(MAHARASHTRA_DISTRICT_COORDS).find(
          (k) => k.toLowerCase() === dist.toLowerCase()
        );

        if (matchedKey) {
          if (!map[matchedKey]) {
            map[matchedKey] = {
              coords: MAHARASHTRA_DISTRICT_COORDS[matchedKey],
              problems: [],
            };
          }
          if (!map[matchedKey].problems.some((p) => p._id === problem._id)) {
            map[matchedKey].problems.push(problem);
          }
        }
      });
    });

    return map;
  }, [problems]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-slate-50 ${className}`}>
      {/* Top Banner */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-slate-200 max-w-xs pointer-events-auto">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-[#2563EB]" />
          <span className="text-xs font-bold text-[#10233F]">
            Maharashtra District Coverage
          </span>
        </div>
        <p className="text-[11px] text-[#64748B] leading-tight">
          Click district pins to inspect geocoded departmental challenges.
        </p>
      </div>

      <MapContainer
        center={MAHARASHTRA_CENTER}
        zoom={6.8}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[480px] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {Object.entries(districtGroups).map(([district, data]) => (
          <Marker
            key={district}
            position={data.coords}
            icon={createClusterIcon(data.problems.length)}
          >
            <Popup className="custom-leaflet-popup" maxWidth={320}>
              <div className="p-1 space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#10233F]">
                    <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
                    {district} District
                  </div>
                  <span className="text-[10px] font-semibold text-[#2563EB]">
                    {data.problems.length} {data.problems.length === 1 ? "Problem" : "Problems"}
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {data.problems.map((prob) => (
                    <div
                      key={prob._id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 hover:bg-blue-50/40 transition-colors"
                    >
                      <p className="text-xs font-bold text-[#10233F] line-clamp-1">
                        {prob.title}
                      </p>
                      <p className="text-[11px] text-[#64748B] line-clamp-2">
                        {prob.shortSummary}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-semibold text-[#0F766E]">
                          {prob.sectors?.[0] || "General"}
                        </span>
                        <Link to={`/challenges/${prob._id}`}>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] gap-1 text-[#2563EB]">
                            View
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default DistrictGeoMap;
