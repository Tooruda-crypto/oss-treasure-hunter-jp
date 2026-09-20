import { isIP } from 'node:net';

export const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]{1,100}$/;
export function repoName(value) {
  if (typeof value !== 'string' || !REPO.test(value) || ['.','..'].includes(value.split('/')[1])) throw new Error('INVALID_REPOSITORY');
  return value;
}
export function publicUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return null;
    if (isIP(u.hostname) || u.hostname.includes(':') || !u.hostname.includes('.') || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(u.hostname)) return null;
    // Evidence links only; never fetched. Drop query and fragment (may contain credentials).
    u.search = ''; u.hash = '';
    return u.href.replace(/[()'"]/g,c=>`%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch { return null; }
}
const secrets = /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|AKIA[A-Z0-9]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|Bearer\s+[A-Za-z0-9_.-]{12,})/gi;
export function redact(value, token = '') {
  let s = String(value ?? '');
  if (token) s = s.split(token).join('[REDACTED]');
  return s.replace(secrets, '[REDACTED]').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[EMAIL]');
}
export function text(value, max = 300) {
  return redact(value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function md(value) { return text(value, 3000).replace(/[\\`*_{}\[\]<>()!#|]/g, '\\$&'); }
export function secretMatches(value) { return [...String(value).matchAll(new RegExp(secrets.source, 'gi'))].length; }
