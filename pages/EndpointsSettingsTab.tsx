import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { ThemedButton, ThemedInput, ThemedLogo, ThemedLink } from '../src/components/ThemedComponents';
import { useTheme } from '../src/hooks/useTheme';
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
  CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronUp,
  Server, Link2, Settings2, Loader2, X, FileJson, Zap,
  Info, Eye, Code, Copy, ExternalLink, ToggleLeft, ToggleRight,
  Search, Layers, MousePointerClick, FormInput, Table2, LayoutGrid,
  FileCode2, GripVertical,
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
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onCancel}>
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
    </div>,
    document.body
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
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onCancel}>
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
    </div>,
    document.body
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
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onCancel}>
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
    </div>,
    document.body
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

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onClose}>
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
    </div>,
    document.body
  );
};

// ============================================
// PAGE → FILE MAPPING (shared constant)
// ============================================
const PAGE_FILE_MAP: Record<string, string> = {
  LoginPage: 'pages/LoginPage.tsx',
  Layout: 'components/Layout.tsx',
  App: 'App.tsx',
  Dashboard: 'pages/Dashboard.tsx',
  SchoolsPage: 'pages/SchoolsPage.tsx',
  DriversPage: 'pages/DriversPage.tsx',
  RoutesPage: 'pages/RoutesPage.tsx',
  TripsPage: 'pages/TripsPage.tsx',
  StudentsPage: 'pages/StudentsPage.tsx',
  AssignmentsPage: 'pages/AssignmentsPage.tsx',
  ShiftsPage: 'pages/ShiftsPage.tsx',
  NotificationsPage: 'pages/NotificationsPage.tsx',
  SettingsPage: 'pages/SettingsPage.tsx',
  OperationsPage: 'pages/OperationsPage.tsx',
  ApiClient: 'src/services/ApiClient.ts',
};

const ALL_PAGE_NAMES = Object.keys(PAGE_FILE_MAP);

// ============================================
// VISUAL WIREFRAME RENDERER
// Renders actual themed UI components with 1:1 parity to real pages
// API-calling elements are highlighted with click-to-reveal metadata
// ============================================

