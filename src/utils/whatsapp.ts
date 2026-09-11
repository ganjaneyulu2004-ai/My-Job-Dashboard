import { Task, Client } from '../types';

/**
 * Clean phone number to digits only (e.g. "+1 (987) 654-3210" -> "19876543210")
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Generate a pre-filled WhatsApp wa.me link for a given task and client.
 * Example: https://wa.me/19876543210?text=Hi%20SmileCare...
 */
export function getWhatsAppTaskLink(task: Task, client?: Client): string {
  const phone = client ? sanitizePhoneNumber(client.phone_number) : '';
  const clientName = client ? client.name : 'Client';
  
  const statusBadge = task.status === 'done' ? '✅ COMPLETED' : '📌 SCHEDULED TASK UPDATE';
  const text = `Hi ${clientName},\n\n${statusBadge}\n\n*Task:* ${task.title}\n*Date & Time:* ${task.date} at ${task.time}\n*Category:* ${task.work_type}\n\nPlease let me know if you have any questions or feedback!\n\nBest regards,\nYour Marketing Partner (AgencyOps)`;
  
  const encodedText = encodeURIComponent(text);
  
  if (phone) {
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
