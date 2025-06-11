import { message } from "antd";
import { useCallback } from "react";

export const useMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showSuccess = useCallback(
    (content: string) => {
      messageApi.success(content);
    },
    [messageApi]
  );

  const showError = useCallback(
    (content: string) => {
      messageApi.error(content);
    },
    [messageApi]
  );

  const showWarning = useCallback(
    (content: string) => {
      messageApi.warning(content);
    },
    [messageApi]
  );

  const showInfo = useCallback(
    (content: string) => {
      messageApi.info(content);
    },
    [messageApi]
  );

  return {
    messageApi,
    contextHolder,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
