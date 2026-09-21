import React from 'react';
import { motion } from 'motion/react';
import { X, Phone, Shield, ShieldAlert, Truck, AlertTriangle } from 'lucide-react';

interface EmergencyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const contacts = [
    { number: '112', label: 'National Emergency', desc: 'All-in-one emergency response system', icon: <ShieldAlert className="text-red-500" size={18} /> },
    { number: '100', label: 'Police Control Room', desc: 'Direct access to local law enforcement', icon: <Shield className="text-blue-500" size={18} /> },
    { number: '108', label: 'Ambulance Helpline', desc: 'Telangana specific fast-response medical aid', icon: <Truck className="text-emerald-500" size={18} /> },
    { number: '103', label: 'Fire Service', desc: 'Fire and rescue assistance', icon: <AlertTriangle className="text-amber-500" size={18} /> },
    { number: '1033', label: 'National Highway Helpline', desc: 'Roadside assistance & highway patrol', icon: <Phone className="text-cyan-500" size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 bg-coral-glow/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <h2 className="text-sm font-sans font-extrabold text-white tracking-wide uppercase">
              Telangana Emergency Hub
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-muted-slate hover:text-white transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-[11px] font-sans text-muted-slate leading-relaxed">
            Quick-dial essential public safety and cellular backup dispatch numbers. Tap any card below to start a call on your mobile device.
          </p>

          <div className="flex flex-col gap-3">
            {contacts.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/35 hover:bg-coral-glow/10 hover:border-coral-glow/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    {contact.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-sans font-bold text-soft-silver group-hover:text-white transition-colors">
                      {contact.label}
                    </span>
                    <span className="text-[9px] font-sans text-muted-slate mt-0.5">
                      {contact.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-coral-glow/10 border border-coral-glow/25 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold text-coral-glow group-hover:bg-coral-glow group-hover:text-white transition-all">
                  <Phone size={10} />
                  {contact.number}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-5 py-3.5 bg-black/35 text-center">
          <span className="text-[9px] font-sans text-muted-slate italic">
            Emergency contacts are available even when signal coverage is limited.
          </span>
        </div>
      </motion.div>
    </div>
  );
};
