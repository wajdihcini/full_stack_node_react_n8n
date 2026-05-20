/**
 * UploadPage — Drag-and-drop file upload connected to real backend.
 * Supports: PDF, DOC, DOCX, TXT, CSV, JSON.
 */
import { useState, useRef } from 'react';
import { ingestAPI } from '../services/api.js';
import {
  FileText,
  X,
  CheckCircle2,
  CloudUpload,
  AlertCircle
} from 'lucide-react';

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function UploadPage() {
  const [files, setFiles] = useState([]);  // { file, status: 'pending'|'uploading'|'done'|'error', id }
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  let fileIdCounter = useRef(0);

  const addFiles = (newFiles) => {
    const fileList = Array.from(newFiles);
    const items = fileList.map((f) => ({
      file: f,
      status: 'pending',
      id: ++fileIdCounter.current,
    }));
    setFiles((prev) => {
      const existingNames = new Set(prev.map((item) => item.file.name));
      const unique = items.filter((item) => !existingNames.has(item.file.name));
      return [...prev, ...unique];
    });
    setError(null);
  };

  const removeFile = (id) => {
    if (uploading) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setError(null);

    // Mark all pending as uploading
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));

    try {
      const fileObjects = pendingFiles.map(f => f.file);
      await ingestAPI.uploadFiles(fileObjects);
      
      // Mark as done
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'done' } : f));
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload files. Please try again.');
      // Mark as error
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error' } : f));
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  return (
    <div className="p-4" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        {/* Title */}
        <div className="mb-4">
          <h4 className="fw-bold text-dark">Upload Data</h4>
          <p className="text-muted">
            Upload your files to process and integrate them into your knowledge base.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center py-2 small mb-4" role="alert">
            <AlertCircle size={16} className="me-2" />
            {error}
          </div>
        )}

        {/* ─── Drag & Drop Zone ─────────────────────────────── */}
        <div
          className={`upload-dropzone mb-4 ${isDragOver ? 'dragging' : ''} ${uploading ? 'opacity-50' : ''}`}
          onDragOver={!uploading ? handleDragOver : undefined}
          onDragLeave={!uploading ? handleDragLeave : undefined}
          onDrop={!uploading ? handleDrop : undefined}
          onClick={!uploading ? handleBrowse : undefined}
          style={{ pointerEvents: uploading ? 'none' : 'auto' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="d-none"
            accept=".pdf,.doc,.docx,.txt,.csv,.json"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="upload-icon">
            <CloudUpload size={28} />
          </div>
          <h6 className="fw-bold text-dark mb-1">
            {isDragOver ? 'Drop files here!' : 'Drag and drop files here, or browse'}
          </h6>
          <p className="text-muted small mb-0">
            Supports: PDF, DOC, DOCX, TXT, CSV, JSON
          </p>
        </div>

        {/* ─── File List ───────────────────────────────────── */}
        {files.length > 0 && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold small text-uppercase text-muted">
                Files ({files.length})
              </h6>
              {!uploading && files.some(f => f.status === 'pending') && (
                <button className="btn btn-primary btn-sm px-3" onClick={handleUpload}>
                  Start Upload
                </button>
              )}
            </div>
            <div className="card-body p-0">
              {files.map((item) => (
                <div key={item.id} className="file-list-item animate-fade-in-up">
                  {/* File icon */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded me-3"
                    style={{ width: '40px', height: '40px', backgroundColor: '#e8eaf6', flexShrink: 0 }}
                  >
                    <FileText size={20} className="text-primary" />
                  </div>

                  {/* File info */}
                  <div className="flex-grow-1 overflow-hidden me-3">
                    <div className="text-truncate fw-medium small">{item.file.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatSize(item.file.size)}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="d-flex align-items-center gap-2">
                    {item.status === 'uploading' && (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                    )}
                    {item.status === 'done' && (
                      <CheckCircle2 size={20} className="text-success" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle size={20} className="text-danger" />
                    )}

                    {/* Remove button */}
                    {!uploading && (
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                        aria-label="Remove file"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

