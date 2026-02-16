import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ThemedButton } from '../src/components/ThemedComponents';
import { addToast } from '../src/store/slices/uiSlice';
import { endpointConfigService, deriveEndpointsFromConfig } from '../src/services/EndpointConfigService';
import type {
  EndpointEnvironment,
  EndpointDefinition,
  EndpointMapping,
  HttpMethod,
  EndpointStatus,
  EnvironmentType,
} from '../types';
import {
  Globe, Plus, Trash2, Edit3, Play, Save, Upload, Download,
  CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown,
  Server, Link2, Settings2, Loader2, X, FileJson, Zap,
  Info, Eye, Code, Copy, ExternalLink, ToggleLeft, ToggleRight,
  Search,
} from 'lucide-react';

// ============================================
// SUBTAB TYPE
// ============================================
type EndpointSubtab = 'environment' | 'endpoints' | 'configuration';

// ============================================
// AUTH TYPE
// ============================================
type AuthType = 'none' | 'bearer' | 'api-key';

// ============================================
// METHOD COLOR MAP
// ============================================
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-purple-100 text-purple-700',
  DELETE: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<EndpointStatus, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  DEPRECATED: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  DISABLED: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
  TESTING: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

// ============================================
// TOOLTIP COMPONENT
// ============================================
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl whitespace-nowrap z-50 shadow-lg pointer-events-none animate-in fade-in duration-150">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
};

// ============================================
// CONFIRMATION DIALOG
// ============================================
const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onCancel}>
      <div className="bg-white rounded-4xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${confirmVariant === 'danger' ? 'bg-red-50' : 'bg-blue-50'}`}>
            <AlertTriangle size={20} className={confirmVariant === 'danger' ? 'text-red-500' : 'text-blue-500'} />
          </div>
          <h4 className="font-bold text-brand-black text-lg">{title}</h4>
        </div>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <ThemedButton variant="cancel" onClick={onCancel}>Cancel</ThemedButton>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
              confirmVariant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// IMPORT PREVIEW DIALOG
