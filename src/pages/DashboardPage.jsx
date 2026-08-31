import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  subscribeDevices, 
  seedDemoDevice 
} from '../services/deviceService';
import DeviceCard from '../components/DeviceCard';
import StatCard from '../components/StatCard';
import { 
  Smartphone, 
  Copy, 
  Check, 
  PlusCircle, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Search,
  Sparkles,
  QrCode,
  AlertCircle,
  HelpCircle,
  Download,
  ArrowDownToLine,
  SmartphoneNfc
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, adminProfile } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeDevices(currentUser.uid, (data) => {
      setDevices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleCopyCode = async () => {
    if (adminProfile?.uniqueCode) {
      await navigator.clipboard.writeText(adminProfile.uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await seedDemoDevice(currentUser.uid);
    } catch (err) {
      console.error("Failed to seed demo device:", err);
    } finally {
      setSeeding(false);
    }
  };

  const onlineDevicesCount = devices.filter(d => d.connected).length;
  const filteredDevices = devices.filter(d => 
    (d.deviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.model || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero: Admin Pairing Code Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/70 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Device Pairing
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Connect Child Devices
            </h1>
            <p className="text-sm text-slate-300">
              Install the <span className="text-white font-semibold">ScreenGuard Mobile App</span> on your child's Android device and enter your unique code below to instantly pair and manage.
            </p>
          </div>

          {/* Prominent Code Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-indigo-400/30 shadow-xl">
            <div className="flex flex-col px-3 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Admin Pairing Code
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-3xl sm:text-4xl font-extrabold text-indigo-300 tracking-widest">
                {adminProfile?.uniqueCode || '------'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={`${import.meta.env.BASE_URL}ScreenGuardChild.apk`}
                download="ScreenGuardChild.apk"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition"
                title="Download ScreenGuardChild.apk (53 MB)"
              >
                <Download className="w-4 h-4" />
                <div className="flex flex-col text-left leading-tight">
                  <span>Download Child APK</span>
                  <span className="text-[9px] text-emerald-200 font-normal">v1.0 • 53 MB</span>
                </div>
              </a>

              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
                title="Show pairing QR Code & setup"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Paired"
          value={devices.length}
          subtitle="Protected devices"
          icon={Smartphone}
          color="indigo"
        />
        <StatCard
          title="Online Now"
          value={onlineDevicesCount}
          subtitle="Heartbeat active"
          icon={Wifi}
          color="emerald"
        />
        <StatCard
          title="Offline Devices"
          value={devices.length - onlineDevicesCount}
          subtitle="Awaiting sync"
          icon={WifiOff}
          color="amber"
        />
        <StatCard
          title="Protection Status"
          value={devices.length > 0 ? "Active" : "Ready"}
          subtitle="Real-time enforcement"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Paired Devices Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Paired Devices
            </h2>
            <p className="text-xs text-slate-400">
              Live status, battery, daily app limits, and domain blocking
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devices..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Demo seed button (useful for development / verification) */}
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl transition"
              title="Add sample device with installed apps and limits for demo"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{seeding ? 'Adding Demo...' : '+ Demo Device'}</span>
            </button>
          </div>
        </div>

        {/* Devices Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/30 border border-slate-800/60 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-8 h-8 opacity-60" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">No Paired Devices Yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Open the Mobile App on your child's phone, type code <span className="font-mono font-bold text-indigo-300">{adminProfile?.uniqueCode}</span>, and it will appear here automatically in real time.
              </p>
            </div>
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition"
            >
              {seeding ? 'Creating Demo...' : 'Or Click to Create a Demo Device'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </div>

      {/* Setup & QR Code pairing modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-white">Pair Child Device</h3>
            
            {/* Step 1: APK Download */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Download Child APK</div>
                  <div className="text-[10px] text-slate-400">Install ScreenGuard on child phone</div>
                </div>
              </div>
              <a
                href={`${import.meta.env.BASE_URL}ScreenGuardChild.apk`}
                download="ScreenGuardChild.apk"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get APK</span>
              </a>
            </div>

            {/* Step 2 & 3: Code & QR */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Enter Pairing Code in App</div>
                  <div className="text-[10px] text-slate-400">Open ScreenGuard on child phone & enter:</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl inline-block shadow">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${adminProfile?.uniqueCode}`}
                  alt="Pairing QR Code"
                  className="w-32 h-32 mx-auto"
                />
              </div>

              <div className="font-['JetBrains_Mono',monospace] text-2xl font-black text-indigo-300 tracking-widest bg-slate-900/90 py-2 rounded-xl border border-indigo-500/30">
                {adminProfile?.uniqueCode || '------'}
              </div>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
