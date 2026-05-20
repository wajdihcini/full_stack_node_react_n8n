/**
 * IngestPage — Knowledge base file ingestion with Bootstrap design.
 */
import { useState, useRef, useCallback } from 'react';
import { ingestAPI } from '../services/api.js';
import { Container, Row, Col, Button, Card, ProgressBar, Alert, Spinner, Badge } from 'react-bootstrap';
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  Loader2,
  CloudUpload,
} from 'lucide-react';

/**
 * Returns the right icon for a file type
 */
function getFileIcon(type) {
  if (type?.startsWith('image/')) return Image;
  if (type?.includes('pdf') || type?.includes('text') || type?.includes('word'))
    return FileText;
  return File;
}

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function IngestPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const addFiles = (newFiles) => {
    const fileList = Array.from(newFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = fileList.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
    setResult(null);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const res = await ingestAPI.uploadFiles(files, (pct) => setProgress(pct));
      setResult({
        type: 'success',
        message: res.data.message || `Successfully ingested ${files.length} file(s)!`,
      });
      setFiles([]);
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.error || 'Failed to ingest files. Please try again.',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-dark text-light">
      {/* ─── Header ──────────────────────────────────────── */}
      <header className="p-3 border-bottom border-secondary-subtle bg-dark bg-opacity-75 shadow-sm" style={{ backdropFilter: 'blur(10px)' }}>
        <Container fluid className="d-flex align-items-center gap-3">
          <Database size={24} className="text-info" />
          <div>
            <h6 className="mb-0 fw-bold">Knowledge Base</h6>
            <small className="text-secondary">Train your AI with your own documents</small>
          </div>
        </Container>
      </header>

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="flex-grow-1 overflow-auto p-4">
        <Container style={{ maxWidth: '700px' }}>
          <Card 
            className={`mb-4 border-2 border-dashed bg-transparent rounded-4 transition-all ${
              isDragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'
            }`}
            style={{ cursor: 'pointer' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Card.Body className="text-center py-5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="d-none"
                accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.gif,.webp"
                onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
              />
              <div 
                className={`d-inline-flex align-items-center justify-content-center rounded-4 mb-3 transition-all ${
                  isDragOver ? 'bg-primary p-3' : 'bg-secondary bg-opacity-10 p-3'
                }`}
                style={{ width: '80px', height: '80px' }}
              >
                <CloudUpload size={40} className={isDragOver ? 'text-white' : 'text-secondary'} />
              </div>
              <h5 className="fw-bold mb-1">{isDragOver ? 'Drop them now!' : 'Click or drag files to upload'}</h5>
              <p className="text-secondary small mb-0">PDF, TXT, DOCX, PNG, JPEG (Max 25MB each)</p>
            </Card.Body>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-4">
              <h6 className="text-secondary small mb-3 fw-bold text-uppercase tracking-wider">
                Files to process ({files.length})
              </h6>
              {files.map((file, i) => {
                const Icon = getFileIcon(file.type);
                return (
                  <Card key={i} className="bg-dark border-secondary-subtle mb-2 rounded-3 animate-fade-in-up">
                    <Card.Body className="d-flex align-items-center gap-3 py-2 px-3">
                      <div className="bg-primary bg-opacity-10 rounded p-2">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="text-truncate small fw-medium">{file.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>{formatSize(file.size)}</div>
                      </div>
                      <Button 
                        variant="link" 
                        className="text-secondary p-0 hover-danger" 
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      >
                        <X size={18} />
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Progress & Results */}
          {uploading && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-secondary">Uploading & indexing...</span>
                <span className="small fw-bold text-primary">{progress}%</span>
              </div>
              <ProgressBar now={progress} variant="primary" style={{ height: '8px' }} className="rounded-pill bg-dark" />
            </div>
          )}

          {result && (
            <Alert 
              variant={result.type === 'success' ? 'success' : 'danger'} 
              className="d-flex align-items-center gap-3 border-0 rounded-4 mb-4 py-3 shadow-sm"
              style={{ 
                backgroundColor: result.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: result.type === 'success' ? '#10b981' : '#ef4444'
              }}
            >
              {result.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <div className="small fw-medium">{result.message}</div>
            </Alert>
          )}

          {/* Actions */}
          <div className="mt-5 text-center">
            {files.length > 0 && !uploading && (
              <Button 
                variant="primary" 
                onClick={handleUpload}
                id="ingest-upload-button"
                className="w-100 py-3 rounded-4 fw-bold border-0 shadow"
                style={{ background: 'linear-gradient(to right, #06b6d4, #6c5ce7)' }}
              >
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <Upload size={20} />
                  Start Ingestion Pipeline
                </div>
              </Button>
            )}

            {uploading && (
              <Button disabled className="w-100 py-3 rounded-4 border-0 bg-secondary bg-opacity-25 text-secondary">
                <Spinner animation="border" size="sm" className="me-2" />
                Processing Knowledge Base...
              </Button>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
