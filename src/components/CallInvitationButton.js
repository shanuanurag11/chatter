import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  // Get the target user data
  const userData = getTargetUserData();
  const invitees = [userData];

  // Render the ZEGOCLOUD call invitation button directly
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
});

export default CallInvitationButton; 