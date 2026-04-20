import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLoginModalStore } from '../loginModal';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('loginModal store', () => {
  test('初期状態: isOpen === false', () => {
    const store = useLoginModalStore();
    expect(store.isOpen).toBe(false);
  });

  test('openModal() → isOpen === true', () => {
    const store = useLoginModalStore();
    store.openModal();
    expect(store.isOpen).toBe(true);
  });

  test('closeModal() → isOpen === false', () => {
    const store = useLoginModalStore();
    store.openModal();
    store.closeModal();
    expect(store.isOpen).toBe(false);
  });
});
