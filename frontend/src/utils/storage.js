// LocalStorage utilities for storing bag IDs
const STORAGE_KEY = 'baggage_tracker_bags';

export function getStoredBags() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addStoredBag(bag) {
  try {
    const bags = getStoredBags();
    // Check if bag already exists
    if (!bags.find(b => b.id === bag.id)) {
      bags.unshift(bag); // Add to beginning
      // Keep only last 50 bags
      const limited = bags.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    }
  } catch (error) {
    console.error('Error storing bag:', error);
  }
}

export function removeStoredBag(bagId) {
  try {
    const bags = getStoredBags();
    const filtered = bags.filter(b => b.id !== bagId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing bag:', error);
  }
}