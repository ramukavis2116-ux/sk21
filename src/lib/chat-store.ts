export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Chat {
  chatId: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

const KEY = 'studyai_chats';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function loadChats(): Chat[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Chat[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(chats));
}

export function getChat(chatId: string): Chat | undefined {
  return loadChats().find(c => c.chatId === chatId);
}

export function newChatId(): string {
  return (isBrowser() && window.crypto?.randomUUID)
    ? window.crypto.randomUUID()
    : `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function titleFrom(message: string): string {
  const clean = message.trim().replace(/\s+/g, ' ');
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean || 'New chat';
}

export function upsertChat(chat: Chat): Chat[] {
  const chats = loadChats().filter(c => c.chatId !== chat.chatId);
  const next = [chat, ...chats].sort((a, b) => b.timestamp - a.timestamp);
  saveChats(next);
  return next;
}

export function renameChat(chatId: string, title: string): Chat[] {
  const chats = loadChats();
  const chat = chats.find(c => c.chatId === chatId);
  if (!chat) return chats;
  const next = chats.map(c => (c.chatId === chatId ? { ...c, title: title.trim() || c.title } : c));
  saveChats(next);
  return next;
}

export function deleteChat(chatId: string): Chat[] {
  const next = loadChats().filter(c => c.chatId !== chatId);
  saveChats(next);
  return next;
}
