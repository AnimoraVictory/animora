import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

type EmptyInputModalProps = {
  visible: boolean;
  onClose: () => void;
};

const EmptyInputModal: React.FC<EmptyInputModalProps> = ({ visible, onClose }) => {
  const [text, setText] = useState('');

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <TextInput
              style={styles.input}
              placeholder="ここに入力"
              value={text}
              onChangeText={setText}
              autoFocus
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 2,
  },
});

export default EmptyInputModal;
