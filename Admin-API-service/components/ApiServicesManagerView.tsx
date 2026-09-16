import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { ServiceHealth, ServiceErrorLog, ApiRoute, ApiResponse } from '../types/index';
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Copy,
  Check,
  Filter,
  Trash2,
  Bug,
  ShieldAlert,
  Zap,
  Radio,
  Sliders,
  Terminal,
  ExternalLink,
  ChevronRight,
  Database,
  Search,
} from 'lucide-react';

export const ApiServicesManagerView: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [errors, setErrors] = useState<ServiceErrorLog[]>([]);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | '5XX' | '4XX'>('ALL');
  const [errorSearch, setErrorSearch] = useState<string>('');

  // Gateway Connection State
  const [gatewayUrl, setGatewayUrl] = useState<string>(api.getGatewayUrl());
  const [mode, setMode] = useState<'simulator' | 'live'>(api.getMode());
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  }>({ tested: false, success: true, message: '' });

  // Route & Interactive Tester State
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'errors' | 'routes' | 'tester'>('errors');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // REST Client State
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpointPath, setEndpointPath] = useState('/api/v1/events');
  const [requestBody, setRequestBody] = useState('{\n  "title": "New Tech Seminar",\n  "basePrice": 30\n}');
  const [executing, setExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [statusResult, setStatusResult] = useState<number | null>(null);
  const [latencyResult, setLatencyResult] = useState<number | null>(null);

  const refreshData = () => {
    setServices(api.getServicesHealth());
    setErrors(api.getServiceErrors());
  };

  useEffect(() => {
    refreshData();
    api.request<ApiRoute[]>('GET', '/routes').then((res) => {
      if (res.data) setRoutes(res.data);
    });

    const unsubscribe = api.onError(() => {
      refreshData();
    });

    return () => unsubscribe();
  }, []);

  // Handle Testing Gateway Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    const startTime = performance.now();
    try {
      api.setGatewayUrl(gatewayUrl);
      api.setMode(mode);
      const res = await api.request('GET', '/api/v1/health');
      const latency = Math.round(performance.now() - startTime);
      setConnectionStatus({
        tested: true,
        success: !res.error,
        message: res.error
          ? 'Failed to reach API Gateway at ' + gatewayUrl
          : `Connected successfully! Spring Cloud Gateway is UP (${latency}ms)`,
        latencyMs: latency,
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: err.message || 'Connection failed',
      });
    } finally {
      setTestingConnection(false);
      refreshData();
    }
  };

  // Handle Simulate Error on Service
  const handleSimulateError = (serviceName: string) => {
    const err = api.simulateServiceError(serviceName);
    refreshData();
    setSelectedServiceFilter(serviceName);
    setActiveSubTab('errors');
  };

  // Handle Resolve Error
  const handleResolveError = (errorId: string) => {
    api.resolveServiceError(errorId);
    refreshData();
  };

  // Handle Clear Errors
  const handleClearErrors = () => {
    api.clearServiceErrors(selectedServiceFilter === 'ALL' ? undefined : selectedServiceFilter);
    refreshData();
  };

  // Handle Copy Correlation ID
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Execute REST tester request
  const handleExecuteRequest = async () => {
    setExecuting(true);
    setStatusResult(null);
    setLatencyResult(null);
    setApiResponse(null);

    const start = performance.now();
    try {
      let parsedBody: any = undefined;
      if (['POST', 'PUT'].includes(selectedMethod) && requestBody.trim()) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch {
          alert('JSON Request Body មិនត្រឹមត្រូវ!');
          setExecuting(false);
          return;
        }
      }

      const res = await api.request(selectedMethod, endpointPath, parsedBody);
      const duration = Math.round(performance.now() - start);

      setLatencyResult(duration);
      setStatusResult(res.error ? 500 : 200);
      setApiResponse(res);
    } catch (err: any) {
      setStatusResult(500);
      setApiResponse({
        description: err.message || 'Request failed',
        code: '500',
        data: null,
        error: true,
      });
    } finally {
      setExecuting(false);
      refreshData();
    }
  };

  // Filtered Errors List
  const filteredErrors = errors.filter((err) => {
    const matchesService =
      selectedServiceFilter === 'ALL' ||
      err.serviceName.toLowerCase() === selectedServiceFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === '5XX' && err.statusCode >= 500) ||
      (statusFilter === '4XX' && err.statusCode >= 400 && err.statusCode < 500);

    const matchesSearch =
      err.message.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.errorCode.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.path.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.rootCause.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.serviceName.toLowerCase().includes(errorSearch.toLowerCase());

    return matchesService && matchesStatus && matchesSearch;
  });

  const totalUnresolvedErrors = errors.filter((e) => !e.resolved).length;

  return (
    <div id="api-services-manager-view" className="space-y-6 pb-12">
      {/* Top Header & Connection Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Server className="w-4 h-4" />
              <span>Microservices & API Gateway Management Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              គ្រប់គ្រង API & តាមដាន Error តាម Microservices (Service Diagnostics)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              ពិនិត្យមើលការតភ្ជាប់ API Gateway, ស្ថានភាព Microservice នីមួយៗ និងតាមដាន Error Logs ជាក់ស្តែង
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center space-x-2.5">
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{services.filter((s) => s.status === 'UP').length} / {services.length} Services UP</span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border ${
                totalUnresolvedErrors > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${totalUnresolvedErrors > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>{totalUnresolvedErrors} Unresolved Errors</span>
            </div>
          </div>
        </div>

        {/* Gateway Connection Bar */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-lg">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">Gateway URL:</span>
              <input
                id="gateway-url-input"
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
                className="px-3 py-1.5 border border-slate-300 rounded-md font-mono text-xs bg-white text-slate-800 w-64 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-1 rounded-md">
              <button
                type="button"
                onClick={() => setMode('simulator')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  mode === 'simulator'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Simulator Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('live')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  mode === 'live'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Gateway (:8080)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="test-gateway-connection-btn"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Connecting...' : 'Test Connection (Ping)'}</span>
            </button>
          </div>
        </div>

        {/* Connection Result Feedback */}
        {connectionStatus.tested && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs flex items-center justify-between border ${
              connectionStatus.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {connectionStatus.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{connectionStatus.message}</span>
            </div>
            {connectionStatus.latencyMs && (
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                Latency: {connectionStatus.latencyMs}ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section 1: Interactive Microservices Health Cards with Error Counts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              ស្ថានភាព Microservices នីមួយៗ (ចុចលើ Service ដើម្បីមើល Error របស់វា)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            ចុចលើកាតណាមួយដើម្បី Filter មើល Error ពី Service នោះ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {services.map((svc) => {
            const isSelected =
              selectedServiceFilter.toLowerCase() === svc.name.toLowerCase();
            const serviceErrorCount = errors.filter(
              (e) => e.serviceName.toLowerCase() === svc.name.toLowerCase() && !e.resolved
            ).length;

            return (
              <div
                key={svc.name}
                id={`service-card-${svc.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => {
                  setSelectedServiceFilter(svc.name);
                  setActiveSubTab('errors');
                }}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition relative group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition">
                      {svc.name}
                    </h3>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      Port :{svc.port}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                      svc.status === 'UP'
                        ? 'bg-emerald-100 text-emerald-800'
                        : svc.status === 'DEGRADED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        svc.status === 'UP'
                          ? 'bg-emerald-500'
                          : svc.status === 'DEGRADED'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    ></span>
                    <span>{svc.status}</span>
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 line-clamp-1 flex items-center space-x-1">
                  <Database className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{svc.database}</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Latency: {svc.latencyMs}ms</span>
                  {serviceErrorCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center space-x-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{serviceErrorCount} error{serviceErrorCount > 1 ? 's' : ''}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium text-[10px]">No errors</span>
                  )}
                </div>

                {/* Quick Action to simulate error */}
                <div className="mt-2 pt-2 border-t border-dashed border-slate-200/80 flex items-center justify-between">
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {isSelected ? 'កំពុងជ្រើសរើស ✓' : 'ចុចមើល Error →'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateError(svc.name);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-rose-100 hover:text-rose-700 px-2 py-0.5 rounded text-slate-600 font-medium transition"
                    title={`Simulate Error on ${svc.name}`}
                  >
                    + Simulate Error
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Management Sub-Tabs (Errors / Routes / Tester) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Sub-tab Navigation */}
        <div className="border-b border-slate-200 px-6 pt-4 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <button
              id="subtab-errors-btn"
              onClick={() => setActiveSubTab('errors')}
              className={`pb-3 px-1 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
                activeSubTab === 'errors'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>ការតាមដាន Error តាម Service (Error Diagnostics)</span>
              {errors.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-mono">
                  {filteredErrors.length}
                </span>
              )}
            </button>

            <button
              id="subtab-routes-btn"
              onClick={() => setActiveSubTab('routes')}
              className={`pb-3 px-1 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
                activeSubTab === 'routes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Spring Cloud Gateway Routes ({routes.length})</span>
            </button>

            <button
              id="subtab-tester-btn"
              onClick={() => setActiveSubTab('tester')}
              className={`pb-3 px-1 text-xs font-bold transition flex items-center space-x-2 border-b-2 ${
                activeSubTab === 'tester'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Interactive REST API Client</span>
            </button>
          </div>

          {activeSubTab === 'errors' && (
            <div className="pb-3 flex items-center space-x-2">
              <button
                onClick={() => handleSimulateError(selectedServiceFilter === 'ALL' ? 'Ticket Service' : selectedServiceFilter)}
                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold transition flex items-center space-x-1"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Simulate Error Test</span>
              </button>

              <button
                onClick={handleClearErrors}
                className="px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-md text-xs font-semibold transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Errors</span>
              </button>
            </div>
          )}
        </div>

        {/* SUBTAB 1: SERVICE ERROR DIAGNOSTICS */}
        {activeSubTab === 'errors' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>ជ្រើសរើស Service:</span>
                </span>

                <button
                  onClick={() => setSelectedServiceFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    selectedServiceFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Services ({errors.length})
                </button>

                {services.map((s) => {
                  const count = errors.filter(
                    (e) => e.serviceName.toLowerCase() === s.name.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSelectedServiceFilter(s.name)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1 ${
                        selectedServiceFilter.toLowerCase() === s.name.toLowerCase()
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{s.name}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            selectedServiceFilter.toLowerCase() === s.name.toLowerCase()
                              ? 'bg-indigo-800 text-white'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status filter and search */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">All Status Codes</option>
                  <option value="5XX">5xx Server Errors (500, 502, 504)</option>
                  <option value="4XX">4xx Client Errors (401, 409, 429)</option>
                </select>

                <div className="relative flex-1 md:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={errorSearch}
                    onChange={(e) => setErrorSearch(e.target.value)}
                    placeholder="Search errors..."
                    className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Error Cards List */}
            <div className="space-y-3">
              {filteredErrors.map((err) => (
                <div
                  key={err.id}
                  className={`p-4 rounded-xl border text-xs transition ${
                    err.resolved
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : err.statusCode >= 500
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{err.serviceName}</span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        Port :{err.port}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          err.statusCode >= 500
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        HTTP {err.statusCode}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {err.errorCode}
                      </span>
                      {err.resolved && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px] flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                      <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                      <button
                        onClick={() => handleCopy(err.id, err.correlationId)}
                        className="hover:text-slate-700 flex items-center space-x-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded"
                        title="Copy Correlation ID"
                      >
                        {copiedId === err.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                        <span className="text-[10px] truncate max-w-[100px]">
                          {copiedId === err.id ? 'Copied' : err.correlationId.slice(0, 8) + '...'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-slate-700 shrink-0">API Path:</span>
                      <code className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        {err.path}
                      </code>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-slate-700 shrink-0">សារកំហុស (Message):</span>
                      <span className="font-medium text-slate-900">{err.message}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-1">
                      <div className="text-rose-400 font-semibold">Root Cause / Diagnostic Trace:</div>
                      <div>{err.rootCause}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Recommendation: Check upstream database connection pool & circuit breaker threshold
                    </span>

                    <div className="flex items-center space-x-2">
                      {!err.resolved && (
                        <button
                          onClick={() => handleResolveError(err.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEndpointPath(err.path);
                          setActiveSubTab('tester');
                        }}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold transition"
                      >
                        Re-test in Client →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredErrors.length === 0 && (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="font-semibold text-slate-700 text-sm">
                    មិនមាន Error ណាមួយសម្រាប់សេវាដែលបានជ្រើសរើសទេ!
                  </div>
                  <p className="text-xs text-slate-400">
                    គ្រប់សំណើ API ទៅកាន់ Service នេះដំណើរការធម្មតា។ ចុច "+ Simulate Error" ដើម្បីសាកល្បង error handling។
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: SPRING CLOUD GATEWAY ROUTES */}
        {activeSubTab === 'routes' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Dynamic Route Definitions in Spring Cloud Gateway
                </h3>
                <p className="text-xs text-slate-400">
                  Routes defined in GatewayRouteLocator with Redis Token Bucket Rate Limiting
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Route ID</th>
                    <th className="py-3 px-4">Path Pattern</th>
                    <th className="py-3 px-4">Target Microservice URI</th>
                    <th className="py-3 px-4">Rate Limit (Redis)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {route.routeId}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {route.pathPattern}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {route.targetUri}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
                          {route.rateLimitPerSecond} req/s
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {route.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: INTERACTIVE REST CLIENT */}
        {activeSubTab === 'tester' && (
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={endpointPath}
                  onChange={(e) => setEndpointPath(e.target.value)}
                  placeholder="/api/v1/events"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  onClick={handleExecuteRequest}
                  disabled={executing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{executing ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>

              {['POST', 'PUT'].includes(selectedMethod) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    JSON Request Body:
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={4}
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-hidden"
                  />
                </div>
              )}

              {statusResult !== null && (
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-700">Response Status:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          statusResult < 400
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {statusResult} {statusResult < 400 ? 'OK' : 'ERROR'}
                      </span>
                    </div>

                    {latencyResult !== null && (
                      <span className="font-mono text-slate-500 text-[11px]">
                        Latency: {latencyResult}ms
                      </span>
                    )}
                  </div>

                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto max-h-64">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
