import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, isServiceWorkerReady, handleInstallClick } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // If already running in standalone PWA mode, don't show install button
  if (isInstalled) {
    return null;
  }

  const onInstallClick = async () => {
    if (isInstallable) {
      await handleInstallClick();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowHelpModal(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-app-btn"
        onClick={onInstallClick}
        className={`flex items-center gap-1.5 font-sans font-bold transition-all cursor-pointer ${
          variant === 'compact'
            ? 'px-2.5 py-1 text-[10px] rounded-lg bg-cyan-glow/15 border border-cyan-glow/40 text-cyan-glow hover:bg-cyan-glow/25 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
            : 'w-full py-2.5 px-4 text-xs rounded-xl bg-gradient-to-r from-cyan-glow/20 to-coral-glow/20 border border-cyan-glow/40 text-white hover:border-cyan-glow transition-all shadow-lg justify-center'
        } ${className}`}
        title="Install ConnectPath as a Progressive Web App (Offline Navigation)"
      >
        <Download size={variant === 'compact' ? 12 : 14} className="animate-bounce" />
        <span>Install App</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div 
          id="pwa-ios-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-sm glass rounded-2xl p-5 border border-cyan-glow/30 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-glow/20 text-cyan-glow">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Install ConnectPath on iOS</h3>
                  <p className="text-[10px] text-muted-slate">Works directly in Apple Safari</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-muted-slate hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/8">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-glow/20 text-cyan-glow font-bold text-xs shrink-0">1</span>
                <p>
                  Tap the <strong className="text-white flex items-center gap-1 inline-flex"><Share2 size={12} className="text-cyan-glow inline" /> Share</strong> button in your Safari bottom navigation bar.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/8">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-glow/20 text-cyan-glow font-bold text-xs shrink-0">2</span>
                <p>
                  Scroll down the share sheet and tap <strong className="text-white flex items-center gap-1 inline-flex"><PlusSquare size={12} className="text-emerald-400 inline" /> Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/8">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-glow/20 text-cyan-glow font-bold text-xs shrink-0">3</span>
                <p>
                  Confirm <strong className="text-white">Add</strong> in top-right. Launch ConnectPath anytime from your home screen with offline cellular routing!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-glow text-obsidian font-bold text-xs hover:bg-cyan-300 transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Generic / Desktop Guide Modal when browser has not fired beforeinstallprompt yet */}
      {showHelpModal && (
        <div 
          id="pwa-help-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            className="w-full max-w-sm glass rounded-2xl p-5 border border-cyan-glow/30 shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-glow/20 text-cyan-glow">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Install ConnectPath PWA</h3>
                  <p className="text-[10px] text-muted-slate">Standalone Offline App</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-muted-slate hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p>
                ConnectPath is configured as a standalone Progressive Web App with offline service worker support and local route caching.
              </p>
              <div className={`p-3 rounded-xl border text-[11px] ${isServiceWorkerReady ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-200' : 'bg-amber-500/10 border-amber-400/25 text-amber-200'}`}>
                {isServiceWorkerReady
                  ? 'Offline app support is ready in this browser.'
                  : 'Offline app support is still starting. Reload once, then try the browser install control again.'}
              </div>
              {!isInstallable && !isIOS && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                  This browser has not provided a direct install prompt. Use the browser menu to install the app, or open this page in Chrome or Edge over HTTPS.
                </div>
              )}
              <div className="p-3 rounded-xl bg-cyan-glow/10 border border-cyan-glow/25 text-[11px] text-cyan-200">
                <span className="font-semibold">Desktop Chrome / Edge</span>: Click the install icon <Download size={12} className="inline ml-1" /> in the address bar, or open the browser menu and choose <strong>&ldquo;Install ConnectPath&rdquo;</strong>.
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                <span className="font-semibold">Android</span>: Open the browser menu and select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-cyan-glow text-obsidian font-bold text-xs hover:bg-cyan-300 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
