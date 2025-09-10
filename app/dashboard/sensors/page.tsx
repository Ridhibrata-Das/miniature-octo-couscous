'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { fetchThingSpeakHistory, fetchNPKData, type ThingSpeakData, type NPKData } from '@/lib/thingspeak';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '1y', label: 'Last Year' }
];

export default function SensorsPage() {
  const [sensorHistory, setSensorHistory] = useState<ThingSpeakData[]>([]);
  const [npkHistory, setNpkHistory] = useState<NPKData[]>([]);
  const [selectedRange, setSelectedRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [modeAutomatic, setModeAutomatic] = useState(false); // false => Manual, true => Automatic
  const [pumpState, setPumpState] = useState<'on' | 'off' | 'unknown'>('unknown');
  const [isToggling, setIsToggling] = useState(false);

  const latestSoilMoisture = sensorHistory.length > 0 ? sensorHistory[sensorHistory.length - 1].soilMoisture : undefined;

  const readPumpState = async () => {
    try {
      // With MQTT we don't have a read endpoint yet; default to 'unknown' and rely on UI toggle feedback.
      // If you later add MQTT state topic via websockets, wire it here.
      const res = await fetch('/api/thingspeak/pump', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPumpState(data?.state === 'on' ? 'on' : 'off');
    } catch (e) {
      console.error('Failed to read pump state', e);
    }
  };

  const setPump = async (state: 'on' | 'off') => {
    try {
      setIsToggling(true);
      const res = await fetch('/api/pump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: state.toUpperCase() })
      });
      if (!res.ok) throw new Error(await res.text());
      setPumpState(state);
    } catch (e) {
      console.error('Failed to set pump state', e);
      toast.error('Failed to toggle pump.');
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [historyData, npkData] = await Promise.all([
          fetchThingSpeakHistory(selectedRange),
          fetchNPKData(selectedRange)
        ]);
        setSensorHistory(historyData);
        setNpkHistory(npkData);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        toast.error('Failed to fetch sensor data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    readPumpState();

    // Set up polling interval
    const interval = {
      '1h': 15000, // 15 seconds
      '24h': 60000, // 1 minute
      '7d': 300000, // 5 minutes
      '30d': 900000, // 15 minutes
      '1y': 3600000 // 1 hour
    }[selectedRange] || 60000;

    const pollInterval = setInterval(fetchData, interval);

    return () => clearInterval(pollInterval);
  }, [selectedRange]);

  // Automatic mode control: if soil moisture <=10 -> ON, if >=80 -> OFF
  useEffect(() => {
    const id = setInterval(() => {
      if (modeAutomatic && typeof latestSoilMoisture === 'number') {
        if (latestSoilMoisture <= 10 && pumpState !== 'on') {
          setPump('on');
        }
        if (latestSoilMoisture >= 80 && pumpState !== 'off') {
          setPump('off');
        }
      }
    }, 15000);
    return () => clearInterval(id);
  }, [modeAutomatic, latestSoilMoisture, pumpState]);

  // Manual autocut: if pump is ON in manual and soil moisture >=80 -> OFF
  useEffect(() => {
    if (!modeAutomatic && pumpState === 'on' && typeof latestSoilMoisture === 'number' && latestSoilMoisture >= 80) {
      setPump('off');
    }
  }, [modeAutomatic, pumpState, latestSoilMoisture]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sensor Readings</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Pump Control */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Water Pump</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Manual</span>
              <Switch checked={modeAutomatic} onCheckedChange={(v) => setModeAutomatic(!!v)} />
              <span className="text-sm text-gray-600">Automatic</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <button
              disabled={modeAutomatic || isToggling}
              onClick={() => setPump(pumpState === 'on' ? 'off' : 'on')}
              className="rounded-full"
              aria-label="Toggle pump"
            >
              <div
                className="w-56 h-56 rounded-full shadow-inner"
                style={{
                  background: pumpState === 'on'
                    ? 'radial-gradient(circle at 50% 30%, #b7ffb7, #00ff00 60%, #06c406)'
                    : 'radial-gradient(circle at 50% 30%, #ffd1d1, #ff2b2b 60%, #c40606)'
                }}
              />
            </button>
            <div className="mt-4 text-sm text-gray-700">
              {modeAutomatic ? 'Automatic mode active' : 'Manual mode'} · Pump is <span className={`font-semibold ${pumpState === 'on' ? 'text-green-700' : 'text-red-700'}`}>{pumpState}</span>
            </div>
            {typeof latestSoilMoisture === 'number' && (
              <div className="mt-1 text-xs text-gray-500">Soil moisture: {latestSoilMoisture}%</div>
            )}
          </div>
        </Card>
        {/* Temperature Chart */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Temperature History</h2>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="time" height={30} stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Humidity Chart */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Humidity History</h2>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="time" height={30} stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Soil Moisture Chart */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Soil Moisture History</h2>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="soilMoisture"
                  name="Soil Moisture (%)"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="time" height={30} stroke="#ea580c" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* NPK Chart */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">NPK Sensor Data</h2>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={npkHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nitrogen"
                  name="Nitrogen (N)"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="phosphorus"
                  name="Phosphorus (P)"
                  stroke="#DC2626"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="potassium"
                  name="Potassium (K)"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={false}
                />
                <Brush dataKey="time" height={30} stroke="#6B7280" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}