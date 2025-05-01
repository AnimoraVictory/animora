import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUpScreen from '../../../app/(auth)/signup'; // パスは調整
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {}); // 警告抑制

// Router モック
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// カラースキームモック
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

// React Query のモック
const mockMutate = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: mockMutate, isPending: false }),
}));

describe('SignUpScreen', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.clearAllMocks();
  });

  it('サインアップタイトルが表示される', () => {
    const { getAllByText } = render(<SignUpScreen />);
    expect(getAllByText('サインアップ')[0]).toBeTruthy();
  });

  it('入力欄が表示される（Name, Email, Password）', () => {
    const { getByLabelText } = render(<SignUpScreen />);
    expect(getByLabelText('Name')).toBeTruthy();
    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
  });

  it('未入力でサインアップを押すとバリデーションエラーが出る', async () => {
    const { getAllByText, findByText, getByTestId } = render(<SignUpScreen />);
    fireEvent.press(getByTestId('check-agree')); // チェックボックスをオンにする

    await act(async () => {
      fireEvent.press(getAllByText('サインアップ')[1]);
    });

    expect(
      await findByText('有効なメールアドレスを入力してください')
    ).toBeTruthy();
    expect(await findByText('パスワードは8文字以上必要です')).toBeTruthy();
  });

  it('正しく入力すると mutate 関数が呼ばれる', async () => {
    const { getByLabelText, getAllByText, getByTestId } = render(
      <SignUpScreen />
    );
    fireEvent.press(getByTestId('check-agree'));

    fireEvent.changeText(getByLabelText('Name'), '山田太郎');
    fireEvent.changeText(getByLabelText('Email'), 'taro@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'Abc12345');

    await act(async () => {
      fireEvent.press(getAllByText('サインアップ')[1]);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          name: '山田太郎',
          email: 'taro@example.com',
          password: 'Abc12345',
        },
        expect.any(Object)
      );
    });
  });

  it('サインアップ失敗時にアラートを表示する', async () => {
    mockMutate.mockImplementation((_data, { onError }) => {
      onError?.(new Error('エラー'));
    });

    const { getByLabelText, getAllByText, getByTestId } = render(
      <SignUpScreen />
    );
    fireEvent.press(getByTestId('check-agree'));

    fireEvent.changeText(getByLabelText('Name'), '田中花子');
    fireEvent.changeText(getByLabelText('Email'), 'hanako@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'Abc12345');

    await act(async () => {
      fireEvent.press(getAllByText('サインアップ')[1]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'サインアップエラー',
        expect.any(String)
      );
    });
  });

  it('戻るボタンでルートに遷移する', () => {
    const { getByText } = render(<SignUpScreen />);
    act(() => {
      fireEvent.press(getByText('戻る'));
    });
    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
