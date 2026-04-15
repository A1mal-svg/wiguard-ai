import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Cpu, Database, AlertCircle, ChevronRight, Download } from 'lucide-react';
import { generateSampleCSV } from '../lib/sampleData';

interface Props {
  onStart: (csvText: string, filename: string) => void;
}

const PIPELINE_STEPS = [
  { icon: FileText, label: 'Feature Extraction', desc: 'Parse packet metadata per time window' },
  { icon: Database, label: 'Preprocessing', desc: 'Normalize features with StandardScaler' },
  { icon: Cpu, label: 'Isolation Forest', desc: 'Unsupervised anomaly scoring' },
  { icon: AlertCircle, label: 'Adaptive Threshold', desc: 'Dynamic threshold = mean + std' },
  { icon: Cpu, label: 'Random Forest', desc: 'Risk category classification' },
];

export default function UploadPage({ onStart }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.pcap')) {
      setError('Please upload a .csv file (extracted network features) or .pcap file.');
      return;
    }
    setError('');
    setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;
    const text = await file.text();
    onStart(text, file.name);
  };

  const handleSample = () => {
    const csv = generateSampleCSV();
    onStart(csv, 'sample_network_traffic.csv');
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_wiguard_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050d1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            <span className="text-[#00d4ff] text-xs font-medium tracking-wider uppercase">Privacy-Preserving IDS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#e2e8f0] mb-4 leading-tight">
            Detect Wi-Fi Intrusions
            <br />
            <span className="text-[#00d4ff]">Without Payload Inspection</span>
          </h2>
          <p className="text-[#64748b] text-base max-w-xl mx-auto leading-relaxed">
            Upload your network capture (CSV features) to run the full ML pipeline — Isolation Forest + Random Forest with adaptive thresholding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragging ? 'border-[#00d4ff] bg-[#00d4ff]/5' : file ? 'border-[#00ff88]/40 bg-[#00ff88]/5' : 'border-[#1e3a5f] bg-[#0a1628] hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5'}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.pcap"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="p-10 text-center">
                {file ? (
                  <>
                    <div className="w-14 h-14 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-7 h-7 text-[#00ff88]" />
                    </div>
                    <p className="text-[#00ff88] font-semibold text-sm mb-1">{file.name}</p>
                    <p className="text-[#475569] text-xs">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-xl bg-[#0f2040] border border-[#1e3a5f] flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7 text-[#475569]" />
                    </div>
                    <p className="text-[#94a3b8] font-medium mb-1">Drop your CSV file here</p>
                    <p className="text-[#475569] text-xs">or click to browse — .csv with packet features</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20">
                <AlertCircle className="w-4 h-4 text-[#ff4757] flex-shrink-0 mt-0.5" />
                <p className="text-[#ff4757] text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                ${file
                  ? 'bg-[#00d4ff] text-[#050d1a] hover:bg-[#00c0e8] shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                  : 'bg-[#0f2040] text-[#475569] cursor-not-allowed'}`}
            >
              Run Full Pipeline
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1e3a5f]" />
              <span className="text-xs text-[#475569]">or</span>
              <div className="flex-1 h-px bg-[#1e3a5f]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSample}
                className="py-3 rounded-xl font-medium text-sm border border-[#1e3a5f] text-[#94a3b8] hover:border-[#00d4ff]/30 hover:text-[#00d4ff] hover:bg-[#00d4ff]/5 transition-all duration-200"
              >
                Use Sample Data
              </button>
              <button
                onClick={handleDownloadSample}
                className="py-3 rounded-xl font-medium text-sm border border-[#1e3a5f] text-[#94a3b8] hover:border-[#00ff88]/30 hover:text-[#00ff88] hover:bg-[#00ff88]/5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-[#475569] uppercase tracking-wider mb-4">Pipeline Stages</p>
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0a1628] border border-[#1e3a5f]">
                  <div className="w-7 h-7 rounded-lg bg-[#0f2040] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#00d4ff]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#e2e8f0]">{step.label}</p>
                    <p className="text-[10px] text-[#475569] truncate">{step.desc}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-mono text-[#1e3a5f]">0{i + 1}</span>
                </div>
              );
            })}

            <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1e3a5f]/50 mt-2">
              <p className="text-[10px] text-[#475569] leading-relaxed">
                <span className="text-[#00d4ff] font-semibold">Required CSV columns:</span>{' '}
                packet_count, avg_packet_size, packet_size_variance, tcp_ratio, udp_ratio, icmp_ratio, syn_count, failed_connections, inter_arrival_time, connection_duration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
