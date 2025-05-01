import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useReportPost } from '@/features/report/useReportPost';

type Props = {
  visible: boolean;
  onClose: () => void;
  postId: string;
  userId: string;
};

const reportReasons = [
  '他のユーザーまたは第三者を誹謗中傷する行為',
  '差別的、攻撃的、または他者に不快感を与える内容の投稿',
  '暴力的、グロテスク、性的描写を含む不適切なコンテンツの投稿',
  '虚偽の情報を提供する行為、または他人になりすます行為',
  '本サービスの健全な運営を妨げる行為',
  '法令または公序良俗に違反する行為',
];

const ReportPostModal: React.FC<Props> = ({
  visible,
  onClose,
  postId,
  userId,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const { sendReportMutation } = useReportPost();

  const onSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('エラー', '通報理由を選択してください');
      return;
    }

    try {
      await sendReportMutation.mutateAsync({
        postId,
        userId,
        reason: selectedReason,
      });
      Alert.alert('通報が送信されました');
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '通報送信に失敗しました');
    }
  };

  const handleReport = async () => {
    if (!selectedReason) {
      Alert.alert('通報理由を選択してください');
      return;
    }
    await onSubmit();
    onClose();
    setSelectedReason(null);
  };

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sendReportMutation.isPending) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [sendReportMutation.isPending, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.overlay}>
        {sendReportMutation.isPending && (
          <View style={styles.loadingOverlay}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <FontAwesome5 name="paw" size={48} color="#fff" />
            </Animated.View>
          </View>
        )}
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>通報</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            本通報は全てのコミュニティーガイドラインに基づき確認されます。
            必ずしも正しい選択でなくても構いません。
          </Text>

          <ScrollView style={styles.reasonList}>
            {reportReasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioContainer}
                onPress={() => setSelectedReason(reason)}
              >
                <Ionicons
                  name={
                    selectedReason === reason
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={20}
                  color="#333"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Text style={styles.reportButtonText}>通報する</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ReportPostModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    color: '#555',
    marginBottom: 12,
    fontSize: 14,
  },
  reasonList: {
    marginBottom: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reasonText: {
    fontSize: 14,
    flexShrink: 1,
    color: '#333',
  },
  reportButton: {
    backgroundColor: '#e63946',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
