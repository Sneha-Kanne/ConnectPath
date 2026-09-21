import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Wifi, 
  Battery, 
  Signal, 
  Share2, 
  Check, 
  Copy, 
  Radio, 
  Smartphone, 
  Sparkles, 
  Plus, 
  Car, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { Button } from './Button';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  role: string;
  carrier: 'Jio' | 'Airtel' | 'Vi' | 'BSNL';
  carrierType: string;
  signalStrength: number; // 0 - 100
  bars: number; // 1 - 4
  battery: number; // 0 - 100
  latencyMs: number;
  status: string;
  isHotspotHost?: boolean;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'priya',
    name: 'Priya Patel',
    avatar: '👩🏽',
    role: 'Trip Navigator',
    carrier: 'Airtel',
    carrierType: '5G Plus',
    signalStrength: 94,
    bars: 4,
    battery: 88,
    latencyMs: 18,
    status: 'Optimal Carrier Signal',
    isHotspotHost: false,
  },
  {
    id: 'rahul',
    name: 'Rahul Sharma',
    avatar: '👨🏽',
    role: 'Driver',
    carrier: 'Jio',
    carrierType: 'True 5G',
    signalStrength: 48,
    bars: 2,
    battery: 76,
    latencyMs: 58,
    status: 'Entering Siddipet Attenuation Zone',
    isHotspotHost: false,
  },
  {
    id: 'amit',
    name: 'Amit Varma',
    avatar: '🧔🏽',
    role: 'Passenger',
    carrier: 'Vi',
    carrierType: 'GIGAnet 4G',
    signalStrength: 24,
    bars: 1,
    battery: 42,
    latencyMs: 145,
    status: 'High Packet Loss Detected',
    isHotspotHost: false,
  },
];

const CARRIER_COLORS = {
  Jio: {
    badge: 'bg-[#0A3D91]/20 border-[#0A3D91]/60 text-[#85b2ff]',
    text: 'text-[#85b2ff]',
    border: 'border-[#0A3D91]/40',
  },
  Airtel: {
    badge: 'bg-[#E40000]/20 border-[#E40000]/60 text-[#ff8080]',
    text: 'text-[#ff8080]',
    border: 'border-[#E40000]/40',
  },
  Vi: {
    badge: 'bg-[#FFD700]/10 border-[#FFD700]/50 text-[#ffd700]',
    text: 'text-[#ffd700]',
    border: 'border-[#FFD700]/40',
  },
  BSNL: {
    badge: 'bg-[#00843D]/20 border-[#00843D]/60 text-[#73e691]',
    text: 'text-[#73e691]',
    border: 'border-[#00843D]/40',
  },
};

