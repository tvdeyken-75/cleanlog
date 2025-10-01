import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Protocol } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getProtocolTitle(protocol: Protocol) {
    switch (protocol.type) {
        case 'cleaning': return 'Reinigungsprotokoll';
        case 'fuel': return 'Tankprotokoll';
        case 'pause': return 'Pausenprotokoll';
        case 'loading': return 'Ladeprotokoll';
        case 'delivery': return 'Lieferprotokoll';
        case 'emergency': return 'Notfallprotokoll';
        case 'maintenance': return 'Wartungsprotokoll';
        case 'expense': return 'Spesenprotokoll';
        default: return 'Protokoll';
    }
}

export function formatProtocolForSharing(protocol: Protocol) {
  const title = `${getProtocolTitle(protocol)} - ${new Date(protocol.end_time).toLocaleDateString('de-DE')}`;
  
  const textContent = Object.entries(protocol)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}:\n${JSON.stringify(value, null, 2)}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n\n');

  const jsonContent = JSON.stringify(protocol, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const file = new File([blob], `protocol-${protocol.id}.json`, { type: 'application/json' });

  return {
    title,
    text: textContent,
    files: [file],
  };
}
