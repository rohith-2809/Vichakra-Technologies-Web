import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Eye, EyeOff, FileText, ImageIcon, File, X, FolderOpen } from 'lucide-react';
import api from '../../api/axios';

function FileTypeIcon({ mimetype }) {
  if (mimetype?.startsWith('image/'))    return <ImageIcon size={18} className="text-violet-500" />;
  if (mimetype === 'application/pdf')    return <FileText size={18} className="text-red-500" />;
  return <File size={18} className="text-gray-400" />;
}

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const [files,          setFiles]          = useState([]);
  const [projects,       setProjects]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [dragOver,       setDragOver]       = useState(false);
  const [filterProject,  setFilterProject]  = useState('');
  const [selectedProject,setSelectedProject]= useState('');
  const [isPublic,       setIsPublic]       = useState(false);
  const [error,          setError]          = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    Promise.all([api.get('/admin/files'), api.get('/admin/projects')])
      .then(([fr, pr]) => { setFiles(fr.data.files); setProjects(pr.data.projects); })
      .finally(() => setLoading(false));
  }, []);

  const filteredFiles = filterProject ? files.filter((f) => f.project?._id === filterProject) : files;

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true); setError('');
    const form = new FormData();
    form.append('file', file);
    if (selectedProject) form.append('project', selectedProject);
    form.append('isPublic', isPublic);
    try {
      const { data } = await api.post('/admin/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles((prev) => [data.file, ...prev]);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const togglePublic = async (f) => {
    const { data } = await api.patch(`/admin/files/${f._id}`, { isPublic: !f.isPublic });
    setFiles((prev) => prev.map((x) => x._id === data.file._id ? data.file : x));
  };

  const deleteFile = async (f) => {
    if (!window.confirm(`Delete "${f.originalName}"?`)) return;
    await api.delete(`/admin/files/${f._id}`);
    setFiles((prev) => prev.filter((x) => x._id !== f._id));
  };

  return (
    <div className="space-y-5">
      {/* Upload options + zone */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Upload File</h2>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          >
            <option value="">No project (standalone)</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <div
              onClick={() => setIsPublic((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-teal-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? 'left-4' : 'left-0.5'}`} />
            </div>
            Visible to client
          </label>
        </div>

        <div
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[20px] py-12 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-teal-400 bg-teal-50/60'
              : uploading
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => uploadFile(e.target.files[0])}
          />
          <Upload size={22} className={`mx-auto mb-2 ${dragOver ? 'text-teal-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700">
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                Uploading…
              </span>
            ) : 'Drop file here or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Max 10 MB · jpg, png, pdf, zip, doc, xlsx</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <X size={13} className="shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        >
          <option value="">All files</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <span className="text-xs text-gray-400">
          {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* File grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white/60 backdrop-blur-md border border-gray-100 rounded-[24px]" />)}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 text-center bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm">
          <FolderOpen size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No files yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {filteredFiles.map((f) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <FileTypeIcon mimetype={f.mimetype} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePublic(f)}
                      title={f.isPublic ? 'Hide from client' : 'Show to client'}
                      className={`p-1.5 rounded-md transition-colors ${
                        f.isPublic
                          ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                          : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      {f.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={() => deleteFile(f)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 leading-tight">{f.originalName}</p>
                <p className="text-[11px] text-gray-400">{fmtSize(f.size)}</p>

                {f.project && (
                  <p className="text-[11px] text-teal-600 mt-1 truncate">{f.project.title}</p>
                )}

                <div className="mt-auto pt-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    f.isPublic
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                      : 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200'
                  }`}>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    {f.isPublic ? 'Public' : 'Internal'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
