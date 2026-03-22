import { EQUIPMENT_LABELS } from 'pages/constants';

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatEquipmentLabels(equipment: string[]): string {
  return equipment.map(e => EQUIPMENT_LABELS[e]).join(', ');
}
