import React, { useState } from 'react';
import { api } from '../services/apiClient';
import { ApiRoute, ApiResponse } from '../types/index';
import {
  Server,
  Play,
  Copy,
  Check,
  Radio,
  Sliders,
  Terminal,
  Activity,
  ExternalLink,
} from 'lucide-react';

export const ApiGatewayView: React.FC = () => {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState(api.getGatewayUrl());
  const [copied, setCopied] = useState(false);

  // Interactive Tester state
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [endpointPath, setEndpointPath] = useState('/v1/events');
  const [requestBody, setRequestBody] = useState('{\n  "title": "New Tech Seminar",\n  "basePrice": 30\n}');
  const [executing, setExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [statusResult, setStatusResult] = useState<number | null>(null);
  const [latencyResult, setLatencyResult] = useState<number | null>(null);

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const res = await api.request<ApiRoute[]>('GET', '/routes');
      if (res.data) setRoutes(res.data);
    } finally {
      setLoadingRoutes(false);
    }
  };

  React.useEffect(() => {
    fetchRoutes();
  }, []);

  const sampleEndpoints = [
    { method: 'GET', path: '/api/v1/events', body: '' },
    {
      method: 'POST',
      path: '/api/v1/events',
      body: JSON.stringify(
        {
          title: 'Khmer Cultural Concert 2026',
          location: 'Chaktomuk Theatre',
          eventType: 'CONCERT',
          basePrice: 20,
          totalTickets: 200,
        },
        null,
        2
      ),
    },
    { method: 'GET', path: '/api/v1/tickets', body: '' },
    {
      method: 'POST',
      path: '/api/v1/tickets/1/lock',
      body: JSON.stringify(
        {
          ticketId: 1,
          durationSeconds: 120,
          username: 'admin',
        },
        null,
        2
      ),
    },
    {
      method: 'DELETE',
      path: '/api/v1/tickets/1/lock',
      body: '',
    },
    {
      method: 'POST',
      path: '/api/v1/orders',
      body: JSON.stringify(
        {
          eventId: 1,
          ticketId: 2,
          quantity: 1,
          amount: 80.0,
          paymentMethod: 'CREDIT_CARD',
          recipientEmail: 'dara@example.com',
          phoneNumber: '+85512345678',
        },
        null,
        2
      ),
    },
    { method: 'GET', path: '/api/v1/orders', body: '' },
    {
      method: 'POST',
      path: '/api/v1/payments',
      body: JSON.stringify(
        {
          orderId: 101,
          amount: 35.0,
          paymentMethod: 'CREDIT_CARD',
        },
        null,
        2
      ),
    },
    { method: 'GET', path: '/api/v1/payments', body: '' },
    { method: 'GET', path: '/api/v1/notifications', body: '' },
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: JSON.stringify({ username: 'admin', password: 'password123' }, null, 2),
    },
    {
      method: 'POST',
      path: '/api/v1/auth/register',
      body: JSON.stringify(
        {
          username: 'developer_pro',
          email: 'dev@company.com',
          phoneNumber: '+85512999888',
          role: 'ROLE_ADMIN',
        },
        null,
        2
      ),
    },
    { method: 'GET', path: '/api/v1/users', body: '' },
    { method: 'GET', path: '/routes', body: '' },
  ];

  const handleSelectPreset = (preset: typeof sampleEndpoints[0]) => {
    setSelectedMethod(preset.method as any);
    setEndpointPath(preset.path);
    setRequestBody(preset.body || '');
    setApiResponse(null);
  };

  const handleExecuteRequest = async () => {
    setExecuting(true);
    setApiResponse(null);
    const start = performance.now();
    try {
      let parsedBody: any = undefined;
      if (selectedMethod === 'POST' || selectedMethod === 'PUT') {
        try {
          parsedBody = requestBody ? JSON.parse(requestBody) : undefined;
        } catch (e: any) {
          setStatusResult(400);
          setApiResponse({
            description: 'Invalid JSON in request body: ' + e.message,
            code: '400',
            data: null,
            error: true,
          });
          setExecuting(false);
          return;
        }
      }

      const res = await api.request(selectedMethod, endpointPath, parsedBody);
      const duration = Math.round(performance.now() - start);
      setApiResponse(res);
      setStatusResult(res.error ? 400 : 200);
      setLatencyResult(duration);
    } catch (err: any) {
      setStatusResult(500);
      setApiResponse({
        description: err.message,
        code: '500',
        data: null,
        error: true,
      });
    } finally {
      setExecuting(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(api.getJwtToken());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div id="api-gateway-view" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <span>Spring Cloud API Gateway & Endpoints Explorer (:8080)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect dynamic routing rules, test real HTTP endpoints, and debug JWT authorization and rate limits
        </p>
      </div>

      {/* Gateway Configuration & Auth Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-md text-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Gateway Target Endpoint:</span>
            <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-mono">
              {gatewayUrl}
            </code>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Mode:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 uppercase">
              {api.getMode()}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex-1 w-full overflow-hidden">
            <span className="text-slate-400 block mb-1">JWT Bearer Authorization Header:</span>
            <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="text-indigo-400 font-bold shrink-0">Bearer</span>
              <span className="truncate flex-1">{api.getJwtToken()}</span>
              <button
                onClick={copyToken}
                className="text-slate-400 hover:text-white p-1 shrink-0"
                title="Copy JWT Token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive API Explorer / Playground */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Interactive Endpoint Tester</h3>
          </div>
          <span className="text-xs text-slate-400">Standard Response: ResponseErrorTemplate</span>
        </div>

        {/* Preset chips */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold block mb-2">Endpoint Presets:</span>
          <div className="flex flex-wrap gap-2">
            {sampleEndpoints.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition ${
                  endpointPath === preset.path && selectedMethod === preset.method
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <strong
                  className={
                    preset.method === 'GET'
                      ? 'text-emerald-600 mr-1'
                      : preset.method === 'POST'
                      ? 'text-indigo-600 mr-1'
                      : 'text-amber-600 mr-1'
                  }
                >
                  {preset.method}
                </strong>
                <span>{preset.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Request Input Form */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 text-xs focus:outline-hidden"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono text-xs">/api</span>
              <input
                type="text"
                value={endpointPath}
                onChange={(e) => setEndpointPath(e.target.value)}
                placeholder="/v1/events"
                className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              id="execute-api-call-btn"
              onClick={handleExecuteRequest}
              disabled={executing}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executing ? 'Calling...' : 'Send Request'}</span>
            </button>
          </div>

          {(selectedMethod === 'POST' || selectedMethod === 'PUT') && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                JSON Request Body Payload:
              </label>
              <textarea
                rows={4}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-hidden"
              />
            </div>
          )}

          {/* Response Pane */}
          {apiResponse && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      statusResult === 200 || statusResult === 201
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    HTTP {statusResult}
                  </span>
                  <span className="text-slate-400 text-[11px]">Latency: {latencyResult}ms</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  code: "{apiResponse.code}" • error: {String(apiResponse.error)}
                </span>
              </div>

              <div className="bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Route Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dynamic Gateway Routes (api_route table)</h3>
            <p className="text-[11px] text-slate-400">
              Loaded dynamically into Spring Cloud Gateway via Reactive R2DBC
            </p>
          </div>
          <button
            onClick={fetchRoutes}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Reload Routes
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Route ID</th>
                <th className="px-4 py-3">Path Pattern</th>
                <th className="px-4 py-3">Target Microservice URI</th>
                <th className="px-4 py-3">Rate Limit</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {routes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{r.routeId}</td>
                  <td className="px-4 py-3 text-indigo-600">{r.pathPattern}</td>
                  <td className="px-4 py-3 text-slate-600">{r.targetUri}</td>
                  <td className="px-4 py-3 text-slate-700">{r.rateLimitPerSecond} req/s</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
