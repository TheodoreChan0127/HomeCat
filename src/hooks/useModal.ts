import { Modal } from "antd";
import { useCallback } from "react";

export const useModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const showConfirm = useCallback(
    ({
      title,
      content,
      onOk,
      onCancel,
      okText = "确定",
      cancelText = "取消",
      okType = "primary",
      okButtonProps,
      cancelButtonProps,
    }: {
      title: string;
      content: string;
      onOk?: () => void;
      onCancel?: () => void;
      okText?: string;
      cancelText?: string;
      okType?: "primary" | "default" | "dashed" | "link" | "text";
      okButtonProps?: any;
      cancelButtonProps?: any;
    }) => {
      modal.confirm({
        title,
        content,
        onOk,
        onCancel,
        okText,
        cancelText,
        okType,
        okButtonProps,
        cancelButtonProps,
      });
    },
    [modal]
  );

  const showInfo = useCallback(
    ({
      title,
      content,
      onOk,
      okText = "确定",
    }: {
      title: string;
      content: string;
      onOk?: () => void;
      okText?: string;
    }) => {
      modal.info({
        title,
        content,
        onOk,
        okText,
      });
    },
    [modal]
  );

  const showSuccess = useCallback(
    ({
      title,
      content,
      onOk,
      okText = "确定",
    }: {
      title: string;
      content: string;
      onOk?: () => void;
      okText?: string;
    }) => {
      modal.success({
        title,
        content,
        onOk,
        okText,
      });
    },
    [modal]
  );

  const showWarning = useCallback(
    ({
      title,
      content,
      onOk,
      okText = "确定",
    }: {
      title: string;
      content: string;
      onOk?: () => void;
      okText?: string;
    }) => {
      modal.warning({
        title,
        content,
        onOk,
        okText,
      });
    },
    [modal]
  );

  const showError = useCallback(
    ({
      title,
      content,
      onOk,
      okText = "确定",
    }: {
      title: string;
      content: string;
      onOk?: () => void;
      okText?: string;
    }) => {
      modal.error({
        title,
        content,
        onOk,
        okText,
      });
    },
    [modal]
  );

  return {
    modal,
    contextHolder,
    showConfirm,
    showInfo,
    showSuccess,
    showWarning,
    showError,
  };
};