/** Highlighted API-call element with click-to-reveal endpoint metadata */
const ApiCallHighlight: React.FC<{
  constant: string;
  method: string;
  path: string;
  hasParam: boolean;
  consumers: number;
  children: React.ReactNode;
}> = ({ constant, method, path, hasParam, consumers, children }) => {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <div className="relative">
      <div
        className="relative group cursor-pointer"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetail(prev => !prev); }}
      >
        <div className="absolute -inset-1 bg-green-400/20 rounded-2xl blur-sm group-hover:bg-green-400/30 transition-all" />
        <div className="relative ring-2 ring-green-400 rounded-2xl overflow-hidden">
          {children}
          <div className="absolute -top-0.5 -right-0.5 flex items-center gap-1 px-2 py-0.5 rounded-bl-lg rounded-tr-2xl bg-green-500 text-white text-[9px] font-bold shadow-sm">
            <Zap size={8} /> API Call
          </div>
        </div>
      </div>
      {showDetail && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-brand-black">Endpoint Details</p>
            <button onClick={(e) => { e.stopPropagation(); setShowDetail(false); }} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={12} /></button>
          </div>
          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">API Constant</p>
              <code className="text-xs font-mono font-bold text-indigo-700">{constant}</code>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Method</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${METHOD_COLORS[method.toUpperCase() as HttpMethod] || 'bg-gray-100 text-gray-700'}`}>
                  {method.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Parameters</p>
                <span className="text-xs text-gray-700">{hasParam ? 'Dynamic (:id)' : 'None'}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Consumers</p>
                <span className="text-xs font-bold text-gray-700">{consumers} page{consumers !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Endpoint Path</p>
              <code className="text-xs font-mono text-gray-600">{path}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Auto-fetch indicator for data-loading endpoints */
const WireAutoFetch: React.FC<{ constant: string }> = ({ constant }) => (
  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
      <Zap size={14} className="text-amber-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-amber-700">Auto-fetched on page load</p>
      <p className="text-[10px] text-amber-600 font-mono truncate">useEffect → {constant}</p>
    </div>
    <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold shrink-0">
      <Zap size={8} /> API Call
    </span>
  </div>
);

/** Visual wireframe using actual themed components for 1:1 page parity */
const VisualWireframe: React.FC<{
  sourceConstant: string;
  pageName: string;
  featureDesc: string;
  methodStr: string;
  endpointPath: string;
  hasParam: boolean;
  consumers: number;
}> = ({ sourceConstant, pageName, featureDesc, methodStr, endpointPath, hasParam, consumers }) => {
  const { colors } = useTheme();
  const key = sourceConstant.split('.').pop()?.toUpperCase() || '';
  const meta = { constant: sourceConstant, method: methodStr, path: endpointPath, hasParam, consumers };

  // ---- AUTH: Login / Verify / Forgot / Reset ----
  if (key.includes('LOGIN') || key.includes('VERIFY') || key.includes('RESEND') || key.includes('FORGOT') || key.includes('RESET')) {
    const isLogin = key.includes('LOGIN');
    const isForgot = key.includes('FORGOT') || key.includes('RESET');
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
        {/* Logo + Heading — matches LoginPage.tsx renderLogin() */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-surface mb-6 shadow-sm">
            <ThemedLogo size={32} />
          </div>
          <h2 className="text-3xl font-bold text-brand-black mb-2">
            {isForgot ? 'Forgot Password?' : isLogin ? 'Login to your account' : 'Verify Account'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isForgot ? "Enter your email and we'll send you a recovery code." : isLogin ? 'Unlock Your Progress - Securely Access Your Dashboard!' : 'Enter the verification code sent to your email'}
          </p>
        </div>

        <div className="space-y-6">
          {isForgot ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
              <ThemedInput type="email" placeholder="name@school.com" readOnly tabIndex={-1} />
            </div>
          ) : isLogin ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
                <ThemedInput type="email" placeholder="name@school.com" readOnly tabIndex={-1} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <ThemedInput type="password" placeholder="••••••••" readOnly tabIndex={-1} className="pr-12" />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                    <Eye size={20} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-default">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" style={{ accentColor: colors.primary }} readOnly tabIndex={-1} />
                  <span className="text-sm font-medium text-gray-500">Remember for 30 days</span>
                </label>
                <ThemedLink className="text-sm">Forgot password</ThemedLink>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Verification Code <span className="text-red-500">*</span></label>
              <ThemedInput type="text" placeholder="Enter 6-digit code" readOnly tabIndex={-1} />
            </div>
          )}

          {/* Submit button — highlighted as API call */}
          <ApiCallHighlight {...meta}>
            <button
              type="button"
              className="w-full py-4 text-white rounded-full font-bold text-sm flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
              tabIndex={-1}
            >
              {featureDesc || (isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Verify')}
            </button>
          </ApiCallHighlight>

          {/* Google Sign-in (for login only) */}
          {isLogin && (
            <button type="button" className="w-full py-4 bg-white border border-gray-200 text-brand-black rounded-full font-bold text-sm flex items-center justify-center gap-3" tabIndex={-1}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>

        {/* Demo section (for login only) */}
        {isLogin && (
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="text-center text-sm font-medium text-gray-500 mb-6">
              Don't have an account? <ThemedLink className="text-sm">Sign up</ThemedLink>
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Or Quick Access (Demo)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Amina', role: 'Super', color: 'bg-brand-black' },
                { name: 'Kevin', role: 'Admin', color: 'bg-brand-green' },
                { name: 'Principal', role: 'School', color: 'bg-brand-amber' },
              ].map(u => (
                <div key={u.name} className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl bg-gray-50 border border-transparent">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${u.color}`}>
                    <Globe size={16} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-brand-black">{u.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- LOGOUT ----
  if (key.includes('LOGOUT')) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-w-md mx-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <ThemedLogo size={24} />
            <div className="h-3 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-12 bg-gray-200 rounded-full" />
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">AO</div>
          </div>
        </div>
        <div className="p-4">
          <div className="border border-gray-200 rounded-xl p-1 space-y-0.5 max-w-45 ml-auto">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600"><Settings2 size={12} /> Settings</div>
            <div className="border-t border-gray-100 my-1" />
            <ApiCallHighlight {...meta}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-xs text-red-600 font-bold"><ExternalLink size={12} /> {featureDesc || 'Sign Out'}</div>
            </ApiCallHighlight>
          </div>
        </div>
      </div>
    );
  }

  // ---- ME / PROFILE ----
  if (key.includes('ME') || key.includes('PROFILE')) {
    return (
      <div className="space-y-3">
        <WireAutoFetch constant={sourceConstant} />
        <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-sm mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">AO</div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-gray-200 rounded-full" />
              <div className="h-2.5 w-24 bg-gray-100 rounded-full" />
              <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- LIST / GET ALL / BASE — matches DriversPage table layout ----
  if (key.includes('LIST') || key.includes('ALL') || key.includes('LIVE') || key.includes('BASE') || (key.includes('GET') && !key.includes('UPDATE'))) {
    const entity = key.replace('LIST_', '').replace('GET_', '').replace('_ALL', '').replace('ALL_', '').toLowerCase();
    const entityTitle = entity.charAt(0).toUpperCase() + entity.slice(1);
    const columns = ['Name', 'Status', 'Updated', 'Details'];
    return (
      <div className="space-y-3">
        <WireAutoFetch constant={sourceConstant} />
        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden">
          {/* Toolbar — matches DriversPage list controls */}
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><Search size={20} /></div>
              <input
                type="text"
                placeholder={`Search ${entity}s...`}
                readOnly
                tabIndex={-1}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full text-sm font-bold placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <ThemedButton variant="ghost" tabIndex={-1}>Filter Status</ThemedButton>
              <ThemedButton variant="primary" tabIndex={-1}>+ {entityTitle}</ThemedButton>
            </div>
          </div>
          {/* Table — matches DriversPage flat table */}
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-8 py-6">{col}</th>
                ))}
                <th className="px-8 py-6 text-right pr-10">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100" />
                      <div className="space-y-1">
                        <div className="h-3 w-24 bg-gray-200 rounded-full" />
                        <div className="h-2 w-16 bg-gray-100 rounded-full" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><div className="h-3 w-16 bg-gray-100 rounded-full" /></td>
                  <td className="px-8 py-5"><div className="h-3 w-20 bg-gray-100 rounded-full" /></td>
                  <td className="px-8 py-5"><div className="h-3 w-14 bg-gray-100 rounded-full" /></td>
                  <td className="px-8 py-5 text-right pr-10">
                    <div className="flex items-center justify-end gap-1">
                      <div className="p-1.5 rounded-lg bg-gray-50"><Eye size={12} className="text-gray-400" /></div>
                      <div className="p-1.5 rounded-lg bg-gray-50"><Edit3 size={12} className="text-gray-400" /></div>
                      <div className="p-1.5 rounded-lg bg-gray-50"><Trash2 size={12} className="text-red-300" /></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ---- CREATE / UPLOAD / BULK ----
  if (key.includes('CREATE') || key.includes('UPLOAD') || key.includes('BULK')) {
    const entity = key.replace('CREATE_', '').replace('UPLOAD_', '').replace('BULK_', '').toLowerCase();
    const entityTitle = entity.charAt(0).toUpperCase() + entity.slice(1);
    const isUpload = key.includes('UPLOAD');
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand-black">{isUpload ? 'Upload File' : `Register ${entityTitle}`}</h3>
          <p className="text-sm text-gray-500 mt-1">{isUpload ? 'Import data from file' : `Add a new ${entity} to the system`}</p>
        </div>
        {isUpload ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
            <Upload size={28} className="mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 font-medium">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400">.csv, .xlsx accepted</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Name <span className="text-red-500">*</span></label>
              <ThemedInput placeholder={`Enter ${entity} name`} readOnly tabIndex={-1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email</label>
              <ThemedInput type="email" placeholder={`${entity}@school.com`} readOnly tabIndex={-1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Role / Type</label>
              <div className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full text-gray-300 font-medium flex items-center justify-between">
                Select option… <ChevronDown size={14} className="text-gray-300" />
              </div>
            </div>
          </>
        )}
        <div className="flex items-center gap-3 pt-2">
          <ThemedButton variant="cancel" tabIndex={-1}>Cancel</ThemedButton>
          <div className="flex-1">
            <ApiCallHighlight {...meta}>
              <ThemedButton variant="primary" fullWidth tabIndex={-1}>
                {featureDesc || (isUpload ? 'Upload' : `Register ${entityTitle}`)}
              </ThemedButton>
            </ApiCallHighlight>
          </div>
        </div>
      </div>
    );
  }

  // ---- UPDATE / STATUS / READ / BY_ID / STATS ----
  if (key.includes('UPDATE') || key.includes('STATUS') || key.includes('READ') || key.includes('BY_ID') || key.includes('STATS')) {
    const entity = key.replace('UPDATE_', '').replace('_STATUS', '').replace('READ_', '').toLowerCase();
    const entityTitle = entity.charAt(0).toUpperCase() + entity.slice(1);
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto space-y-6">
        <h3 className="text-xl font-bold text-brand-black">Edit {entityTitle}</h3>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Name</label>
          <ThemedInput placeholder="John Doe" readOnly tabIndex={-1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Email</label>
          <ThemedInput type="email" placeholder="john@school.com" readOnly tabIndex={-1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Status</label>
          <div className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full text-gray-300 font-medium flex items-center justify-between">
            Active <ChevronDown size={14} className="text-gray-300" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <ThemedButton variant="cancel" tabIndex={-1}>Cancel</ThemedButton>
          <div className="flex-1">
            <ApiCallHighlight {...meta}>
              <ThemedButton variant="primary" fullWidth tabIndex={-1}>
                {featureDesc || 'Save Changes'}
              </ThemedButton>
            </ApiCallHighlight>
          </div>
        </div>
      </div>
    );
  }

  // ---- DELETE / DISABLE ----
  if (key.includes('DELETE') || key.includes('DISABLE')) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <tr>
                {['Name', 'Status', 'Created'].map(col => (
                  <th key={col} className="px-8 py-5">{col}</th>
                ))}
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-8 py-4"><div className="h-3 w-24 bg-gray-200 rounded-full" /></td>
                  <td className="px-8 py-4"><div className="h-3 w-16 bg-gray-100 rounded-full" /></td>
                  <td className="px-8 py-4"><div className="h-3 w-20 bg-gray-100 rounded-full" /></td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="p-1.5 rounded-lg bg-gray-50"><Eye size={12} className="text-gray-400" /></div>
                      <div className="p-1.5 rounded-lg bg-gray-50"><Trash2 size={12} className="text-red-300" /></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Confirm dialog */}
        <div className="bg-white border-2 border-red-200 rounded-2xl p-8 max-w-xs mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">Confirm Deletion</p>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex items-center gap-3 justify-center pt-1">
            <ThemedButton variant="cancel" tabIndex={-1}>Cancel</ThemedButton>
            <ApiCallHighlight {...meta}>
              <ThemedButton variant="primary" tabIndex={-1} style={{ backgroundColor: '#ef4444' }}>
                {featureDesc || 'Delete'}
              </ThemedButton>
            </ApiCallHighlight>
          </div>
        </div>
      </div>
    );
  }

  // ---- GENERATE / ANALYTICS / EXPORT ----
  if (key.includes('GENERATE') || key.includes('ANALYTICS') || key.includes('EXPORT')) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Download size={18} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-black">{featureDesc || 'Generate Report'}</h3>
            <p className="text-sm text-gray-500">Export or generate analytics data</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Date Range</label>
          <div className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full text-gray-300 font-medium flex items-center justify-between">
            Last 30 days <ChevronDown size={14} className="text-gray-300" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-black uppercase tracking-wide">Format</label>
          <div className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full text-gray-300 font-medium flex items-center justify-between">
            PDF <ChevronDown size={14} className="text-gray-300" />
          </div>
        </div>
        <ApiCallHighlight {...meta}>
          <ThemedButton variant="primary" fullWidth tabIndex={-1}>
            {featureDesc || 'Generate'}
          </ThemedButton>
        </ApiCallHighlight>
      </div>
    );
  }

  // ---- FALLBACK: Generic handler ----
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto space-y-6">
      <h3 className="text-lg font-bold text-brand-black">{featureDesc || pageName}</h3>
      <div className="p-6 bg-gray-50 rounded-2xl text-center">
        <Code size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Custom handler invokes this endpoint</p>
      </div>
      <ApiCallHighlight {...meta}>
        <ThemedButton variant="primary" fullWidth tabIndex={-1}>
          <Zap size={14} /> {methodStr.toUpperCase()} → {sourceConstant.split('.').pop()}
        </ThemedButton>
      </ApiCallHighlight>
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
  const dispatch = useDispatch<any>();
  const [viewMode, setViewMode] = useState<'code' | 'visual'>('visual');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [activePageTab, setActivePageTab] = useState('');
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormPage, setAddFormPage] = useState('');
  const [addFormDesc, setAddFormDesc] = useState('');
  const [addFormElement, setAddFormElement] = useState('button');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync initial selected page from mapping whenever mapping changes
  useEffect(() => {
    if (mapping) {
      const pn = mapping.functionality.includes('—')
        ? mapping.functionality.split('—')[0].trim()
        : mapping.functionality;
      const initial = PAGE_FILE_MAP[pn] ? pn : ALL_PAGE_NAMES[0];
      setSelectedPages([initial]);
      setActivePageTab(initial);
    }
  }, [mapping]);

  if (!open || !mapping) return null;

  // Parse functionality → page and feature description
  const [pageName, featureDesc] = mapping.functionality.includes('—')
    ? mapping.functionality.split('—').map(s => s.trim())
    : [mapping.functionality, ''];

  // Infer HTTP method from the constant name for code snippet
  const constName = mapping.sourceConstant;
  const keyPart = constName.split('.').pop()?.toUpperCase() || '';
  let method = 'get';
  if (['LOGIN', 'UPLOAD', 'GENERATE', 'VERIFY', 'RESEND', 'FORGOT', 'RESET', 'FLAG', 'DUPLICATE', 'BULK_UPLOAD', 'CREATE'].some(k => keyPart.includes(k))) method = 'post';
  else if (['UPDATE', 'STATUS', 'READ', 'READ_ALL', 'PREFERRED_OTP_CHANNEL'].some(k => keyPart.includes(k))) method = 'put';
  else if (['DELETE', 'DISABLE'].some(k => keyPart.includes(k))) method = 'delete';

  const hasParam = mapping.endpointPath.includes(':') || constName.includes('(:id)');
  const cleanConstant = constName.replace('(:id)', '');

  const codeSnippet = hasParam
    ? `import { API } from '@/config/apiEndpoints';
import { apiClient } from '@/services/ApiClient';

// ${mapping.description || featureDesc || pageName}
const id = 'resource-id';
const response = await apiClient.${method}(
  ${cleanConstant}.replace(':id', id)${method === 'post' || method === 'put' ? ',\n  { /* request body */ }' : ''}
);

console.log(response.data);`
    : `import { API } from '@/config/apiEndpoints';
import { apiClient } from '@/services/ApiClient';

// ${mapping.description || featureDesc || pageName}
const response = await apiClient.${method}(
  ${cleanConstant}${method === 'post' || method === 'put' ? ',\n  { /* request body */ }' : ''}
);

console.log(response.data);`;

  const sourceFile = PAGE_FILE_MAP[activePageTab] || PAGE_FILE_MAP[pageName] || 'src/services/UnifiedApiService.ts';

  const togglePage = (page: string) => {
    setSelectedPages(prev => {
      if (prev.includes(page)) {
        const next = prev.filter(p => p !== page);
        if (activePageTab === page) setActivePageTab(next[0] || '');
        return next;
      }
      const next = [...prev, page];
      if (!activePageTab) setActivePageTab(page);
      return next;
    });
  };

  const handleAddUsage = () => {
    if (!addFormPage) return;
    if (!selectedPages.includes(addFormPage)) {
      setSelectedPages(prev => [...prev, addFormPage]);
    }
    setActivePageTab(addFormPage);
    setShowAddForm(false);
    setAddFormPage('');
    setAddFormDesc('');
    dispatch(addToast({
      message: `Added ${addFormPage} as a consumer of ${mapping.sourceConstant}`,
      type: 'success',
      duration: 3000,
    }));
  };

  // Build the visual wireframe for the active page tab
  const activeWireframe = activePageTab ? (
    <VisualWireframe
      sourceConstant={mapping.sourceConstant}
      pageName={activePageTab}
      featureDesc={featureDesc}
      methodStr={method}
      endpointPath={mapping.endpointPath}
      hasParam={hasParam}
      consumers={selectedPages.length}
    />
  ) : null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-4xl p-8 max-w-4xl w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50"><Eye size={20} className="text-blue-500" /></div>
            <div>
              <h4 className="font-bold text-brand-black text-lg">Endpoint Usage Editor</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${METHOD_COLORS[method.toUpperCase() as HttpMethod] || 'bg-gray-100 text-gray-700'}`}>{method.toUpperCase()}</span>
                <code className="text-xs font-mono text-gray-500">{mapping.endpointPath}</code>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl mb-5 w-fit">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'visual' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye size={14} /> Visual
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'code' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code size={14} /> Show Code
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'visual' ? (
            <div className="space-y-5">
              {/* ------ Multi-select Page Dropdown ------ */}
              <div ref={dropdownRef} className="relative">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pages / Components using this endpoint</p>
                <button
                  onClick={() => setShowPageDropdown(prev => !prev)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-black hover:border-gray-300 transition-colors"
                >
                  <span className="flex items-center gap-2 flex-wrap min-w-0">
                    {selectedPages.length === 0 ? (
                      <span className="text-gray-400 font-medium">Select pages…</span>
                    ) : (
                      selectedPages.map(p => (
                        <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                          <FileCode2 size={12} /> {p}
                        </span>
                      ))
                    )}
                  </span>
                  {showPageDropdown ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                </button>
                {showPageDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    {ALL_PAGE_NAMES.map(page => {
                      const isSelected = selectedPages.includes(page);
                      return (
                        <button
                          key={page}
                          onClick={() => togglePage(page)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                            isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle size={10} className="text-white" />}
                          </div>
                          <FileCode2 size={14} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />
                          <span>{page}</span>
                          <span className="ml-auto text-[10px] font-mono text-gray-400">{PAGE_FILE_MAP[page]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ------ Page Subtabs ------ */}
              {selectedPages.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto">
                    {selectedPages.map(page => (
                      <button
                        key={page}
                        onClick={() => setActivePageTab(page)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                          activePageTab === page
                            ? 'bg-white text-brand-black shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <FileCode2 size={13} /> {page}
                      </button>
                    ))}
                    {/* + Add Page Button */}
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-brand-black hover:bg-white transition-all"
                      title="Add a page that uses this endpoint"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* ------ Visual Wireframe Preview ------ */}
                  {activePageTab && (
                    <div className="mt-4 border border-gray-100 rounded-2xl bg-gray-50/30 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-gray-400" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Preview</p>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-100">{PAGE_FILE_MAP[activePageTab] || 'unknown'}</span>
                      </div>
                      {/* Wireframe area with subtle dots background */}
                      <div className="rounded-xl bg-white/50 p-4" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        {activeWireframe}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------ Add New Usage Inline Form ------ */}
              {showAddForm && (
                <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-brand-black">Add New Page Usage</p>
                    <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-blue-100 text-gray-400 transition-colors"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page / Component</label>
                      <select
                        value={addFormPage}
                        onChange={e => setAddFormPage(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      >
                        <option value="">Select…</option>
                        {ALL_PAGE_NAMES.filter(p => !selectedPages.includes(p)).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Element Type</label>
                      <select
                        value={addFormElement}
                        onChange={e => setAddFormElement(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      >
                        <option value="button">Button</option>
                        <option value="form">Form</option>
                        <option value="effect">useEffect</option>
                        <option value="handler">Handler</option>
                        <option value="table">Table</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                      <input
                        type="text"
                        value={addFormDesc}
                        onChange={e => setAddFormDesc(e.target.value)}
                        placeholder="e.g. Submit button"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <ThemedButton variant="cancel" onClick={() => setShowAddForm(false)}>Cancel</ThemedButton>
                    <button
                      onClick={handleAddUsage}
                      disabled={!addFormPage}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-brand-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus size={13} /> Add Usage
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ---- Show Code ---- */
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500">Example usage in <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{sourceFile}</code></p>
                <button
                  onClick={() => navigator.clipboard.writeText(codeSnippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-colors"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre className="overflow-auto bg-gray-900 text-green-400 p-5 rounded-2xl text-sm font-mono leading-relaxed">
                {codeSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <ThemedButton variant="cancel" onClick={onClose}>Close</ThemedButton>
        </div>
      </div>
    </div>,
    document.body
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
    setEndpoints(endpointConfigService.getAllEndpoints());
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
              {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} ({endpoints.filter(e => e.id.startsWith('sys_')).length} system, {endpoints.filter(e => !e.id.startsWith('sys_')).length} custom)
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
                      const isSystem = ep.id.startsWith('sys_');
                      return (
                        <tr key={ep.id} className={`hover:bg-gray-50/50 transition-colors ${ep.status === 'DISABLED' ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 min-w-0">
                              {isSystem && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">System</span>}
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
                            {isSystem ? (
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                                {ep.status}
                              </span>
                            ) : (
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
                            )}
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
                              {!isSystem && (
                                <>
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
                                </>
                              )}
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
              <p className="font-bold text-lg">No endpoints found</p>
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