// ============================================
const ImportPreviewDialog: React.FC<{
  open: boolean;
  preview: ReturnType<typeof endpointConfigService.validateImport>;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, preview, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onCancel}>
      <div className="bg-white rounded-4xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <FileJson size={20} className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-brand-black text-lg">Import Preview</h4>
              <p className="text-xs text-gray-500 capitalize">
                Format: <span className="font-bold">{preview.format}</span>
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        {!preview.valid && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-4 flex items-center gap-3">
            <XCircle size={16} className="text-red-500 shrink-0" />
            <span className="text-sm text-red-700">{preview.error || 'Invalid import file.'}</span>
          </div>
        )}

        {preview.preview.environments.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Environments ({preview.preview.environments.length})
            </p>
            <div className="space-y-2">
              {preview.preview.environments.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Globe size={14} className="text-gray-400" />
                  <span className="text-sm font-bold text-brand-black">{e.name}</span>
                  <code className="text-xs text-gray-500 font-mono">{e.baseUrl}</code>
                  <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{e.environment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preview.preview.endpoints.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Endpoints ({preview.preview.endpoints.length})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {preview.preview.endpoints.map((ep, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${METHOD_COLORS[ep.method as HttpMethod] || 'bg-gray-100 text-gray-600'}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-brand-black">{ep.path}</code>
                  <span className="ml-auto text-xs text-gray-400 truncate max-w-37.5">{ep.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preview.preview.duplicates.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">{preview.preview.duplicates.length} Duplicate(s) Detected</span>
            </div>
            <div className="space-y-1">
              {preview.preview.duplicates.map((d, i) => (
                <p key={i} className="text-xs text-amber-600 font-mono">{d.method} {d.path}</p>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-2">Duplicates will be imported as additional entries.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <ThemedButton variant="cancel" onClick={onCancel}>Cancel</ThemedButton>
          <ThemedButton variant="primary" onClick={onConfirm} disabled={!preview.valid} icon={Upload}>
            Import {preview.preview.endpoints.length} Endpoint{preview.preview.endpoints.length !== 1 ? 's' : ''}
            {preview.preview.environments.length > 0 ? ` + ${preview.preview.environments.length} Env` : ''}
          </ThemedButton>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DIFF PREVIEW COMPONENT
// ============================================
const DiffPreview: React.FC<{
  open: boolean;
  diff: { current: { baseURL: string; apiPrefix: string }; proposed: { baseURL: string; apiPrefix: string } } | null;
  envName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, diff, envName, onConfirm, onCancel }) => {
  if (!open || !diff) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onCancel}>
      <div className="bg-white rounded-4xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-green-50"><Zap size={20} className="text-green-500" /></div>
          <div>
            <h4 className="font-bold text-brand-black text-lg">Apply Environment</h4>
            <p className="text-xs text-gray-500">Switching API client to <span className="font-bold">{envName}</span></p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Current</p>
            <code className="text-sm font-mono text-red-700">{diff.current.baseURL}{diff.current.apiPrefix}</code>
          </div>
          <div className="flex justify-center"><ChevronDown size={18} className="text-gray-300" /></div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Proposed</p>
            <code className="text-sm font-mono text-green-700">{diff.proposed.baseURL}{diff.proposed.apiPrefix}</code>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <ThemedButton variant="cancel" onClick={onCancel}>Cancel</ThemedButton>
          <button onClick={onConfirm} className="px-6 py-3 rounded-full text-sm font-bold bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200 transition-all">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CODE SNIPPET VIEWER
// ============================================
const CodeSnippetViewer: React.FC<{ open: boolean; code: string; onClose: () => void }> = ({ open, code, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-4xl p-8 max-w-3xl w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50"><Code size={20} className="text-purple-500" /></div>
            <h4 className="font-bold text-brand-black text-lg">Generated apiEndpoints.ts</h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                copied ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto bg-gray-900 text-green-400 p-6 rounded-2xl text-sm font-mono leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
};

// ============================================
// VIEW USAGE DIALOG
// ============================================
const ViewUsageDialog: React.FC<{
  open: boolean;
  mapping: EndpointMapping | null;
  onClose: () => void;
}> = ({ open, mapping, onClose }) => {
  if (!open || !mapping) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-4xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50"><Eye size={20} className="text-blue-500" /></div>
            <h4 className="font-bold text-brand-black text-lg">Usage Details</h4>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Constant</p>
            <code className="text-sm font-mono font-bold text-brand-black">{mapping.sourceConstant}</code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Path</p>
            <code className="text-sm font-mono text-brand-black">{mapping.endpointPath}</code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Used By</p>
            <p className="text-sm font-bold text-brand-black">{mapping.functionality}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Source File</p>
            <code className="text-xs font-mono text-gray-600">src/config/apiEndpoints.ts</code>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <ThemedButton variant="cancel" onClick={onClose}>Close</ThemedButton>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const EndpointsSettingsTab: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [activeSubtab, setActiveSubtab] = useState<EndpointSubtab>('environment');

  // ============================================
  // ENVIRONMENT STATE
  // ============================================
  const [environments, setEnvironments] = useState<EndpointEnvironment[]>([]);
  const [showEnvForm, setShowEnvForm] = useState(false);
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [envForm, setEnvForm] = useState({
    name: '',
    description: '',
    environment: 'development' as EnvironmentType,
    protocol: 'https://' as 'https://' | 'http://',
    baseUrl: '',
    apiPrefix: true,
    version: '/v1/',
  });

  // ============================================
  // ENDPOINTS STATE
  // ============================================
  const [endpoints, setEndpoints] = useState<EndpointDefinition[]>([]);
  const [showEndpointForm, setShowEndpointForm] = useState(false);
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(null);
  const [endpointForm, setEndpointForm] = useState({
    method: 'GET' as HttpMethod,
    environmentId: '',
    path: '',
    description: '',
    status: 'ACTIVE' as EndpointStatus,
    parameters: '',
    authType: 'none' as AuthType,
    authValue: '',
    body: '',
    script: '',
  });
  // Inline form test state
  const [formTesting, setFormTesting] = useState(false);
  const [formTestResult, setFormTestResult] = useState<{ status: number; data: unknown; duration: number } | null>(null);

  // ============================================
  // TEST STATE (table-level)
  // ============================================
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ status: number; data: unknown; duration: number } | null>(null);

  // ============================================
  // CONFIGURATION STATE
  // ============================================
  const [mappings, setMappings] = useState<EndpointMapping[]>([]);
  const [configSearch, setConfigSearch] = useState('');

  // ============================================
  // DIALOG STATE
  // ============================================
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const [importPreview, setImportPreview] = useState<{
    open: boolean;
    data: ReturnType<typeof endpointConfigService.validateImport> | null;
    rawJson: string;
  }>({ open: false, data: null, rawJson: '' });

  const [diffPreview, setDiffPreview] = useState<{
    open: boolean;
    diff: ReturnType<typeof endpointConfigService.generateDiffPreview>;
    envName: string;
    envId: string;
  }>({ open: false, diff: null, envName: '', envId: '' });

  const [codeViewer, setCodeViewer] = useState({ open: false, code: '' });
  const [usageDialog, setUsageDialog] = useState<{ open: boolean; mapping: EndpointMapping | null }>({ open: false, mapping: null });

  // ============================================
  // IMPORT REF
  // ============================================
  const importFileRef = useRef<HTMLInputElement>(null);

  // ============================================
  // LOAD DATA
  // ============================================
  const loadData = useCallback(() => {
    setEnvironments(endpointConfigService.getEnvironments());
    setEndpoints(endpointConfigService.getEndpoints());
    setMappings(endpointConfigService.getAutoMappings());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ============================================
  // URL VALIDATION
  // ============================================
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    return /^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/.test(url);
  };

  // ============================================
  // ENVIRONMENT HANDLERS
  // ============================================
  const resetEnvForm = () => {
    setEnvForm({ name: '', description: '', environment: 'development', protocol: 'https://', baseUrl: '', apiPrefix: true, version: '/v1/' });
    setEditingEnvId(null);
    setShowEnvForm(false);
  };

  const handleSaveEnvironment = () => {
    if (!envForm.name.trim() || !envForm.baseUrl.trim()) {
      dispatch(addToast({ message: 'Name and Base URL are required.', type: 'error', duration: 4000 }));
      return;
    }
    if (!isValidUrl(envForm.baseUrl)) {
      dispatch(addToast({ message: 'Please enter a valid Base URL.', type: 'error', duration: 4000 }));
      return;
    }
    if (editingEnvId) {
      endpointConfigService.updateEnvironment(editingEnvId, envForm);
      dispatch(addToast({ message: 'Environment updated.', type: 'success', duration: 3000 }));
    } else {
      endpointConfigService.saveEnvironment(envForm);
      dispatch(addToast({ message: 'Environment created.', type: 'success', duration: 3000 }));
    }
    loadData();
    resetEnvForm();
  };

  const handleEditEnvironment = (env: EndpointEnvironment) => {
    setEnvForm({
      name: env.name,
      description: env.description,
      environment: env.environment,
      protocol: env.protocol,
      baseUrl: env.baseUrl,
      apiPrefix: env.apiPrefix,
      version: env.version,
    });
    setEditingEnvId(env.id);
    setShowEnvForm(true);
  };

  const handleDeleteEnvironment = (id: string) => {
    const env = environments.find(e => e.id === id);
    setConfirmDialog({
      open: true,
      title: 'Delete Environment',
      message: `Are you sure you want to delete "${env?.name || 'this environment'}"? All endpoints linked to this environment will also be removed. This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      onConfirm: () => {
        endpointConfigService.deleteEnvironment(id);
        dispatch(addToast({ message: 'Environment deleted.', type: 'success', duration: 3000 }));
        loadData();
        setConfirmDialog(d => ({ ...d, open: false }));
      },
    });
  };

  const handleApplyEnvironment = (id: string) => {
    const env = environments.find(e => e.id === id);
    const diff = endpointConfigService.generateDiffPreview(id);
    setDiffPreview({ open: true, diff, envName: env?.name || '', envId: id });
  };

  const confirmApplyEnvironment = () => {
    const ok = endpointConfigService.applyEnvironment(diffPreview.envId);
    dispatch(addToast({
      message: ok ? 'Environment applied to API client.' : 'Failed to apply environment.',
      type: ok ? 'success' : 'error',
      duration: 3000,
    }));
    setDiffPreview({ open: false, diff: null, envName: '', envId: '' });
    loadData();
  };

  // ============================================
  // ENDPOINT HANDLERS
  // ============================================
  const resetEndpointForm = () => {
    setEndpointForm({ method: 'GET', environmentId: '', path: '', description: '', status: 'ACTIVE', parameters: '', authType: 'none', authValue: '', body: '', script: '' });
    setEditingEndpointId(null);
    setShowEndpointForm(false);
    setFormTesting(false);
    setFormTestResult(null);
  };

  const handleSaveEndpoint = () => {
    if (!endpointForm.path.trim()) {
      dispatch(addToast({ message: 'Endpoint path is required.', type: 'error', duration: 4000 }));
      return;
    }
    const authString = endpointForm.authType === 'none'
      ? 'None'
      : endpointForm.authType === 'bearer'
        ? `Bearer Token: ${endpointForm.authValue}`
        : `API Key: ${endpointForm.authValue}`;

    const payload = {
      method: endpointForm.method,
      environmentId: endpointForm.environmentId,
      path: endpointForm.path,
      description: endpointForm.description,
      status: endpointForm.status,
      parameters: endpointForm.parameters || undefined,
      authentication: authString,
      body: endpointForm.body || undefined,
      script: endpointForm.script || undefined,
    };

    if (editingEndpointId) {
      endpointConfigService.updateEndpoint(editingEndpointId, payload);
      dispatch(addToast({ message: 'Endpoint updated.', type: 'success', duration: 3000 }));
    } else {
      endpointConfigService.saveEndpoint(payload as Omit<EndpointDefinition, 'id'>);
      dispatch(addToast({ message: 'Endpoint added.', type: 'success', duration: 3000 }));
    }
    loadData();
    resetEndpointForm();
  };

  const handleEditEndpoint = (ep: EndpointDefinition) => {
    let authType: AuthType = 'none';
    let authValue = '';
    if (ep.authentication) {
      if (ep.authentication.startsWith('Bearer Token:')) {
        authType = 'bearer';
        authValue = ep.authentication.replace('Bearer Token:', '').trim();
      } else if (ep.authentication.startsWith('API Key:')) {
        authType = 'api-key';
        authValue = ep.authentication.replace('API Key:', '').trim();
      }
    }
    setEndpointForm({
      method: ep.method,
      environmentId: ep.environmentId,
      path: ep.path,
      description: ep.description,
      status: ep.status,
      parameters: ep.parameters || '',
      authType,
      authValue,
      body: ep.body || '',
      script: ep.script || '',
    });
    setEditingEndpointId(ep.id);
    setShowEndpointForm(true);
    setFormTestResult(null);
  };

  const handleDeleteEndpoint = (id: string) => {
    const ep = endpoints.find(e => e.id === id);
    setConfirmDialog({
      open: true,
      title: 'Delete Endpoint',
      message: `Are you sure you want to delete "${ep?.method} ${ep?.path || 'this endpoint'}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
      onConfirm: () => {
        endpointConfigService.deleteEndpoint(id);
        dispatch(addToast({ message: 'Endpoint deleted.', type: 'success', duration: 3000 }));
        loadData();
        setConfirmDialog(d => ({ ...d, open: false }));
      },
    });
  };

  const handleToggleStatus = (ep: EndpointDefinition) => {
    const newStatus: EndpointStatus = ep.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    endpointConfigService.updateEndpoint(ep.id, { status: newStatus });
    loadData();
  };

  const buildEndpointUrl = (ep: { environmentId: string; path: string }) => {
    const env = environments.find(e => e.id === ep.environmentId);
    if (env) {
      const prefix = env.apiPrefix ? '/api' : '';
      const version = env.version && env.version !== '/' ? env.version : '';
      return `${env.protocol}${env.baseUrl}${prefix}${version}${ep.path}`;
    }
    const { baseURL, apiPrefix } = endpointConfigService.getCurrentClientConfig();
    return `${baseURL}${apiPrefix}${ep.path}`;
  };

  const handleTestEndpoint = async (ep: EndpointDefinition) => {
    setTestingId(ep.id);
    setTestResult(null);
    const fullUrl = buildEndpointUrl(ep);
    const result = await endpointConfigService.testEndpoint(ep.method, fullUrl, { body: ep.body || undefined });
    setTestResult(result);
    endpointConfigService.updateEndpoint(ep.id, {
      lastTested: new Date().toISOString(),
      lastTestResult: result.status >= 200 && result.status < 400 ? 'success' : 'failure',
    });
    setTestingId(null);
    loadData();
  };

  const handleFormTest = async () => {
    setFormTesting(true);
    setFormTestResult(null);
    const fullUrl = buildEndpointUrl(endpointForm);
    const result = await endpointConfigService.testEndpoint(endpointForm.method, fullUrl, { body: endpointForm.body || undefined });
    setFormTestResult(result);
    setFormTesting(false);
  };

  // ============================================
  // IMPORT HANDLER (with preview)
  // ============================================
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const validation = endpointConfigService.validateImport(text);
      setImportPreview({ open: true, data: validation, rawJson: text });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!importPreview.data || !importPreview.data.valid) return;
    if (importPreview.data.format === 'postman') {
      const envId = environments.length > 0 ? environments[0].id : '';
      const result = endpointConfigService.importFromPostman(importPreview.rawJson, envId);
      if (result.success) {
        dispatch(addToast({ message: `Imported ${result.count} endpoints from Postman collection.`, type: 'success', duration: 5000 }));
        loadData();
      } else {
        dispatch(addToast({ message: `Import failed: ${result.error}`, type: 'error', duration: 5000 }));
      }
    } else {
      const result = endpointConfigService.importConfig(importPreview.rawJson);
      if (result.success) {
        dispatch(addToast({ message: 'Configuration imported successfully.', type: 'success', duration: 5000 }));
        loadData();
      } else {
        dispatch(addToast({ message: `Import failed: ${result.error}`, type: 'error', duration: 5000 }));
      }
    }
    setImportPreview({ open: false, data: null, rawJson: '' });
  };

  const handleExport = () => {
    const json = endpointConfigService.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `busbudd-endpoints-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(addToast({ message: 'Configuration exported.', type: 'success', duration: 3000 }));
  };

  const buildFullUrl = (env: EndpointEnvironment) => {
    const prefix = env.apiPrefix ? '/api' : '';
    const version = env.version && env.version !== '/' ? env.version : '';
    return `${env.protocol}${env.baseUrl}${prefix}${version}`;
  };

  const handleViewCode = () => {
    const code = endpointConfigService.generateTypeScriptCode();
    setCodeViewer({ open: true, code });
  };

  const filteredMappings = configSearch.trim()
    ? mappings.filter(m =>
        m.endpointPath.toLowerCase().includes(configSearch.toLowerCase()) ||
        m.sourceConstant.toLowerCase().includes(configSearch.toLowerCase()) ||
        m.functionality.toLowerCase().includes(configSearch.toLowerCase())
      )
    : mappings;

  // ============================================
  // RENDER: SUBTAB NAVIGATION
  // ============================================
  const subtabs: { key: EndpointSubtab; label: string; icon: React.FC<any> }[] = [
    { key: 'environment', label: 'Environment', icon: Globe },
    { key: 'endpoints', label: 'Endpoints', icon: Link2 },
    { key: 'configuration', label: 'Configuration', icon: Settings2 },
  ];

  // ============================================
  // STYLES (reusable)
  // ============================================
  const inputClass = 'w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all outline-none';
  const labelClass = 'text-xs font-bold text-gray-400 uppercase tracking-widest ml-1';
  const selectClass = 'bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all outline-none appearance-none cursor-pointer';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hidden import input */}
      <input type="file" ref={importFileRef} onChange={handleImportFile} accept=".json" className="hidden" />

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, open: false }))}
      />
      {importPreview.data && (
        <ImportPreviewDialog
          open={importPreview.open}
          preview={importPreview.data}
          onConfirm={confirmImport}
          onCancel={() => setImportPreview({ open: false, data: null, rawJson: '' })}
        />
      )}
      <DiffPreview
        open={diffPreview.open}
        diff={diffPreview.diff}
        envName={diffPreview.envName}
        onConfirm={confirmApplyEnvironment}
        onCancel={() => setDiffPreview({ open: false, diff: null, envName: '', envId: '' })}
      />
      <CodeSnippetViewer
        open={codeViewer.open}
        code={codeViewer.code}
        onClose={() => setCodeViewer({ open: false, code: '' })}
      />
      <ViewUsageDialog
        open={usageDialog.open}
        mapping={usageDialog.mapping}
        onClose={() => setUsageDialog({ open: false, mapping: null })}
      />

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-brand-black flex items-center gap-3">
            <Server className="text-blue-500" size={24} /> API Endpoints Configuration
          </h3>
          <p className="text-gray-500 text-sm mt-1">Manage environments, endpoints, and endpoint-to-feature mappings.</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemedButton variant="ghost" onClick={() => importFileRef.current?.click()} icon={Upload}>
            Import
          </ThemedButton>
          <ThemedButton variant="ghost" onClick={handleExport} icon={Download}>
            Export
          </ThemedButton>
        </div>
      </div>

      {/* Subtab Pills */}
      <div className="flex p-1 bg-gray-50 rounded-2xl w-fit border border-gray-100">
        {subtabs.map(st => (
          <button
            key={st.key}
            onClick={() => setActiveSubtab(st.key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeSubtab === st.key
                ? 'bg-white text-brand-black shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <st.icon size={16} />
            {st.label}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* ENVIRONMENT SUBTAB */}
      {/* ============================================ */}
      {activeSubtab === 'environment' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Current ApiClient Config Badge */}
          {(() => {
            const cfg = endpointConfigService.getCurrentClientConfig();
            return (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Zap size={16} className="text-blue-600 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold text-blue-800">Active API Client:</span>{' '}
                  <code className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg text-xs font-mono">{cfg.baseURL}{cfg.apiPrefix}</code>
                </div>
              </div>
            );
          })()}

          {/* Env Cards */}
          {environments.length > 0 && (
            <div className="grid gap-4">
              {environments.map(env => (
                <div key={env.id} className="p-6 bg-white rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-brand-black text-lg">{env.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          env.environment === 'production' ? 'bg-red-50 text-red-600' :
                          env.environment === 'staging' ? 'bg-amber-50 text-amber-600' :
                          env.environment === 'development' ? 'bg-green-50 text-green-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>{env.environment}</span>
                      </div>
                      {env.description && <p className="text-sm text-gray-500 mt-1">{env.description}</p>}
                      <code className="text-xs font-mono text-gray-500 mt-2 block bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                        {buildFullUrl(env)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Tooltip text="Apply to API Client">
                        <button onClick={() => handleApplyEnvironment(env.id)} className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                          <Zap size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Edit">
                        <button onClick={() => handleEditEnvironment(env)} className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                          <Edit3 size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Delete">
                        <button onClick={() => handleDeleteEnvironment(env.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Environment Form */}
          {showEnvForm ? (
            <div className="p-8 bg-gray-50 rounded-4xl border border-gray-200 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-brand-black text-lg">{editingEnvId ? 'Edit Environment' : 'New Environment'}</h4>
                <button onClick={resetEnvForm} className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 transition-colors"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>Name</label>
                    <Tooltip text="A friendly name for this environment (e.g. Production API, Staging Server)">
                      <Info size={12} className="text-gray-300 cursor-help" />
                    </Tooltip>
                  </div>
                  <input type="text" className={inputClass} placeholder="e.g. Production API" value={envForm.name} onChange={e => setEnvForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>Environment</label>
                    <Tooltip text="The deployment stage this environment represents">
                      <Info size={12} className="text-gray-300 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <select className={`${selectClass} w-full pr-10`} value={envForm.environment} onChange={e => setEnvForm(f => ({ ...f, environment: e.target.value as EnvironmentType }))}>
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                      <option value="custom">Custom</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className={labelClass}>Description</label>
                  <Tooltip text="Brief description of what this environment is used for">
                    <Info size={12} className="text-gray-300 cursor-help" />
                  </Tooltip>
                </div>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="Brief description of this environment"
                  value={envForm.description}
                  onChange={e => setEnvForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className={labelClass}>Base URL</label>
                  <Tooltip text="The root domain/server address without protocol or path prefix">
                    <Info size={12} className="text-gray-300 cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <select className={`${selectClass} pr-10`} value={envForm.protocol} onChange={e => setEnvForm(f => ({ ...f, protocol: e.target.value as 'https://' | 'http://' }))}>
                      <option value="https://">https://</option>
                      <option value="http://">http://</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      className={`${inputClass} ${envForm.baseUrl && !isValidUrl(envForm.baseUrl) ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
                      placeholder="corporate.little.africa/new_backend"
                      value={envForm.baseUrl}
                      onChange={e => setEnvForm(f => ({ ...f, baseUrl: e.target.value }))}
                    />
                    {envForm.baseUrl && !isValidUrl(envForm.baseUrl) && (
                      <p className="text-xs text-red-500 mt-1 ml-1">Invalid URL format</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>/api/ Prefix</label>
                    <Tooltip text="Include /api/ path segment between the base URL and the API version">
                      <Info size={12} className="text-gray-300 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
                    <span className="text-sm font-bold text-brand-black">Include <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/api/</code> prefix</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={envForm.apiPrefix} onChange={e => setEnvForm(f => ({ ...f, apiPrefix: e.target.checked }))} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>API Version</label>
                    <Tooltip text="Version path segment appended after the prefix (e.g. /v1/, /v2/)">
                      <Info size={12} className="text-gray-300 cursor-help" />
                    </Tooltip>
                  </div>
                  <input type="text" className={inputClass} placeholder="/v1/" value={envForm.version} onChange={e => setEnvForm(f => ({ ...f, version: e.target.value }))} />
                </div>
              </div>

              {/* Constructed URL Preview */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Constructed Base URL</p>
                <code className="text-sm font-mono text-brand-black break-all">
                  {envForm.protocol}{envForm.baseUrl || '...'}{envForm.apiPrefix ? '/api' : ''}{envForm.version || ''}
                </code>
              </div>

              <div className="flex justify-end gap-3">
                <ThemedButton variant="cancel" onClick={resetEnvForm}>Cancel</ThemedButton>
                <ThemedButton variant="primary" onClick={handleSaveEnvironment} icon={Save}>
                  {editingEnvId ? 'Update Environment' : 'Save Environment'}
                </ThemedButton>
              </div>
            </div>
          ) : (
            <ThemedButton variant="ghost" onClick={() => setShowEnvForm(true)} icon={Plus} fullWidth className="py-4 border-2 border-dashed border-gray-300">
              Add Environment
            </ThemedButton>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* ENDPOINTS SUBTAB */}
      {/* ============================================ */}
      {activeSubtab === 'endpoints' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-gray-500">
              {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} configured
            </div>
            <div className="flex items-center gap-3">
              <ThemedButton variant="ghost" onClick={() => importFileRef.current?.click()} icon={FileJson}>
                Import JSON
              </ThemedButton>
              <ThemedButton variant="primary" onClick={() => { resetEndpointForm(); setShowEndpointForm(true); }} icon={Plus}>
                Add Endpoint
              </ThemedButton>
            </div>
          </div>

          {/* Endpoints Table */}
          {endpoints.length > 0 && (
            <div className="overflow-hidden rounded-4xl border border-gray-100 shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Endpoint</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {endpoints.map(ep => {
                      const env = environments.find(e => e.id === ep.environmentId);
                      const statusStyle = STATUS_COLORS[ep.status];
                      return (
                        <tr key={ep.id} className={`hover:bg-gray-50/50 transition-colors ${ep.status === 'DISABLED' ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 min-w-0">
                              {env && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg shrink-0">{env.name}</span>}
                              <code className="text-sm font-mono font-bold text-brand-black truncate">{ep.path}</code>
                            </div>
                            {ep.lastTested && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Clock size={10} className="text-gray-300" />
                                <span className="text-[10px] text-gray-400">Tested {new Date(ep.lastTested).toLocaleDateString()}</span>
                                {ep.lastTestResult === 'success' && <CheckCircle size={10} className="text-green-500" />}
                                {ep.lastTestResult === 'failure' && <XCircle size={10} className="text-red-500" />}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{ep.description || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(ep)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 ${statusStyle.bg} ${statusStyle.text} ${
                                ep.status === 'ACTIVE' ? 'hover:ring-green-200' : 'hover:ring-gray-200'
                              }`}
                              title={`Click to ${ep.status === 'ACTIVE' ? 'disable' : 'enable'}`}
                            >
                              {ep.status === 'ACTIVE' ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                              {ep.status}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip text="Test endpoint">
                                <button
                                  onClick={() => handleTestEndpoint(ep)}
                                  disabled={testingId === ep.id}
                                  className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  {testingId === ep.id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                </button>
                              </Tooltip>
                              <Tooltip text="Edit">
                                <button onClick={() => handleEditEndpoint(ep)} className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                                  <Edit3 size={14} />
                                </button>
                              </Tooltip>
                              <Tooltip text="Delete">
                                <button onClick={() => handleDeleteEndpoint(ep.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {endpoints.length === 0 && !showEndpointForm && (
            <div className="text-center py-16 text-gray-400">
              <Link2 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No endpoints configured</p>
              <p className="text-sm mt-1">Add endpoints manually or import from a JSON / Postman collection.</p>
            </div>
          )}

          {/* Test Result Panel */}
          {testResult && (
            <div className={`p-6 rounded-4xl border ${testResult.status >= 200 && testResult.status < 400 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testResult.status >= 200 && testResult.status < 400
                    ? <CheckCircle size={20} className="text-green-600" />
                    : <XCircle size={20} className="text-red-600" />
                  }
                  <span className="font-bold text-brand-black">
                    Status: {testResult.status || 'Network Error'}
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{testResult.duration}ms</span>
                </div>
                <button onClick={() => setTestResult(null)} className="p-1.5 rounded-lg hover:bg-white/50 text-gray-400 transition-colors"><X size={16} /></button>
              </div>
              <pre className="text-xs font-mono bg-white/80 p-4 rounded-xl overflow-auto max-h-48 text-gray-700">
                {typeof testResult.data === 'string' ? testResult.data : JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Add / Edit Endpoint Form */}
          {showEndpointForm && (
            <div className="p-8 bg-gray-50 rounded-4xl border border-gray-200 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-brand-black text-lg">{editingEndpointId ? 'Edit Endpoint' : 'New Endpoint'}</h4>
                <button onClick={resetEndpointForm} className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 transition-colors"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Method */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>Method</label>
                    <Tooltip text="HTTP request method"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                  </div>
                  <div className="relative">
                    <select className={`${selectClass} w-full pr-10`} value={endpointForm.method} onChange={e => setEndpointForm(f => ({ ...f, method: e.target.value as HttpMethod }))}>
                      {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Environment (Base URL) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>Base URL (Environment)</label>
                    <Tooltip text="Select an environment or use the default API client"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                  </div>
                  <div className="relative">
                    <select
                      className={`${selectClass} w-full pr-10`}
                      value={endpointForm.environmentId}
                      onChange={e => setEndpointForm(f => ({ ...f, environmentId: e.target.value }))}
                    >
                      <option value="">— Default ApiClient —</option>
                      {environments.map(env => (
                        <option key={env.id} value={env.id}>{env.name} ({buildFullUrl(env)})</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className={labelClass}>Status</label>
                  <div className="relative">
                    <select className={`${selectClass} w-full pr-10`} value={endpointForm.status} onChange={e => setEndpointForm(f => ({ ...f, status: e.target.value as EndpointStatus }))}>
                      {(['ACTIVE', 'TESTING', 'DEPRECATED', 'DISABLED'] as EndpointStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Path */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className={labelClass}>Endpoint Path</label>
                  <Tooltip text="The URL path relative to the base URL (e.g. /schools, /drivers/:id)"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  {endpointForm.environmentId && environments.find(e => e.id === endpointForm.environmentId) && (
                    <span className="text-xs font-mono text-gray-400 bg-white px-3 py-3.5 rounded-2xl border border-gray-200 shrink-0">
                      {buildFullUrl(environments.find(e => e.id === endpointForm.environmentId)!)}
                    </span>
                  )}
                  <input type="text" className={`${inputClass} flex-1`} placeholder="/schools" value={endpointForm.path} onChange={e => setEndpointForm(f => ({ ...f, path: e.target.value }))} />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="What does this endpoint do?"
                  value={endpointForm.description}
                  onChange={e => setEndpointForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Authentication Dropdown + Value */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Authentication</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className={labelClass}>Auth Type</label>
                      <Tooltip text="Authentication method used for this endpoint"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                    </div>
                    <div className="relative">
                      <select
                        className={`${selectClass} w-full pr-10`}
                        value={endpointForm.authType}
                        onChange={e => setEndpointForm(f => ({ ...f, authType: e.target.value as AuthType }))}
                      >
                        <option value="none">None</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="api-key">API Key</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {endpointForm.authType !== 'none' && (
                    <div className="space-y-2">
                      <label className={labelClass}>{endpointForm.authType === 'bearer' ? 'Token' : 'API Key Value'}</label>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder={endpointForm.authType === 'bearer' ? 'eyJhbGciOiJIUzI1NiIs...' : 'your-api-key-here'}
                        value={endpointForm.authValue}
                        onChange={e => setEndpointForm(f => ({ ...f, authValue: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Optional Fields</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className={labelClass}>Parameters (JSON)</label>
                      <Tooltip text="Query parameters or path parameters as JSON"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                    </div>
                    <textarea
                      className={`${inputClass} resize-none font-mono text-xs`}
                      rows={3}
                      placeholder='{"key": "value"}'
                      value={endpointForm.parameters}
                      onChange={e => setEndpointForm(f => ({ ...f, parameters: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className={labelClass}>Body (JSON)</label>
                      <Tooltip text="Request body payload as JSON (for POST/PUT/PATCH)"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                    </div>
                    <textarea
                      className={`${inputClass} resize-none font-mono text-xs`}
                      rows={3}
                      placeholder='{"field": "value"}'
                      value={endpointForm.body}
                      onChange={e => setEndpointForm(f => ({ ...f, body: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={labelClass}>Pre/Post Script</label>
                    <Tooltip text="JavaScript that runs before the request or tests the response"><Info size={12} className="text-gray-300 cursor-help" /></Tooltip>
                  </div>
                  <textarea
                    className={`${inputClass} resize-none font-mono text-xs`}
                    rows={3}
                    placeholder="// Pre-request or test script"
                    value={endpointForm.script}
                    onChange={e => setEndpointForm(f => ({ ...f, script: e.target.value }))}
                  />
                </div>
              </div>

              {/* Inline Form Test Result */}
              {formTestResult && (
                <div className={`p-4 rounded-2xl border ${formTestResult.status >= 200 && formTestResult.status < 400 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {formTestResult.status >= 200 && formTestResult.status < 400
                        ? <CheckCircle size={16} className="text-green-600" />
                        : <XCircle size={16} className="text-red-600" />
                      }
                      <span className="text-sm font-bold text-brand-black">Status: {formTestResult.status || 'Error'}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{formTestResult.duration}ms</span>
                    </div>
                    <button onClick={() => setFormTestResult(null)} className="p-1 rounded-lg hover:bg-white/50 text-gray-400"><X size={14} /></button>
                  </div>
                  <pre className="text-xs font-mono bg-white/80 p-3 rounded-xl overflow-auto max-h-32 text-gray-700">
                    {typeof formTestResult.data === 'string' ? formTestResult.data : JSON.stringify(formTestResult.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <ThemedButton variant="cancel" onClick={resetEndpointForm}>Cancel</ThemedButton>
                <ThemedButton
                  variant="ghost"
                  onClick={handleFormTest}
                  icon={formTesting ? Loader2 : Play}
                  disabled={formTesting || !endpointForm.path.trim()}
                >
                  {formTesting ? 'Testing...' : 'Test'}
                </ThemedButton>
                <ThemedButton variant="primary" onClick={handleSaveEndpoint} icon={Save}>
                  {editingEndpointId ? 'Update Endpoint' : 'Save Endpoint'}
                </ThemedButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* CONFIGURATION SUBTAB */}
      {/* ============================================ */}
      {activeSubtab === 'configuration' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-gray-500">
              {filteredMappings.length} endpoint mapping{filteredMappings.length !== 1 ? 's' : ''} derived from <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">apiEndpoints.ts</code>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-lilac/10 focus:border-brand-lilac transition-all outline-none w-56"
                  placeholder="Search mappings..."
                  value={configSearch}
                  onChange={e => setConfigSearch(e.target.value)}
                />
              </div>
              <Tooltip text="Generate TypeScript code for apiEndpoints.ts">
                <ThemedButton variant="ghost" onClick={handleViewCode} icon={Code}>
                  View Code
                </ThemedButton>
              </Tooltip>
            </div>
          </div>

          {filteredMappings.length > 0 && (
            <div className="overflow-hidden rounded-4xl border border-gray-100 shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Endpoint</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Functionality</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMappings.map(m => {
                      const parts = m.sourceConstant.split('.');
                      const key = parts[parts.length - 1].replace('(:id)', '');
                      const method = endpointConfigService.inferMethod(key);
                      return (
                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${METHOD_COLORS[method]}`}>{method}</span>
                              <code className="text-sm font-mono font-bold text-brand-black">{m.endpointPath}</code>
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">{m.sourceConstant}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{m.description}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-brand-black">{m.functionality}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip text="View usage details">
                                <button
                                  onClick={() => setUsageDialog({ open: true, mapping: m })}
                                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                              </Tooltip>
                              <Tooltip text="Copy constant reference">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(m.sourceConstant);
                                    dispatch(addToast({ message: `Copied: ${m.sourceConstant}`, type: 'success', duration: 2000 }));
                                  }}
                                  className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                >
                                  <ExternalLink size={14} />
                                </button>
                              </Tooltip>
                              <Tooltip text="Create endpoint from mapping">
                                <button
                                  onClick={() => {
                                    setEndpointForm({
                                      method,
                                      environmentId: '',
                                      path: m.endpointPath,
                                      description: m.description,
                                      status: 'ACTIVE',
                                      parameters: '',
                                      authType: 'none',
                                      authValue: '',
                                      body: '',
                                      script: '',
                                    });
                                    setShowEndpointForm(true);
                                    setActiveSubtab('endpoints');
                                  }}
                                  className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredMappings.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Settings2 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">{configSearch ? 'No matching mappings' : 'No mappings found'}</p>
              <p className="text-sm mt-1">
                {configSearch
                  ? 'Try a different search term.'
                  : 'Endpoint mappings are auto-derived from apiEndpoints.ts.'
                }
              </p>
            </div>
          )}

          {/* Usage Warnings */}
          {(() => {
            const warnings = endpointConfigService.getUsageWarnings();
            if (warnings.length === 0) return null;
            return (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-amber-700">Usage Warnings ({warnings.length})</span>
                </div>
                <div className="space-y-2">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${w.type === 'unused' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                        {w.type}
                      </span>
                      <span>{w.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default EndpointsSettingsTab;
