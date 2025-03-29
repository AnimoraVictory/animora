import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../../../app/(auth)/signup"; // パスは環境に応じて調整
import { useRouter } from "expo-router";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert");

// Routerのモック
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// カラースキームのモック
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

// useSignUpのモック
const mockSignUp = jest.fn();
jest.mock("@/constants/api", () => ({
  useSignUp: () => ({
    mutate: mockSignUp,
    isPending: false,
  }),
}));

describe("SignUpScreen", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.clearAllMocks();
  });

  it("サインアップタイトルが表示される", () => {
    const { getAllByText } = render(<SignUpScreen />);
    expect(getAllByText("サインアップ")[0]).toBeTruthy(); // タイトル部分
  });

  it("入力欄が表示される（Name, Email, Password）", () => {
    const { getByLabelText } = render(<SignUpScreen />);
    expect(getByLabelText("Name")).toBeTruthy();
    expect(getByLabelText("Email")).toBeTruthy();
    expect(getByLabelText("Password")).toBeTruthy();
  });

  it("未入力でサインアップを押すとバリデーションエラーが出る", async () => {
    const { getAllByText, findByText } = render(<SignUpScreen />);
    fireEvent.press(getAllByText("サインアップ")[1]); // ボタン

    expect(await findByText("有効なメールアドレスを入力してください")).toBeTruthy();
    expect(await findByText("パスワードは8文字以上必要です")).toBeTruthy();
  });

  it("正しく入力すると signUp 関数が呼ばれる", async () => {
    mockSignUp.mockImplementation((_data, { onSuccess }) => onSuccess());

    const { getByLabelText, getAllByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByLabelText("Name"), "山田太郎");
    fireEvent.changeText(getByLabelText("Email"), "taro@example.com");
    fireEvent.changeText(getByLabelText("Password"), "Abc12345");

    fireEvent.press(getAllByText("サインアップ")[1]);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        {
          name: "山田太郎",
          email: "taro@example.com",
          password: "Abc12345",
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it("サインアップ失敗時にアラートを表示する", async () => {
    mockSignUp.mockImplementation((_data, { onError }) =>
      onError(new Error("登録失敗"))
    );

    const { getByLabelText, getAllByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByLabelText("Name"), "田中花子");
    fireEvent.changeText(getByLabelText("Email"), "hanako@example.com");
    fireEvent.changeText(getByLabelText("Password"), "Abc12345");

    fireEvent.press(getAllByText("サインアップ")[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "サインアップエラー",
        "登録失敗"
      );
    });
  });

  it("戻るボタンでルートに遷移する", () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText("戻る"));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