export const ConvoyPanel: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [isHotspotActive, setIsHotspotActive] = useState<boolean>(false);
  const [tripCode] = useState('TG-HYD-KRM-409');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [tripName, setTripName] = useState('Hyderabad → Karimnagar Convoy');
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendCarrier, setNewFriendCarrier] = useState<'Jio' | 'Airtel' | 'Vi' | 'BSNL'>('Jio');

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`https://connectpath.telangana.in/convoy/${tripCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleHotspot = () => {
    setIsHotspotActive(prev => {
      const next = !prev;
      setFriends(current =>
        current.map(f => {
          if (f.id === 'priya') {
            return {
              ...f,
              isHotspotHost: next,
              status: next ? 'Hotspot Active (Tethering 2 peers)' : 'Optimal Carrier Signal',
            };
          }
          if (f.id === 'amit' || f.id === 'rahul') {
            return {
              ...f,
              status: next ? 'Connected to Priya’s Airtel Hotspot' : f.status,
              signalStrength: next ? 95 : f.signalStrength,
              bars: next ? 4 : f.bars,
            };
          }
          return f;
        })
      );
      return next;
    });
  };

  const handlePingGroup = () => {
    setPingStatus('Pinging 3 convoy members...');
    setTimeout(() => {
      setPingStatus('✓ All 3 devices responded • Multi-carrier mesh synchronized');
      setTimeout(() => setPingStatus(null), 3000);
    }, 800);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    const newMember: Friend = {
      id: `friend-${Date.now()}`,
      name: newFriendName.trim(),
      avatar: '🧑🏽',
      role: 'Passenger',
      carrier: newFriendCarrier,
      carrierType: newFriendCarrier === 'Jio' ? 'True 5G' : newFriendCarrier === 'Airtel' ? '5G Plus' : '4G LTE',
      signalStrength: 80,
      bars: 3,
      battery: 85,
      latencyMs: 32,
      status: 'Connected to Convoy Mesh',
    };
    setFriends(prev => [...prev, newMember]);
    setNewFriendName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Convoy Header Card */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/8 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-glow/15 text-cyan-glow">
              <Car size={15} />
            </span>
            <div>
              <h3 className="text-xs font-sans font-extrabold text-white tracking-wide">
                {tripName}
              </h3>
              <span className="text-[10px] font-sans text-muted-slate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {friends.length} Travelers Connected in Vehicle
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingTrip(!isCreatingTrip)}
            className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-sans font-semibold text-soft-silver hover:text-white transition-all cursor-pointer"
          >
            {isCreatingTrip ? 'Done' : 'Edit Trip'}
          </button>
        </div>

        {/* Trip editor dropdown */}
        {isCreatingTrip && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-white/5 flex flex-col gap-2"
          >
            <label className="text-[10px] font-sans font-bold text-muted-slate uppercase tracking-wider">
              Trip Name
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:border-cyan-glow outline-none"
            />
          </motion.div>
        )}

        {/* Invite link & Trip Code */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[10px] font-sans text-muted-slate">Code:</span>
            <span className="text-[10px] font-mono font-bold text-cyan-glow">{tripCode}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-glow/10 hover:bg-cyan-glow/20 border border-cyan-glow/25 text-[10px] font-sans font-semibold text-cyan-glow transition-all cursor-pointer"
            >
              {copiedLink ? <Check size={11} /> : <Copy size={11} />}
              {copiedLink ? 'Link Copied' : 'Invite Friends'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-sans font-semibold text-soft-silver hover:text-white transition-all cursor-pointer"
              title="Add Co-traveler"
            >
              <Plus size={11} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Group recommendation banner */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 shadow-[0_0_20px_rgba(245,158,11,0.12)] relative overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 animate-pulse">
            <Radio size={16} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} />
                Network Insight
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20">
                Next 15 km
              </span>
            </div>

            <p className="text-xs font-sans text-soft-silver leading-snug">
              <strong className="text-white font-bold">Airtel</strong> is expected to be more reliable over the next 15 km (Siddipet to Karimnagar). Priya could turn on Mobile Hotspot for the group.
            </p>

            <div className="flex items-center justify-between pt-2 mt-0.5 border-t border-amber-500/15">
              <span className="text-[10px] font-sans text-muted-slate flex items-center gap-1">
                <Smartphone size={11} className="text-amber-400" />
                Host: <strong className="text-white">Priya (Airtel 5G)</strong>
              </span>

              <button
                onClick={toggleHotspot}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  isHotspotActive
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-obsidian shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-500 hover:bg-amber-400 text-obsidian shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                }`}
              >
                <Zap size={11} className={isHotspotActive ? 'fill-current' : ''} />
                {isHotspotActive ? 'Hotspot Active (Tethered)' : 'Enable Group Hotspot'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Convoy Members List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-sans font-bold text-muted-slate uppercase tracking-wider flex items-center gap-1.5">
            <Users size={12} className="text-cyan-glow" />
            Active Travelers in Vehicle ({friends.length})
          </span>

          <button
            onClick={handlePingGroup}
            className="text-[10px] font-sans text-cyan-glow hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={10} className={pingStatus ? 'animate-spin' : ''} />
            Sync Mesh
          </button>
        </div>

        {pingStatus && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 text-[10px] font-sans text-cyan-glow text-center font-medium"
          >
            {pingStatus}
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          {friends.map((friend) => {
            const carrierStyle = CARRIER_COLORS[friend.carrier];
            const isAirtelHost = friend.id === 'priya';

            return (
              <div
                key={friend.id}
                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                  isAirtelHost && isHotspotActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-black/35 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Avatar & info */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg p-1.5 rounded-xl bg-white/5 border border-white/5">
                      {friend.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-sans font-bold text-white">
                          {friend.name}
                        </span>
                        {isAirtelHost && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-[8px] font-sans font-bold text-amber-300">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-sans text-muted-slate block">
                        {friend.role}
                      </span>
                    </div>
                  </div>

                  {/* Right: Carrier badge & signal */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-sans font-extrabold uppercase ${carrierStyle.badge}`}>
                        {friend.carrier} {friend.carrierType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-slate">
                      <span className="flex items-center gap-0.5 text-soft-silver font-semibold">
                        <Signal size={10} className={friend.signalStrength > 70 ? 'text-emerald-400' : friend.signalStrength > 40 ? 'text-amber-400' : 'text-coral-glow'} />
                        {friend.signalStrength}%
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-muted-slate">
                        <Battery size={10} />
                        {friend.battery}%
                      </span>
                      <span>•</span>
                      <span className="text-[9px] text-cyan-glow font-mono">
                        {friend.latencyMs}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-sans">
                  <span className="text-muted-slate truncate pr-2">
                    {friend.status}
                  </span>

                  {isAirtelHost && (
                    <button
                      onClick={toggleHotspot}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                        isHotspotActive 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-white/5 text-muted-slate hover:text-white border border-white/10'
                      }`}
                    >
                      {isHotspotActive ? 'Hotspot ON' : 'Turn ON Hotspot'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group travel stats */}
      <div className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between text-[10px] font-sans">
        <div className="flex flex-col">
          <span className="text-muted-slate font-medium">Group Mesh Strength</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Wifi size={11} /> 98% (Multi-Carrier Resilient)
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-muted-slate font-medium">Expected handover</span>
          <span className="text-xs font-bold text-cyan-glow">
            In 15km → Airtel Dominant
          </span>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-sans font-extrabold text-white uppercase tracking-wider">
                  Add Co-Traveler
                </h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded text-muted-slate hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-sans text-muted-slate uppercase font-bold block mb-1">
                    Traveler Name
                  </label>
                  <input
                    type="text"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder="e.g. Sravan Rao"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-cyan-glow outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[10px] font-sans text-muted-slate uppercase font-bold block mb-1">
                    Primary SIM Provider
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Jio', 'Airtel', 'Vi', 'BSNL'] as const).map((carrier) => (
                      <button
                        key={carrier}
                        type="button"
                        onClick={() => setNewFriendCarrier(carrier)}
                        className={`py-1.5 rounded-lg border text-xs font-bold font-sans transition-all ${
                          newFriendCarrier === carrier
                            ? 'bg-cyan-glow text-obsidian border-cyan-glow font-extrabold'
                            : 'bg-black/30 border-white/10 text-muted-slate hover:text-white'
                        }`}
                      >
                        {carrier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="glass"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setShowAddModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    type="submit"
                  >
                    Add to Convoy
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
