import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Cpu, UserCheck, 
  Settings, PenTool, DollarSign, 
  CheckCircle, XCircle, FileText, 
  ArrowRight, Activity, UploadCloud
} from 'lucide-react';

const ROLES = [
  { id: 'sales', label: '1. Konsumen/Sales', icon: User },
  { id: 'marketing', label: '2. Marketing', icon: Briefcase },
  { id: 'scoring', label: '3. Scoring Engine', icon: Cpu },
  { id: 'manager', label: '4. Atasan Marketing', icon: UserCheck },
  { id: 'system', label: '5. Sistem Otomasi', icon: Settings },
  { id: 'esign', label: '6. Konsumen E-Sign', icon: PenTool },
  { id: 'admin', label: '7. Admin Backoffice', icon: DollarSign }
];

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  SCORED: 'bg-indigo-100 text-indigo-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  DOCS_GENERATED: 'bg-yellow-100 text-yellow-800',
  SIGNED: 'bg-purple-100 text-purple-800',
  DISBURSED: 'bg-teal-100 text-teal-800'
};

export default function FinancingWorkflowApp() {
  const [activeRole, setActiveRole] = useState('sales');
  const [applications, setApplications] = useState([]);

  // Helper to update application status
  const updateStatus = (id, newStatus, additionalData = {}) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus, ...additionalData, updatedAt: new Date() } : app
    ));
  };

  const SalesDealerView = () => {
    const [formData, setFormData] = useState({ name: '', amount: '', ktpUploaded: false });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.name || !formData.amount || !formData.ktpUploaded) return;
      
      const newApp = {
        id: `APP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        name: formData.name,
        amount: parseInt(formData.amount),
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setApplications([...applications, newApp]);
      setFormData({ name: '', amount: '', ktpUploaded: false });
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">(1) Input Data & Upload Berkas</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Konsumen</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nominal Pengajuan (Rp)</label>
            <input 
              type="number" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload KTP/Berkas</label>
            <div className="mt-1 flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, ktpUploaded: !formData.ktpUploaded})}
                className={`flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${formData.ktpUploaded ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                {formData.ktpUploaded ? 'Berkas Terupload' : 'Simulasi Upload'}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!formData.name || !formData.amount || !formData.ktpUploaded}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            Submit Pengajuan (Draft)
          </button>
        </form>
      </div>
    );
  };

  const MarketingView = () => {
    const drafts = applications.filter(a => a.status === 'DRAFT');

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">(2) Review Draft & Submit</h2>
        {drafts.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada draft pengajuan baru.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konsumen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drafts.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {app.amount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => updateStatus(app.id, 'SUBMITTED')}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        Submit ke Sistem <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const ScoringEngineView = () => {
    const submitted = applications.filter(a => a.status === 'SUBMITTED');

    const runScoring = (id) => {
      // Simulate scoring (random 1-100)
      const score = Math.floor(Math.random() * 40) + 60; // 60 to 100
      updateStatus(id, 'SCORED', { score });
    };

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 to-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-indigo-600" />
          (3) Database & Scoring Engine
        </h2>
        {submitted.length === 0 ? (
          <p className="text-gray-500 text-sm">Menunggu pengajuan masuk...</p>
        ) : (
          <div className="space-y-3">
            {submitted.map(app => (
              <div key={app.id} className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold text-indigo-900">Notifikasi: Pengajuan Masuk [{app.id}]</div>
                  <div className="text-sm text-indigo-700">Konsumen: {app.name} - Rp {app.amount.toLocaleString('id-ID')}</div>
                </div>
                <button 
                  onClick={() => runScoring(app.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium shadow-sm"
                >
                  Jalankan Scoring
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ManagerView = () => {
    const scored = applications.filter(a => a.status === 'SCORED');

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">(4) Dashboard Approval Atasan</h2>
        {scored.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada pengajuan menunggu approval.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scored.map(app => (
              <div key={app.id} className="border rounded-lg p-4 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-2 font-bold text-lg ${app.score >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                  Skor: {app.score}
                </div>
                <h3 className="font-bold text-lg">{app.id}</h3>
                <p className="text-gray-600 text-sm mb-2">Nama: {app.name}</p>
                <p className="text-gray-600 text-sm mb-4">Nominal: Rp {app.amount.toLocaleString('id-ID')}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(app.id, 'APPROVED')}
                    className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 py-2 rounded-md font-medium flex items-center justify-center transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </button>
                  <button 
                    onClick={() => updateStatus(app.id, 'REJECTED')}
                    className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 py-2 rounded-md font-medium flex items-center justify-center transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SystemView = () => {
    const approved = applications.filter(a => a.status === 'APPROVED');

    return (
      <div className="p-6 bg-slate-900 rounded-lg shadow-sm border border-slate-700 text-slate-200 font-mono text-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-100 flex items-center">
          <Settings className="w-5 h-5 mr-2 animate-spin-slow" />
          (5) Sistem Terotomasi (Log)
        </h2>
        {approved.length === 0 ? (
          <p className="text-slate-500">{">"} Menunggu trigger dokumen...</p>
        ) : (
          <div className="space-y-4">
            {approved.map(app => (
              <div key={app.id} className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="text-green-400 mb-2">{">"} Trigger detected for {app.id}</div>
                <div className="pl-4 border-l-2 border-slate-600 space-y-2 mb-4">
                  <div>├── (5a) Generating E-PO ---&gt; Send to Dealer (Email/Portal)</div>
                  <div>└── (5b) Generating E-Kontrak ---&gt; Send to Konsumen (SMS/WA)</div>
                </div>
                <button 
                  onClick={() => updateStatus(app.id, 'DOCS_GENERATED')}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded transition-colors"
                >
                  Simulasikan: Proses Selesai & Kirim Link E-Sign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ESignView = () => {
    const pendingSign = applications.filter(a => a.status === 'DOCS_GENERATED');

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">(6) Konsumen Tanda Tangan Digital</h2>
        {pendingSign.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada dokumen menunggu tanda tangan.</p>
        ) : (
          <div className="space-y-4">
            {pendingSign.map(app => (
              <div key={app.id} className="border border-purple-200 bg-purple-50 p-5 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-start">
                  <FileText className="w-8 h-8 text-purple-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-purple-900">E-Kontrak Pembiayaan</h3>
                    <p className="text-sm text-purple-700">No. Ref: {app.id}</p>
                    <p className="text-sm text-purple-700">Yth. {app.name}, silakan review dan tanda tangani kontrak Anda.</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateStatus(app.id, 'SIGNED')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium shadow-sm whitespace-nowrap"
                >
                  Tanda Tangan Sekarang
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AdminView = () => {
    const signed = applications.filter(a => a.status === 'SIGNED');

    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">(7) Admin Backoffice - Pencairan</h2>
        {signed.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada antrean pencairan.</p>
        ) : (
          <div className="space-y-4">
            {signed.map(app => (
              <div key={app.id} className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900">{app.id} - {app.name}</h3>
                  <div className="flex items-center text-sm text-green-600 font-medium mt-1">
                    <CheckCircle className="w-4 h-4 mr-1" /> Dokumen Lengkap & Ditandatangani
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Siap transfer: Rp {app.amount.toLocaleString('id-ID')} ke Dealer via Host-to-Host.</p>
                </div>
                <button 
                  onClick={() => updateStatus(app.id, 'DISBURSED')}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md font-medium shadow-sm whitespace-nowrap flex items-center"
                >
                  <DollarSign className="w-4 h-4 mr-1" /> Trigger Pencairan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const StatusBoard = () => {
    return (
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Status Semua Pengajuan</h3>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada data pengajuan yang dibuat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2 font-medium pr-4">ID</th>
                  <th className="pb-2 font-medium pr-4">Nama</th>
                  <th className="pb-2 font-medium pr-4">Nominal</th>
                  <th className="pb-2 font-medium">Status Saat Ini</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-mono">{app.id}</td>
                    <td className="py-2 pr-4">{app.name}</td>
                    <td className="py-2 pr-4">Rp {app.amount.toLocaleString('id-ID')}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-300" />
          <div>
            <h1 className="text-xl font-bold">FinFlow</h1>
            <p className="text-xs text-blue-200">Sistem Pengajuan Pembiayaan Otomatis</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Role / Tahapan</div>
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon className={`flex-shrink-0 mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{role.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="mb-4 text-sm text-gray-500">
            Simulasi Role: <strong>{ROLES.find(r => r.id === activeRole)?.label}</strong>
          </div>
          
          {/* Dynamic Component Rendering based on Role */}
          <div className="transition-all duration-300 ease-in-out">
            {activeRole === 'sales' && <SalesDealerView />}
            {activeRole === 'marketing' && <MarketingView />}
            {activeRole === 'scoring' && <ScoringEngineView />}
            {activeRole === 'manager' && <ManagerView />}
            {activeRole === 'system' && <SystemView />}
            {activeRole === 'esign' && <ESignView />}
            {activeRole === 'admin' && <AdminView />}
          </div>

          <StatusBoard />
        </main>
      </div>
    </div>
  );
}