import { v4 as uuidv4 } from 'uuid';

export function generateQRCode(): string {
  const year = new Date().getFullYear();
  const uuid = uuidv4().split('-')[0].toUpperCase();
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `UBT-${year}-${uuid}-${sequence}`;
}

export function generateProductId(): string {
  return uuidv4();
}

export function generatePartnerId(): string {
  return uuidv4();
}

export function generateUserId(): string {
  return uuidv4();
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function getCurrentDate(): string {
  return formatDate(new Date());
}
