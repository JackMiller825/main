import { redactRpcUrl, validateRpcUrl } from '@launchpad/shared';
import { useState } from 'react';
import { appMode } from '../config';
import { useDashboard } from '../store';

export function RpcModal({ onClose }: { onClose: () => void }) {
  const showDialog = useDashboard((state) => state.showDialog);
  const [frontendHttp, setFrontendHttp] = useState('');
  const [frontendWs, setFrontendWs] = useState('');
  const [backendHttp, setBackendHttp] = useState('');
  const [backendWs, setBackendWs] = useState('');
  const [status, setStatus] = useState('Frontend HTTP: not configured. Frontend WSS: not configured. Backend HTTP: not configured. Backend WSS: not configured.');
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rpc-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="rpc-title">RPC settings</h2>
        <p>This layout is source-derived. Frontend fields stay in this browser. Backend fields are not changed from a demo fixture.</p>
        <label className="field"><span>Frontend HTTP RPC</span><input aria-label="Frontend HTTP RPC" value={frontendHttp} onChange={(event) => setFrontendHttp(event.target.value)} /></label>
        <label className="field"><span>Frontend WebSocket RPC</span><input aria-label="Frontend WebSocket RPC" value={frontendWs} onChange={(event) => setFrontendWs(event.target.value)} /></label>
        <div className="row">
          <button type="button" className="btn" onClick={() => setStatus(describe(frontendHttp, frontendWs))}>Set Frontend RPC</button>
          <button type="button" className="btn-ghost" onClick={() => { setFrontendHttp(''); setFrontendWs(''); setStatus('Frontend RPC reset.'); }}>Reset</button>
        </div>
        <label className="field"><span>Backend HTTP RPC</span><input aria-label="Backend HTTP RPC" value={backendHttp} onChange={(event) => setBackendHttp(event.target.value)} /></label>
        <label className="field"><span>Backend WebSocket RPC</span><input aria-label="Backend WebSocket RPC" value={backendWs} onChange={(event) => setBackendWs(event.target.value)} /></label>
        <div className="row">
          <button type="button" className="btn" onClick={() => {
            const http = backendHttp ? validateRpcUrl(backendHttp, appMode) : { ok: true as const, href: '' };
            const ws = backendWs ? validateRpcUrl(backendWs, appMode) : { ok: true as const, href: '' };
            if (!http.ok || !ws.ok) {
              showDialog('RPC', !http.ok ? http.error : !ws.ok ? ws.error : 'Invalid RPC URL.');
              return;
            }
            showDialog('RPC', 'Backend RPC was not changed. An owner session is required, and this demo does not store credentials.');
          }}>Set Backend RPC</button>
          <button type="button" className="btn-ghost" onClick={() => { setBackendHttp(''); setBackendWs(''); }}>Restore environment default</button>
        </div>
        <label className="checks"><input type="checkbox" disabled /> Use fork</label>
        <p>{status}</p>
        <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function describe(http: string, ws: string): string {
  const httpStatus = http ? `configured as ${redactRpcUrl(http)}` : 'not configured';
  const wsStatus = ws ? `configured as ${redactRpcUrl(ws)}` : 'not configured';
  return `Frontend HTTP: ${httpStatus}. Frontend WSS: ${wsStatus}. Backend HTTP: not configured. Backend WSS: not configured.`;
}
