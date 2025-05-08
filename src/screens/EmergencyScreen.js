import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const EmergencyScreen = () => {
  const [voiceActive, setVoiceActive] = useState(false);
  const [emergencyActivated, setEmergencyActivated] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  const updateStatus = status => {
    setCurrentStatus(status);
    setStatusHistory(prev => [
      ...prev,
      {text: status, timestamp: new Date().toLocaleTimeString()},
    ]);
  };

  const handleEmergency = (type = 'manual') => {
    setEmergencyActivated(true);
    setLoading(true);
    updateStatus('Verifying identity...');
    Alert.alert(
      'Emergency Triggered!',
      `Emergency activated via ${type}. Help is on the way.`,
    );
    simulateEmergencyFlow();
  };

  const simulateEmergencyFlow = () => {
    setTimeout(() => {
      updateStatus('Sending emergency data and health profile...');
      setTimeout(() => {
        updateStatus('Emergency services analyzing severity...');
        setTimeout(() => {
          updateStatus('Emergency logged. Awaiting response...');
          setLoading(false);
          const isHighSeverity = Math.random() > 0.5;
          if (isHighSeverity) {
            simulateHighSeverityResponse();
          } else {
            simulateNonEmergencyResponse();
          }
        }, 800);
      }, 700);
    }, 600);
  };

  const simulateHighSeverityResponse = () => {
    setTimeout(() => {
      updateStatus('⚠️ HIGH SEVERITY: Emergency services alerted');
      setTimeout(() => {
        updateStatus('🚁 Drone dispatched with instructions');
        setTimeout(() => {
          updateStatus('🔴 First-aid guidance available');
          setTimeout(() => {
            updateStatus('🚑 Medical personnel dispatched to your location');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const simulateNonEmergencyResponse = () => {
    setTimeout(() => {
      updateStatus('ℹ️ NON-EMERGENCY: Medical need identified');
      setTimeout(() => {
        updateStatus('🚁 Drone dispatched with medication');
        setTimeout(() => {
          updateStatus('💊 Medication delivered with guidance');
          setTimeout(() => {
            updateStatus('✅ Delivery confirmed. Patient status updated.');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const startVoiceRecognition = () => {
    setVoiceActive(true);
    setTimeout(() => {
      stopVoiceRecognition();
      handleEmergency('voice');
    }, 2000);
  };

  const stopVoiceRecognition = () => {
    setVoiceActive(false);
  };

  const resetEmergency = () => {
    setEmergencyActivated(false);
    setCurrentStatus('');
    setStatusHistory([]);
    setLoading(false);
    Alert.alert('Emergency Reset', 'The emergency request has been canceled.');
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const StatusUpdates = ({status, history}) => (
    <View style={styles.statusContainer}>
      <Text style={styles.statusTitle}>Emergency Status</Text>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Processing your emergency...</Text>
        </View>
      )}
      <ScrollView
        style={styles.statusHistory}
        contentContainerStyle={styles.statusHistoryContent}
        showsVerticalScrollIndicator={false}>
        {history.map((item, index) => (
          <View
            key={index}
            style={[
              styles.statusItem,
              index === history.length - 1 ? styles.statusItemCurrent : null,
            ]}>
            <Text
              style={[
                styles.statusText,
                index === history.length - 1 ? styles.statusTextCurrent : null,
              ]}>
              {item.text}
            </Text>
            <Text
              style={[
                styles.statusTime,
                index === history.length - 1 ? styles.statusTimeCurrent : null,
              ]}>
              {item.timestamp}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LinearGradient colors={['#F8FAFC', '#E5E7EB']} style={styles.background}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.header}>
              <FontAwesome5
                name="exclamation-circle"
                size={18}
                color="#1F2937"
                solid
                style={styles.headerIcon}
              />
              <Text style={styles.title}>Emergency Response</Text>
              <Text style={styles.subtitle}>
                Immediate Assistance Available 24/7
              </Text>
            </View>

            {!emergencyActivated ? (
              <View style={styles.actionArea}>
                <Animated.View
                  style={[
                    styles.emergencyButtonContainer,
                    {transform: [{scale: buttonScale}]},
                  ]}>
                  <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={() => handleEmergency('manual')}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    activeOpacity={0.8}>
                    <FontAwesome5
                      name="ambulance"
                      size={40}
                      color="#FFFFFF"
                      solid
                    />
                    <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={[
                      styles.voiceButton,
                      voiceActive && styles.voiceButtonActive,
                    ]}
                    onPress={
                      voiceActive ? stopVoiceRecognition : startVoiceRecognition
                    }
                    activeOpacity={0.7}>
                    <FontAwesome5
                      name="microphone"
                      size={18}
                      color="#FFFFFF"
                      solid
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.voiceButtonText}>
                      {voiceActive ? 'STOP RECORDING' : 'VOICE ACTIVATION'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>
                    How to Use Emergency Response
                  </Text>
                  <Text style={styles.infoText}>
                    • Press the <Text style={styles.boldText}>EMERGENCY</Text>{' '}
                    button to request immediate help.
                  </Text>
                  <Text style={styles.infoText}>
                    • Use <Text style={styles.boldText}>VOICE ACTIVATION</Text>{' '}
                    to trigger help hands-free.
                  </Text>
                  <Text style={styles.infoText}>
                    • Your request will be sent to the Medical Drone Dispatch
                    Portal for rapid response.
                  </Text>
                  <Text style={styles.infoText}>
                    • Drones may deliver medication or first-aid guidance as
                    needed.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emergencyActive}>
                <View style={styles.emergencyHeader}>
                  <Text style={styles.emergencyHeaderText}>
                    EMERGENCY ACTIVE
                  </Text>
                </View>
                <StatusUpdates status={currentStatus} history={statusHistory} />
                <Animated.View style={{transform: [{scale: buttonScale}]}}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetEmergency}
                    onPressIn={handleButtonPressIn}
                    onPressOut={handleButtonPressOut}
                    activeOpacity={0.7}>
                    <FontAwesome5
                      name="times"
                      size={18}
                      color="#FFFFFF"
                      solid
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.cancelButtonText}>
                      CANCEL EMERGENCY
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 20,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionArea: {
    alignItems: 'center',
    gap: 20,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: width * 0.325,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  emergencyButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  secondaryActions: {
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 24,
    alignItems: 'center',
    width: width * 0.65,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#007BFF',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  voiceButtonActive: {
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
  },
  voiceButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '92%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 40,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 8,
  },
  boldText: {
    fontFamily: 'Inter-Regular',
    fontWeight: '600',
    color: '#1F2937',
  },
  emergencyActive: {
    flex: 1,
    gap: 16,
    paddingBottom: 20,
  },
  emergencyHeader: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emergencyHeaderText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#6B7280',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 16,
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statusTitle: {
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusHistory: {
    maxHeight: 320,
  },
  statusHistoryContent: {
    paddingBottom: 10,
  },
  statusItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusItemCurrent: {
    borderLeftWidth: 3,
    borderLeftColor: '#007BFF',
    backgroundColor: '#E8F0FE',
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    fontSize: 16,
  },
  statusTextCurrent: {
    color: '#007BFF',
    fontWeight: '600',
  },
  statusTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statusTimeCurrent: {
    color: '#007BFF',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    color: '#007BFF',
    marginTop: 8,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default EmergencyScreen;
