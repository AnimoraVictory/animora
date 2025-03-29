import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignInScreen from "../../../app/(auth)/signin"; // パスを調整
import { useRouter } from "expo-router";

// Alertのモック
import { Alert } from "react-native";
jest.spyOn(Alert, "alert");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// useColorSchemeのモック
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

const mockLogin = jest.fn();

jest.mock("@/providers/AuthContext", () => {
  return {
    useAuth: () => ({
      login: mockLogin,
    }),
  };
});

describe("SignInScreen", () => {
  const pushMock = jest.fn();
  const replaceMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock, replace: replaceMock });
    jest.clearAllMocks();
  });

  it("画面タイトルが表示される", () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText("サインイン")).toBeTruthy();
  });

  it("メールアドレスとパスワードの入力欄がある", () => {
    const { getByLabelText } = render(<SignInScreen />);
    expect(getByLabelText("Email")).toBeTruthy();
    expect(getByLabelText("Password")).toBeTruthy();
  });

  it("未入力でログインを押すとバリデーションエラーが表示される", async () => {
    const { getByText, findByText } = render(<SignInScreen />);
    fireEvent.press(getByText("ログイン"));

    expect(await findByText("有効なメールアドレスを入力してください")).toBeTruthy();
    expect(await findByText("パスワードを入力してください")).toBeTruthy();
  });

  it("正しい入力でログイン処理が呼ばれ、ルーティングされる", async () => {
    mockLogin.mockResolvedValueOnce(undefined); // 成功時は undefined で良い

    const { getByLabelText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByLabelText("Email"), "test@example.com");
    fireEvent.changeText(getByLabelText("Password"), "password123");
    fireEvent.press(getByText("ログイン"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(replaceMock).toHaveBeenCalledWith("/(tabs)/posts");
    });
  });

  it("ログイン失敗時はアラートを表示する", async () => {
    mockLogin.mockRejectedValueOnce(new Error("認証失敗"));

    const { getByLabelText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByLabelText("Email"), "user@test.com");
    fireEvent.changeText(getByLabelText("Password"), "wrongpass");
    fireEvent.press(getByText("ログイン"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("ログインエラー", "認証失敗");
    });
  });

  it("ユーザー登録ボタンを押すとsignup画面に遷移する", () => {
    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText("ユーザー登録がまだの方はこちら"));
    expect(pushMock).toHaveBeenCalledWith("/signup");
  });
});
