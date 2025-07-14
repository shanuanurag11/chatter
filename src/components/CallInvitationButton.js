import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import zegoService from '../services/zegoService';

const CallInvitationButton = ({ 
  targetUser, 
  isVideoCall = false, 
  onCallStarted, 
  onCallFailed,
  style,
  disabled = false 
}) => {
  const [ZegoSendCallInvitationButton, setZegoSendCallInvitationButton] = useState(null);
  const navigation = useNavigation();
  
  console.log("targetUser-131->",targetUser);  
  useEffect(() => {
    // Dynamically import the ZEGOCLOUD call invitation button
    const loadCallButton = async () => {
      try {
        const { ZegoSendCallInvitationButton } = await import('@zegocloud/zego-uikit-prebuilt-call-rn');
        setZegoSendCallInvitationButton(() => ZegoSendCallInvitationButton);
      } catch (error) {
        console.error('Failed to load ZEGOCLOUD call button:', error);
      }
    };

    loadCallButton();
  }, []);

  // Check if user has sufficient total_seconds for calling
  const checkCallEligibility = () => {
    console.log("Checking call eligibility for targetUser:", JSON.stringify(targetUser, null, 2));
    const min_seconds_for_call = 4;
    // Check if targetUser has total_seconds property
    if (targetUser && targetUser.total_seconds !== undefined) {
      console.log("Found total_seconds:", targetUser.total_seconds);
      if (targetUser.total_seconds < min_seconds_for_call) {
        console.log("Insufficient total_seconds, blocking call");
        return false;
      }
      console.log("Sufficient total_seconds, allowing call");
    } else {
      console.log("No total_seconds found in targetUser, allowing call");
    }
    return true;
  };

  // Handle disabled button click
  const handleDisabledButtonClick = () => {
    Alert.alert(
      'Insufficient Time',
      'You need at least 4 seconds to make a call. Please add more time to your account.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            console.log("User acknowledged insufficient time, going back");
            // navigation.goBack();
          }
        }
      ]
    );
  };

  // Extract the correct target user data from the chat object
  const getTargetUserData = () => {
    // If targetUser has other_participant, use that (chat object structure)
    if (targetUser.other_participant) {
      return {
        userID: String(targetUser.other_participant.id),
        userName: targetUser.other_participant.name || targetUser.name
      };
    }
    
    // If targetUser is a direct user object (UserDetailsScreen structure)
    if (targetUser.id) {
      return {
        userID: String(targetUser.id),
        userName: targetUser.name || targetUser.userName
      };
    }
    
    // Fallback
    return {
      userID: String(targetUser.userID || 'unknown'),
      userName: targetUser.userName || targetUser.name || 'Unknown User'
    };
  };

  // If ZEGOCLOUD call button is not loaded yet, show loading
  if (!ZegoSendCallInvitationButton) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Check if call is eligible
  const isCallEligible = checkCallEligibility();

  // If call is not eligible, render disabled button
  if (!isCallEligible) {
    return (
      <TouchableOpacity
        onPress={handleDisabledButtonClick}
        style={[styles.disabledContainer, style]}
        activeOpacity={0.7}
      >
        <Text style={styles.disabledText}>Buy Token</Text>
      </TouchableOpacity>
    );
  }

  // Get the target user data
  const userData = getTargetUserData();
  const invitees = [userData];

  // Render the ZEGOCLOUD call invitation button (only when eligible)
  return (
    <ZegoSendCallInvitationButton
      invitees={invitees}
      isVideoCall={isVideoCall}
      resourceID={"zego_call"}
      disabled={disabled}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  loadingText: {
    fontSize: 14,
    color: '#888888',
  },
  disabledContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  disabledText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
  },
});

export default CallInvitationButton; 