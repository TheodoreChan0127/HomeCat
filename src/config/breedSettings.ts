import { getItem, setItem } from "./storage";

const DEFAULT_BREEDS: string[] = [
  "英短",
  "美短",
  "布偶",
  "暹罗",
  "金吉拉",
  "缅因",
  "加菲",
  "德文",
  "斯芬克斯",
  "孟买",
  "孟加拉",
  "俄罗斯蓝猫",
  "挪威森林猫",
  "伯曼",
  "异国短毛猫",
  "苏格兰折耳",
  "美国卷耳",
  "埃及猫",
  "土耳其安哥拉",
  "土耳其梵猫",
  "其他",
];

const STORAGE_KEY = "breeds";

export const getBreeds = (): string[] => {
  const breeds = getItem<string[]>(STORAGE_KEY);
  return breeds || DEFAULT_BREEDS;
};

export const saveBreeds = (breeds: string[]): void => {
  setItem(STORAGE_KEY, breeds);
};
