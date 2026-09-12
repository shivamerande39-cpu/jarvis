import React, { useState, useEffect } from 'react';
import { Globe, MapPin, CloudSun, Shield, Satellite } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface GlobalFacility {
  id: string;
  name: string;
  location: string;
  timeZone: string;
  weather: string;
  tempC: number;
  securityLevel: 'MAXIMUM' | 'SECURE' | 'RESTRICTED';
  orbitalPass: string;
}

interface GlobalMonitorProps {
  onSelectFacility: (facility: GlobalFacility) => void;
}

export const GlobalMonitor: React.FC<GlobalMonitorProps> = ({ onSelectFacility }) => {
  const [facilities] = useState<GlobalFacility[]>([
    {
      id: 'malibu',
      name: 'Point Dume Residence',
      location: 'Malibu, California',
      timeZone: 'America/Los_Angeles',
      weather: 'Clear Coastline',
      tempC: 22,
      securityLevel: 'SECURE',
      orbitalPass: 'Pass in 14m',
    },
    {
      id: 'stark_tower',
      name: 'Stark Tower Complex',
      location: 'Manhattan, New York',
      timeZone: 'America/New_York',
      weather: 'Scattered Clouds',
      tempC: 17,
      securityLevel: 'MAXIMUM',
      orbitalPass: 'Overhead Lock',
    },
    {
      id: 'london',
      name: 'Nexus Research Lab',
      location: 'London, United Kingdom',
      timeZone: 'Europe/London',
      weather: 'Light Mist',
      tempC: 13,
      securityLevel: 'RESTRICTED',
      orbitalPass: 'Pass in 42m',
    },
    {
      id: 'tokyo',
      name: 'Orbital Propulsion Facility',
      location: 'Tokyo, Japan',
      timeZone: 'Asia/Tokyo',
      weather: 'Overcast',
      tempC: 19,
      securityLevel: 'SECURE',
      orbitalPass: 'Pass in 2h',
    },
  ]);

  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const updated: Record<string, string> = {};
      facilities.forEach((f) => {
        try {
          updated[f.id] = new Intl.DateTimeFormat('en-US', {
            timeZone: f.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(now);
        } catch {
          updated[f.id] = now.toLocaleTimeString();
        }
      });
      setCurrentTimes(updated);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [facilities]);

  const handleFacilityClick = (f: GlobalFacility) => {
    soundEffects.playHudClick();
    onSelectFacility(f);
  };

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-200">
            GLOBAL STARK SATELLITE NETWORK
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-cyan-400/80">
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span>STARK-SAT-09 LINKED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            id={`facility-${fac.id}`}
            onClick={() => handleFacilityClick(fac)}
            className="bg-black/50 border border-cyan-900/50 hover:border-cyan-400/60 rounded p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:bg-cyan-950/30 group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-400">
                <span className="flex items-center gap-1 text-cyan-300 font-bold truncate">
                  <MapPin className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                  {fac.name}
                </span>
                <span className="text-[10px] text-cyan-500/70">{fac.orbitalPass}</span>
              </div>
              <div className="text-[10px] font-mono-tech text-cyan-500/80 pl-4 mb-2">
                {fac.location}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-cyan-900/30 flex items-center justify-between text-xs">
              <div className="font-orbitron text-cyan-200 tracking-wider">
                {currentTimes[fac.id] || '--:--:--'}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono-tech text-cyan-400/90">
                <CloudSun className="w-3.5 h-3.5 text-amber-400/80" />
                <span>{fac.tempC}°C</span>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between text-[9px] font-mono-tech text-cyan-500/60">
              <span>{fac.weather}</span>
              <span className="flex items-center gap-0.5 text-emerald-400">
                <Shield className="w-2.5 h-2.5" />
                {fac.securityLevel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
