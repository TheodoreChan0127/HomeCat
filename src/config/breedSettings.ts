import { getItem, setItem } from "./storage";

const DEFAULT_BREEDS: string[] = ["英短", "美短", "布偶", "暹罗"];

const STORAGE_KEY = "breeds";

export const getBreeds = (): string[] => {
  const breeds = getItem<string[]>(STORAGE_KEY);
  return breeds || DEFAULT_BREEDS;
};

export const saveBreeds = (breeds: string[]): void => {
  setItem(STORAGE_KEY, breeds);
};
