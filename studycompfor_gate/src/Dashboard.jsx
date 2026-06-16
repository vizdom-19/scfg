import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Component Icons mapping for clean scannable sidebar layouts
const SIDEBAR_ITEMS = [
  { id: 'sm', label: 'Subject Management', icon: '📚' },
  { id: 'tt', label: 'Topic Tracker', icon: '🎯' },
  { id: 'nm', label: 'Notes Management', icon: '💡' },
  { id: 'pyq', label: 'PYQ Tracker', icon: '🗣️' },
  { id: 'ss', label: 'Study Session', icon: '⏱️' },
  { id: 'pomo', label: 'Pomodoro Focus (ADHD)', icon: '🍅' },
  { id: 'rs', label: 'Revision Scheduling', icon: '🔄' },
  { id: 'heatmap', label: 'Study Calendar Heatmap', icon: '🔥' },
  { id: 'bhai-quiz', label: 'Apka Bhai: Quiz Generator', icon: '🤖' },
  { id: 'bhai-weak', label: 'Apka Bhai: Weak Topics', icon: '🧠' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sm');
  const [userProfile, setUserProfile] = useState({ name: 'Student', level: 'GATE Aspirant' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth', { replace: true });
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setUserProfile({ name: user.name || 'Student', level: 'GATE Aspirant' });
    } catch {
      sessionStorage.removeItem('user');
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
      // Continue logout even if backend is unreachable
    }
    sessionStorage.removeItem('user');
    navigate('/');
  };
  
  // Pomodoro Local States
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);

  // Minimalist countdown clock framework for ADHD Pomodoro
  useEffect(() => {
    let interval = null;
    if (isPomoRunning) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoSeconds === 0 && pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          setIsPomoRunning(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMinutes, pomoSeconds]);

  return (
    <div className="min-h-screen w-full bg-[#f4fbf9] font-sans antialiased flex text-gray-800 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <>
            <motion.div
              key="mobile-sidebar-overlay"
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar-panel"
              id="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-full bg-white border-r border-gray-200/90 p-6 overflow-y-auto shadow-2xl lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1c9c9c] flex items-center justify-center text-[#d4f86d] font-bold text-lg">@</div>
                  <span className="text-xl font-bold tracking-tight text-gray-900">SCfG</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1c9c9c]/30"
                >
                  Close
                </button>
              </div>
              <nav className="space-y-1.5">
                <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase block mb-2">Workspace Utilities</span>
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left relative ${
                        isActive ? 'text-[#1c9c9c] font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-[#1c9c9c]/10 border-l-4 border-[#1c9c9c] rounded-xl"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="text-lg relative z-10">{item.icon}</span>
                      <span className="relative z-10 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-gray-100 mt-6">
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 font-medium text-sm hover:bg-red-50 rounded-xl transition-colors"
                >
                  <span>🚪</span>
                  <span>Exit Workspace</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 1. LEFT TASKBAR SIDEBAR */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-gray-200/80 h-screen flex-col justify-between p-6 shrink-0 z-20">
        <div className="space-y-8 overflow-y-auto pr-1">
          {/* Platform Branding Identifier Logo Block */}
          <div className="flex items-center space-x-2 px-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-[#1c9c9c] flex items-center justify-center text-[#d4f86d] font-bold text-lg">@</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">SCfG <span className="text-xs font-semibold text-[#1c9c9c] bg-[#1c9c9c]/10 px-2 py-0.5 rounded-full ml-1">Panel</span></span>
          </div>

          {/* Core Features List Navigation Tree */}
          <nav className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase px-3 block mb-2">Workspace Utilities</span>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left relative ${
                    isActive ? 'text-[#1c9c9c] font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-[#1c9c9c]/10 border-l-4 border-[#1c9c9c] rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="text-lg relative z-10">{item.icon}</span>
                  <span className="relative z-10 truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Logout Terminal Section */}
        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 font-medium text-sm hover:bg-red-50 rounded-xl transition-colors"
          >
            <span>🚪</span>
            <span>Exit Workspace</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB VIEWPORT AREA */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#f8faf9] p-8 lg:p-10 flex flex-col gap-8 z-10">
        
        {/* TOP STATUS BAR ROW */}
        <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 transition"
              aria-label="Open menu"
            >
              ☰
            </button>
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-3.5 opacity-40">🔍</span>
              <input 
                type="text" 
                placeholder="Search subjects, tracked gate nodes, or keys..." 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1c9c9c] focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right hidden sm:block">
              <h4 className="text-sm font-bold text-gray-900">{userProfile.name}</h4>
              <p className="text-xs text-gray-400 font-medium">{userProfile.level}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1c9c9c] to-[#2cd6d6] text-white flex items-center justify-center font-bold text-sm shadow-inner border border-white">
              {userProfile.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* HERO BANNER SECTION */}
        <div className="w-full bg-gradient-to-r from-[#1c9c9c] to-[#147575] rounded-[28px] p-8 text-white relative overflow-hidden shadow-lg shadow-[#1c9c9c]/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#d4f86d]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="bg-black/20 text-[#d4f86d] text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full inline-block">Online Course Sync</span>
            <h2 className="text-3xl font-bold tracking-tight">Sharpen Your Skills With Professional Structured Engines</h2>
            <p className="text-white/80 text-sm max-w-md">Access custom algorithmic dashboards mapped to target specific data fields and structural problems.</p>
            <button className="mt-2 bg-[#d4f86d] hover:bg-[#bde059] text-black text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95">
              Sync Active Syllabus
            </button>
          </div>
        </div>

        {/* WORKSPACE CONTENT SHEETS VIEWPORTS */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* Dynamic Tab Panel View Assembly */}
          <div className="xl:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm min-h-[400px]"
              >
                {/* 1. Subject Management View */}
                {activeTab === 'sm' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Subject Management</h3>
                        <p className="text-xs text-gray-400">Core syllabus execution trackers</p>
                      </div>
                      <span className="text-xs font-semibold bg-[#1c9c9c]/10 text-[#1c9c9c] px-3 py-1 rounded-full">2/8 Tracked</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['Data Structures & Algorithms', 'Computer Architecture', 'Operating Systems', 'Theory of Computation'].map((sub, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#1c9c9c]/30 transition-colors space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-2xl">{idx === 0 ? '🌳' : idx === 1 ? '💻' : '⚙️'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${idx === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{idx === 0 ? 'Completed' : 'In Progress'}</span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">{sub}</h4>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-[#1c9c9c] h-1.5 rounded-full" style={{ width: idx === 0 ? '100%' : '45%' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Topic Tracker View */}
                {activeTab === 'tt' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Topic Checkpoint Matrix</h3>
                    <p className="text-xs text-gray-400">Granular framework checklist for targeted subjects.</p>
                    <div className="divide-y divide-gray-100">
                      {['Asymptotic Notation Analysis', 'AVL Tree Balance Factor Rotations', 'Matrix Multiplication Complexity', 'Graph BFS/DFS Traversal Matrices'].map((topic, index) => (
                        <div key={index} className="py-3.5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked={index === 0} className="rounded accent-[#1c9c9c] w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700">{topic}</span>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Unit 1</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Notes Management View */}
                {activeTab === 'nm' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Saved Engineering Notes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="text-2xl mb-2">➕</span>
                        <h4 className="text-sm font-bold text-gray-800">Upload Markdowns or PDFs</h4>
                        <p className="text-xs text-gray-400 max-w-[180px] mt-1">Apka Bhai AI reads these to compile quiz blueprints.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                        <div className="flex justify-between text-xs text-amber-700 font-bold">
                          <span>Revision Token Attached</span>
                          <span>💡</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">Pointers & Static Members Memory Map</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">Static allocation parameters remain linked inside the segmented stack structures...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PYQ Tracker View */}
                {activeTab === 'pyq' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">GATE Past Year Questions Terminal</h3>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#1c9c9c]">GATE CS 2024 — Question 24</span>
                        <h4 className="text-sm font-semibold text-gray-800">Evaluate Postfix Expression Matrix Bounds</h4>
                      </div>
                      <button className="bg-[#1c9c9c] text-white text-xs font-bold px-4 py-2 rounded-lg">Solve Node</button>
                    </div>
                  </div>
                )}

                {/* 5. Study Session Tracker View */}
                {activeTab === 'ss' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Daily Study Engine Logs</h3>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Accumulated Runtime Today</p>
                        <h2 className="text-4xl font-extrabold text-[#d4f86d]">5h 42m</h2>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-[#1c9c9c] border-t-transparent animate-spin flex items-center justify-center text-xs text-[#1c9c9c]">
                        Active
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ADHD Pomodoro Focus View */}
                {activeTab === 'pomo' && (
                  <div className="space-y-6 text-center py-6">
                    <div className="max-w-xs mx-auto space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">ADHD Hyperfocus Panel</h3>
                      <p className="text-xs text-gray-400">Minimalist structural execution timer bypasses external environmental clutter.</p>
                    </div>
                    <div className="text-6xl font-black text-gray-900 tracking-tight font-mono py-6 bg-gray-50 rounded-2xl max-w-sm mx-auto border border-gray-100">
                      {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={() => setIsPomoRunning(!isPomoRunning)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow transition-all ${isPomoRunning ? 'bg-amber-500 text-white' : 'bg-[#1c9c9c] text-white'}`}
                      >
                        {isPomoRunning ? 'Pause Engine' : 'Trigger Engine'}
                      </button>
                      <button 
                        onClick={() => { setIsPomoRunning(false); setPomoMinutes(25); setPomoSeconds(0); }}
                        className="px-6 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. Revision Scheduling Engine View */}
                {activeTab === 'rs' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Spaced Repetition Pipeline</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Normal Distribution Hypothesis Z-Tests', due: 'Due Today', color: 'text-red-500 bg-red-50' },
                        { title: 'Circular Queues Array Boundaries', due: 'Due Tomorrow', color: 'text-amber-500 bg-amber-50' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{item.title}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${item.color}`}>{item.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Study Calendar Heatmap View */}
                {activeTab === 'heatmap' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">LeetCode Consistency Tracker</h3>
                      <p className="text-xs text-gray-400">Fires up structural block indicators whenever a PYQ is processed.</p>
                    </div>
                    {/* Simplified Layout simulation grid array representation */}
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-24 gap-1.5">
                        {Array.from({ length: 96 }).map((_, i) => {
                          // Simulating random active patterns for structural heat mapping
                          const intensities = ['bg-gray-200', 'bg-[#1c9c9c]/20', 'bg-[#1c9c9c]/50', 'bg-[#1c9c9c]', 'bg-[#d4f86d]'];
                          const chosenIndex = Math.floor(Math.random() * intensities.length);
                          return (
                            <div 
                              key={i} 
                              className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 hover:scale-125 ${intensities[chosenIndex]}`} 
                              title={`Activity node frame validation key block ${i}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center space-x-2 justify-end mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>Less</span>
                        <div className="w-2.5 h-2.5 bg-gray-200 rounded-sm" />
                        <div className="w-2.5 h-2.5 bg-[#1c9c9c]/30 rounded-sm" />
                        <div className="w-2.5 h-2.5 bg-[#1c9c9c] rounded-sm" />
                        <div className="w-2.5 h-2.5 bg-[#d4f86d] rounded-sm" />
                        <span>More Solved</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Apka Bhai: Quiz Generator View */}
                {activeTab === 'bhai-quiz' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🤖</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Apka Bhai AI Generator</h3>
                        <p className="text-xs text-gray-400">Compiles custom dynamic question strings directly from indexed files.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <textarea 
                        rows="3" 
                        placeholder="Type standard subjects or leave empty to auto-extract evaluation data arrays..."
                        className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#1c9c9c] focus:bg-white transition-all resize-none"
                      />
                      <button className="w-full py-3 bg-[#1c9c9c] hover:bg-[#147575] text-white font-bold text-sm rounded-xl transition-all shadow-md">
                        Compile Topic-Wise Test Framework
                      </button>
                    </div>
                  </div>
                )}

                {/* 10. Apka Bhai for Weak Topics View */}
                {activeTab === 'bhai-weak' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Targeted Diagnostics Engine</h3>
                    <p className="text-xs text-gray-400">Tracks problematic code failures or wrong quiz responses automatically.</p>
                    <div className="p-4 rounded-xl border border-red-100 bg-red-50/30 space-y-2">
                      <div className="flex items-center justify-between text-xs text-red-600 font-bold">
                        <span>High Failure Critical Frequency Zone</span>
                        <span>⚠️</span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-800">4-to-1 Multiplexer Timing Diagrams</h4>
                      <p className="text-xs text-gray-500">Errors flagged during sync checks on clock line signal boundaries.</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. RIGHT PROFILE SIDEBAR ANALYTICS SIDE SHEET */}
          <div className="space-y-6">
            
            {/* Visual Metrics Circle Data Node Block */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm flex flex-col items-center text-center space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider w-full text-left">Your Profile Progress</h3>
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Ring Segment Blueprint simulation matrix placeholder */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#1c9c9c]" strokeDasharray="72, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-gray-900">72%</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Syllabus</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-800">Keep it up, {userProfile.name}!</h4>
                <p className="text-xs text-gray-400 max-w-[180px]">Your runtime execution curve stays above target parameters.</p>
              </div>
            </div>

            {/* Your Mentor Segment Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Your Mentor Node</h3>
                <span className="text-xs text-[#1c9c9c] font-bold cursor-pointer hover:underline">See All</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-[#1c9c9c] text-white text-xs font-bold flex items-center justify-center shadow-inner">
                  IITB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">MTech Core AI Group</h4>
                  <p className="text-[10px] text-gray-400 font-medium">One-on-One Support Ready</p>
                </div>
                <button className="ml-auto bg-[#1c9c9c] hover:bg-[#147575] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors">
                  Ping
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Dashboard;