import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  BarChart3,
  X
} from 'lucide-react';

// Tipe data untuk Website
interface Website {
  id: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN' | 'PENDING';
  latency: number;
  lastChecked: Date;
  history: number[]; // Menyimpan 20 data latency terakhir untuk grafik
}

// Tipe data untuk Log Event
interface EventLog {
  id: string;
  websiteName: string;
  status: 'UP' | 'DOWN';
  timestamp: Date;
  message: string;
}

export default function App() {
  // State utama
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: '1',
      name: 'Google Production',
      url: 'https://google.com',
      status: 'UP',
      latency: 45,
      lastChecked: new Date(),
      history: [40, 42, 45, 43, 41, 120, 45, 44, 42, 41, 40, 39, 42, 45, 46, 42, 41, 40, 45, 45]
    },
    {
      id: '2',
      name: 'API Server Utama',
      url: 'https://api.mycompany.com',
      status: 'UP',
      latency: 120,
      lastChecked: new Date(),
      history: [110, 115, 120, 118, 122, 125, 110, 115, 120, 130, 125, 120, 115, 110, 112, 118, 120, 122, 119, 120]
    },
    {
      id: '3',
      name: 'Landing Page',
      url: 'https://mycompany.com',
      status: 'DOWN',
      latency: 0,
      lastChecked: new Date(),
      history: [200, 210, 250, 0, 0, 0, 0, 0, 0, 0, 200, 210, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]);

  const [logs, setLogs] = useState<EventLog[]>([
    { id: '1', websiteName: 'Landing Page', status: 'DOWN', timestamp: new Date(), message: 'Connection timeout' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');

    // Simulasi Monitoring Real-time
    // Catatan: Di lingkungan produksi, data ini akan diambil dari backend Node.js
    useEffect(() => {
    const interval = setInterval(() => {
        setWebsites(prevSites => {
            return prevSites.map(site => {
                // Logika simulasi status (90% kemungkinan UP untuk demo)
                const isUp = Math.random() > 0.1;
                // Jika situs sebelumnya UP dan sekarang DOWN (atau sebaliknya), catat log
                const newStatus = isUp ? 'UP' : 'DOWN';

                if (site.status !== newStatus && site.status !== 'PENDING') {
                    addLog(site.name, newStatus, isUp ? 'Service recovered' : 'Connection timeout / 500 Error');
                }

                // Simulasi Latency (20ms - 300ms)
                const newLatency = isUp ? Math.floor(Math.random() * 280) + 20 : 0;

                // Update history array (geser kiri)
                const newHistory = [...site.history.slice(1), newLatency];

                return {
                    ...site,
                    status: newStatus,
                    latency: newLatency,
                    lastChecked: new Date(),
                    history: newHistory
                };
            });
        });
    }, 3000); // Update setiap 3 detik

    return () => clearInterval(interval);
    }, []);

    // Contoh fetch data dari backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gunakan URL backend Anda
                const apiUrl = 'http://localhost:3001';
                const endpoint = `${apiUrl}/api/status`;
                const response = await fetch(endpoint);
                const data = await response.json();
                setWebsites(data);
            } catch (error) {
                console.error("Gagal mengambil data", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

  const addLog = (name: string, status: 'UP' | 'DOWN', msg: string) => {
    const newLog: EventLog = {
      id: Math.random().toString(36).substr(2, 9),
      websiteName: name,
      status: status,
      timestamp: new Date(),
      message: msg
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Simpan 50 log terakhir
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteUrl) return;

    const newSite: Website = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSiteName,
      url: newSiteUrl,
      status: 'PENDING',
      latency: 0,
      lastChecked: new Date(),
      history: Array(20).fill(0)
    };

    setWebsites([...websites, newSite]);
    setNewSiteName('');
    setNewSiteUrl('');
    setIsModalOpen(false);
  };

  const handleDeleteSite = (id: string) => {
    setWebsites(websites.filter(w => w.id !== id));
  };

  // Helper untuk statistik
  const totalSites = websites.length;
  const upSites = websites.filter(w => w.status === 'UP').length;
  const downSites = websites.filter(w => w.status === 'DOWN').length;
  const avgLatency = Math.round(websites.reduce((acc, curr) => acc + curr.latency, 0) / (upSites || 1));

  // Render komponen grafik sparkline sederhana
  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data, 1);
    return (
      <div className="flex items-end h-12 gap-1 w-32">
        {data.map((val, i) => (
          <div
            key={i}
            className={`w-1 rounded-t ${color}`}
            style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">NetGuardian<span className="text-indigo-500">.</span></span>
            </div>
            <div className="flex gap-4">
               <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                System Logs
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" /> Tambah Monitor
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Website</p>
                    <h3 className="text-3xl font-bold mt-2">{totalSites}</h3>
                  </div>
                  <div className="p-2 bg-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Layanan Online</p>
                    <h3 className="text-3xl font-bold mt-2 text-emerald-400">{upSites}</h3>
                  </div>
                  <div className="p-2 bg-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Layanan Offline</p>
                    <h3 className="text-3xl font-bold mt-2 text-rose-500">{downSites}</h3>
                  </div>
                  <div className="p-2 bg-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-6 w-6 text-rose-500" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Rata-rata Latency</p>
                    <h3 className="text-3xl font-bold mt-2 text-indigo-400">{avgLatency}<span className="text-lg text-slate-500 ml-1">ms</span></h3>
                  </div>
                  <div className="p-2 bg-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-400" /> Status Monitor
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Live Updates
                </div>
              </div>

              <div className="divide-y divide-slate-700">
                {websites.map((site) => (
                  <div key={site.id} className="p-6 hover:bg-slate-700/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white truncate">{site.name}</h3>
                        {site.status === 'UP' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ONLINE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                            OFFLINE
                          </span>
                        )}
                      </div>
                      <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 text-sm hover:text-indigo-400 transition-colors mt-1 block truncate">
                        {site.url}
                      </a>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 mb-1">Response Time History</span>
                        <Sparkline data={site.history} color={site.status === 'UP' ? 'bg-emerald-500/60' : 'bg-rose-500/60'} />
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="flex items-center justify-end gap-1 text-slate-300 font-mono text-lg">
                          {site.status === 'UP' ? (
                            <>
                              <Activity className="h-4 w-4 text-slate-500" />
                              {site.latency}ms
                            </>
                          ) : (
                            <span className="text-rose-500">--</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Last check: {site.lastChecked.toLocaleTimeString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Hapus Monitor"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                  </div>
                ))}

                {websites.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Belum ada website yang dimonitor.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
             <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-indigo-400" /> Log Kejadian
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium">
                    <tr>
                      <th className="px-6 py-3">Waktu</th>
                      <th className="px-6 py-3">Website</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Pesan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-700/20">
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {log.timestamp.toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{log.websiteName}</td>
                        <td className="px-6 py-4">
                           {log.status === 'UP' ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> UP
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> DOWN
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}

      </main>

      {/* Modal Tambah Site */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">Tambah Website Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nama Layanan</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="Contoh: Production Server"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL Endpoint</label>
                <input
                  type="url"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
