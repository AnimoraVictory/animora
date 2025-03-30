import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import WelcomeScreen from "../../../app/(auth)";

// routerのモック
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// useColorSchemeのモック
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

describe("WelcomeScreen", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    pushMock.mockReset();
  });

  it("タイトルが表示される", () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText("Animaliaへようこそ!")).toBeTruthy();
  });

  it("ログインボタンが表示される", () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText("ログイン")).toBeTruthy();
  });

  it("新規ユーザー登録ボタンが表示される", () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText("新規ユーザー登録")).toBeTruthy();
  });

  it("ログインボタンを押すとsigninに遷移する", async() => {
    const { getByText } = render(<WelcomeScreen />);
    await act(async () => {
      fireEvent.press(getByText("ログイン"));
    })
    expect(pushMock).toHaveBeenCalledWith("/(auth)/signin");
  });

  it("新規ユーザー登録ボタンを押すとsignupに遷移する", async () => {
    const { getByText } = render(<WelcomeScreen />);
    await act(async() => {
      fireEvent.press(getByText("新規ユーザー登録"));
    })
    expect(pushMock).toHaveBeenCalledWith("/(auth)/signup");
  });
});
