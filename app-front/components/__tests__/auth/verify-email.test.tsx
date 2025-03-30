import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import VerifyEmailScreen from "../../../app/(auth)/verify-email"; // パスを調整
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

jest.spyOn(Alert, "alert");

// expo-router のモック
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// 色スキームモック
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

// useVerifyEmail モック
const mockVerifyEmail = jest.fn();
jest.mock("@/constants/api", () => ({
  useVerifyEmail: () => ({
    mutate: mockVerifyEmail,
  }),
}));

describe("VerifyEmailScreen", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      email: "test@example.com",
    });
    jest.clearAllMocks();
  });

  it("タイトルが表示される", () => {
    const { getByText } = render(<VerifyEmailScreen />);
    expect(getByText("メール認証")).toBeTruthy();
  });

  it("EmailとCodeの入力欄がある", () => {
    const { getByLabelText } = render(<VerifyEmailScreen />);
    expect(getByLabelText("Email")).toBeTruthy();
    expect(getByLabelText("Code")).toBeTruthy();
  });

  it("未入力で送信するとバリデーションエラーが出る", async () => {
    const { getByText, findByText, getByLabelText } = render(
      <VerifyEmailScreen />
    );
    await act(async () => {
      fireEvent.changeText(getByLabelText("Email"), "");
      fireEvent.changeText(getByLabelText("Code"), "");
      fireEvent.press(getByText("認証する"));
    });

    expect(await findByText("無効なメールアドレス")).toBeTruthy();
    expect(await findByText("確認コードを入力してください")).toBeTruthy();
  });

  it("正しい入力でverifyEmailが呼ばれ、成功時に画面遷移", async () => {
    mockVerifyEmail.mockImplementation((_data, { onSuccess }) => onSuccess());

    const { getByLabelText, getByText } = render(<VerifyEmailScreen />);
    await act(async () => {
      fireEvent.changeText(getByLabelText("Email"), "test@example.com");
      fireEvent.changeText(getByLabelText("Code"), "123456");
      fireEvent.press(getByText("認証する"));
    });

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          code: "123456",
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "認証成功",
        "メール認証が完了しました"
      );
      expect(pushMock).toHaveBeenCalledWith("/(auth)/signin");
    });
  });

  it("エラー時にアラートを表示する", async () => {
    mockVerifyEmail.mockImplementation((_data, { onError }) =>
      onError(new Error("無効なコード"))
    );

    const { getByLabelText, getByText } = render(<VerifyEmailScreen />);
    await act(() => {
      fireEvent.changeText(getByLabelText("Email"), "test@example.com");
      fireEvent.changeText(getByLabelText("Code"), "invalid");
      fireEvent.press(getByText("認証する"));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("認証エラー", "無効なコード");
    });
  });
});
