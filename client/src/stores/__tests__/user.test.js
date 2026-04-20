import { describe, test, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import axiosInstance from '@/axios';
import { useUserStore } from '../user';

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.clearAllMocks();
});

describe('isJwtTokenExists()', () => {
  test('JWT あり → true', () => {
    localStorage.setItem('jwt', 'token123');
    const store = useUserStore();
    expect(store.isJwtTokenExists()).toBe(true);
  });

  test('JWT なし → false', () => {
    const store = useUserStore();
    expect(store.isJwtTokenExists()).toBe(false);
  });
});

describe('fetchUser()', () => {
  test('API成功 → user がセットされる', async () => {
    localStorage.setItem('jwt', 'token123');
    axiosInstance.get.mockResolvedValue({ data: { id: 1, username: 'yoko' } });
    const store = useUserStore();
    await store.fetchUser();
    expect(store.user).toEqual({ id: 1, username: 'yoko' });
  });

  test('API失敗 → user が null のまま', async () => {
    localStorage.setItem('jwt', 'token123');
    axiosInstance.get.mockRejectedValue(new Error('Network Error'));
    const store = useUserStore();
    await store.fetchUser();
    expect(store.user).toBeNull();
  });

  test('JWT なし → API を呼ばない', async () => {
    const store = useUserStore();
    await store.fetchUser();
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });
});

describe('logout()', () => {
  test('API成功 → user が null、localStorage から jwt 削除', async () => {
    localStorage.setItem('jwt', 'token123');
    axiosInstance.post.mockResolvedValue({});
    const store = useUserStore();
    store.user = { id: 1, username: 'yoko' };
    await store.logout();
    expect(store.user).toBeNull();
    expect(localStorage.getItem('jwt')).toBeNull();
  });

  test('API失敗 → user は変わらない、localStorage の jwt も残る', async () => {
    localStorage.setItem('jwt', 'token123');
    axiosInstance.post.mockRejectedValue(new Error('Network Error'));
    const store = useUserStore();
    store.user = { id: 1, username: 'yoko' };
    store.logout();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(store.user).toEqual({ id: 1, username: 'yoko' });
    expect(localStorage.getItem('jwt')).toBe('token123');
  });
});

describe('isLoggedIn getter', () => {
  test('user が null → false', () => {
    const store = useUserStore();
    expect(store.isLoggedIn).toBe(false);
  });

  test('user がオブジェクト → true', () => {
    const store = useUserStore();
    store.user = { id: 1, username: 'yoko' };
    expect(store.isLoggedIn).toBe(true);
  });

  test('getUser: user が null → null を返す', () => {
    const store = useUserStore();
    expect(store.getUser).toBeNull();
  });

  test('getUser: user がオブジェクト → user を返す', () => {
    const store = useUserStore();
    store.user = { id: 1, username: 'yoko' };
    expect(store.getUser).toEqual({ id: 1, username: 'yoko' });
  });
});

describe('toggleChatEnabled()', () => {
  test('API成功 → chat_enabled がトグルされる', async () => {
    axiosInstance.put.mockResolvedValue({});
    const store = useUserStore();
    store.user = { id: 1 };
    store.chat_enabled = false;
    await store.toggleChatEnabled();
    expect(store.chat_enabled).toBe(true);
  });

  test('API失敗 → chat_enabled は変わらない', async () => {
    axiosInstance.put.mockRejectedValue(new Error('Server Error'));
    const store = useUserStore();
    store.user = { id: 1 };
    store.chat_enabled = false;
    await expect(store.toggleChatEnabled()).rejects.toThrow();
    expect(store.chat_enabled).toBe(false);
  });
});
