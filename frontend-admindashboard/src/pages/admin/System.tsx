import React from 'react';
import { Activity, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useHealth } from '../../hooks/useApi';
import { PageHeader, QueryState, StatCard } from '../../components/QueryState';
import { Badge, Button, Card } from '../../components/ui';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../utils';

const System: React.FC = () => {
  const health = useHealth();

  const isUp = health.data?.status === 'UP';
  const components = Object.entries(health.data?.components ?? {}).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const copy = (text: string) => {
    void navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Clipboard unavailable'));
  };

  return (
    <>
      <PageHeader
        title="System"
        description="Connection details and the health of the services behind the API."
        actions={
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            loading={health.isFetching}
            onClick={() => void health.refetch()}
          >
            Re-check
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="API status"
          value={health.isLoading ? '...' : isUp ? 'UP' : (health.data?.status ?? 'DOWN')}
          tone={isUp ? 'good' : 'bad'}
          icon={Activity}
        />
        <StatCard
          label="Components"
          value={components.length || '-'}
          hint={components.length ? 'reported by actuator' : 'actuator exposed no details'}
        />
        <StatCard
          label="Session"
          value={api.isAuthenticated() ? 'Signed in' : 'Anonymous'}
          tone={api.isAuthenticated() ? 'good' : 'default'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="border-b border-[#f0f0f3] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[#292933]">Connection</h2>
          </div>
          <dl className="divide-y divide-[#f0f0f3]">
            <Row label="API base URL" value={api.getBaseUrl()} onCopy={copy} />
            <Row label="API origin" value={api.getApiOrigin()} onCopy={copy} />
            <Row
              label="Last checked"
              value={health.dataUpdatedAt ? formatRelativeTime(new Date(health.dataUpdatedAt)) : '-'}
            />
          </dl>
          <p className="border-t border-[#f0f0f3] px-4 py-3 text-[11px] text-[#9b9ba6]">
            The base URL comes from <code className="rounded bg-[#f5f5f7] px-1">VITE_API_BASE_URL</code>{' '}
            and must end in <code className="rounded bg-[#f5f5f7] px-1">/api/v1</code>. Restart the dev
            server after changing it.
          </p>
        </Card>

        <Card>
          <div className="border-b border-[#f0f0f3] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[#292933]">Components</h2>
          </div>
          <QueryState
            isLoading={health.isLoading}
            error={health.error}
            isEmpty={components.length === 0}
            onRetry={() => void health.refetch()}
            emptyTitle="No component details"
            emptyDescription="Actuator responded without a components block."
            rows={3}
          >
            <ul className="divide-y divide-[#f0f0f3]">
              {components.map(([name, detail]) => (
                <li key={name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-[13px] text-[#3d3d47]">{name}</span>
                  <Badge status={detail?.status ?? 'UNKNOWN'} />
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>
      </div>
    </>
  );
};

const Row: React.FC<{ label: string; value: string; onCopy?: (value: string) => void }> = ({
  label,
  value,
  onCopy,
}) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3">
    <dt className="shrink-0 text-[12px] font-medium text-[#9b9ba6]">{label}</dt>
    <dd className="flex min-w-0 items-center gap-2">
      <span className="truncate font-mono text-[11px] text-[#3d3d47]">{value}</span>
      {onCopy && (
        <button
          type="button"
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
          onClick={() => onCopy(value)}
          className="shrink-0 rounded-md p-1 text-[#8b8b96] hover:bg-[#f5f5f7]"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </dd>
  </div>
);

export default System;
