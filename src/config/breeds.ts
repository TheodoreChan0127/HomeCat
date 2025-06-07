// 品种配置及本地存储工具

// 默认品种列表
const DEFAULT_BREEDS = ["英短", "美短", "布偶", "暹罗"];

// 获取本地存储的品种列表
export const getBreeds = (): string[] => {
  const storedBreeds = localStorage.getItem("catBreeds");
  return storedBreeds ? JSON.parse(storedBreeds) : DEFAULT_BREEDS;
};

// 保存品种列表到本地存储
export const saveBreeds = (breeds: string[]): void => {
  localStorage.setItem("catBreeds", JSON.stringify(breeds));
};

export const clearBreeds = (): void => {
  localStorage.removeItem("catBreeds");
};
