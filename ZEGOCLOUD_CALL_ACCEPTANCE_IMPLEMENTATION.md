# ZEGOCLOUD Call Acceptance Implementation with Notification Callbacks

This document explains the implementation of ZEGOCLOUD call acceptance callbacks that notify the server when calls are picked up, following the official ZEGOCLOUD documentation.

## Overview

The implementation adds call acceptance callbacks to the ZEGOCLOUD Call Kit configuration to ensure that the server is notified whenever:
- A call is accepted (on both caller and called sides)
- A call is declined
- A call times out

## Implementation Details

### 1. ZEGOCLOUD Service Initialization (`src/services/zegoService.js`)

The `ZegoService` class now includes call acceptance callbacks in the initialization:

```javascript
await ZegoUIKitPrebuiltCallService.init(
  ZEGO_CONFIG.APP_ID,
  ZEGO_CONFIG.APP_SIGN,
  userID,
  userName,
  [ZIM, ZPNs],
  {
    requireConfig: (data) => ({
      timingConfig: {
        isDurationVisible: true,
        onDurationUpdate: (durationInSec) => {
          console.log('Call duration:', durationInSec, 'seconds');
          if (durationInSec === duration) {
            ZegoUIKitPrebuiltCallService.hangUp();
          }
        },
      },
      // Add call invitation configuration with acceptance callbacks
      callInvitationConfig: {
        // Called when a call invitation is accepted (on caller side)
        onIncomingCallAccepted: async (callID, caller, type) => {
          console.log('[ZegoService] Call accepted by recipient:', { callID, caller, type });
          try {
            await callHistoryService.initiateCall({
              call_id: callID,
              call_type: type === 1 ? 'video' : 'audio',
              recipient_id: caller.userID,
              status: 'accepted'
            });
            console.log('[ZegoService] Call acceptance notification sent successfully');
          } catch (error) {
            console.error('[ZegoService] Error notifying call acceptance:', error);
          }
        },
        // Called when a call invitation is accepted (on called side)
        onOutgoingCallAccepted: async (callID, callee, type) => {
          console.log('[ZegoService] Outgoing call accepted by:', { callID, callee, type });
          try {
            await callHistoryService.initiateCall({
              call_id: callID,
              call_type: type === 1 ? 'video' : 'audio',
              recipient_id: callee.userID,
              status: 'accepted'
            });
            console.log('[ZegoService] Outgoing call acceptance notification sent successfully');
          } catch (error) {
            console.error('[ZegoService] Error notifying outgoing call acceptance:', error);
          }
        },
        // Additional callbacks for declined and timeout scenarios...
      },
    }),
  },
  {
    androidNotificationConfig: {
      channelID: "ZegoUIKit",
      channelName: "ZegoUIKit",
    },
  }
);
```

### 2. Call Invitation Button (`src/components/CallInvitationButton.js`)

The `CallInvitationButton` component includes the same callbacks:

```javascript
<ZegoSendCallInvitationButton
  invitees={invitees}
  isVideoCall={isVideoCall}
  resourceID={"zego_call"}
  disabled={disabled}
  style={style}
  // Add call acceptance callbacks
  onIncomingCallAccepted={async (callID, caller, type) => {
    console.log('[CallInvitationButton] Call accepted by recipient:', { callID, caller, type });
    try {
      await callHistoryService.initiateCall({
        call_id: callID,
        call_type: type === 1 ? 'video' : 'audio',
        recipient_id: caller.userID,
        status: 'accepted'
      });
      console.log('[CallInvitationButton] Call acceptance notification sent successfully');
    } catch (error) {
      console.error('[CallInvitationButton] Error notifying call acceptance:', error);
    }
  }}
  // Additional callbacks...
/>
```

### 3. Video Call Screen (`src/screens/VideoCallScreen.js`)

The `VideoCallScreen` includes callbacks in the ZEGOCLOUD configuration:

```javascript
<ZegoUIKitPrebuiltCall
  appID={ZEGO_APP_ID}
  appSign={ZEGO_APP_SIGN}
  userID={userId}
  userName={userName}
  callID={callId}
  config={{
    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
    onCallEnd: async (callID, reason, duration) => {
      console.log('[VideoCallScreen] Call ended with reason:', reason, 'duration:', duration);
      notifyCallEnd(total_seconds);
      navigation.goBack();
    },
    timingConfig: {
      isDurationVisible: true,
      onDurationUpdate: (durationInSec) => {
        // Auto-end call logic...
      },
    },
    // Add call invitation configuration with acceptance callbacks
    callInvitationConfig: {
      onIncomingCallAccepted: async (callID, caller, type) => {
        // Notification logic...
      },
      // Additional callbacks...
    },
  }}
/>
```

## Callback Functions

### 1. `onIncomingCallAccepted`
- **Triggered**: When a call invitation is accepted (on the caller's side)
- **Parameters**: 
  - `callID`: Unique call identifier
  - `caller`: Object containing caller information (userID, userName)
  - `type`: Call type (1 for video, 0 for audio)
- **Action**: Notifies server that call was accepted

### 2. `onOutgoingCallAccepted`
- **Triggered**: When a call invitation is accepted (on the called side)
- **Parameters**: 
  - `callID`: Unique call identifier
  - `callee`: Object containing callee information (userID, userName)
  - `type`: Call type (1 for video, 0 for audio)
- **Action**: Notifies server that call was accepted

### 3. `onIncomingCallDeclined`
- **Triggered**: When a call invitation is declined (on the caller's side)
- **Parameters**: Same as above
- **Action**: Notifies server that call was declined

### 4. `onOutgoingCallDeclined`
- **Triggered**: When a call invitation is declined (on the called side)
- **Parameters**: Same as above
- **Action**: Notifies server that call was declined

### 5. `onIncomingCallTimeout`
- **Triggered**: When a call invitation times out (on the caller's side)
- **Parameters**: Same as above
- **Action**: Notifies server that call timed out

### 6. `onOutgoingCallTimeout`
- **Triggered**: When a call invitation times out (on the called side)
- **Parameters**: Same as above
- **Action**: Notifies server that call timed out

## API Integration

The implementation uses the existing `callHistoryService` to notify the server:

```javascript
// For accepted calls
await callHistoryService.initiateCall({
  call_id: callID,
  call_type: type === 1 ? 'video' : 'audio',
  recipient_id: caller.userID,
  status: 'accepted'
});

// For declined/timeout calls
await callHistoryService.endCall({
  call_id: callID,
  status: 'declined' // or 'timeout'
});
```

## Flow Diagram

```
Caller Initiates Call
       ↓
Call Invitation Sent
       ↓
Recipient Receives Call
       ↓
Recipient Accepts/Declines
       ↓
Callback Triggered
       ↓
Server Notification Sent
       ↓
Call Proceeds/Ends
```

## Error Handling

All callbacks include proper error handling:

```javascript
try {
  await callHistoryService.initiateCall({
    call_id: callID,
    call_type: type === 1 ? 'video' : 'audio',
    recipient_id: caller.userID,
    status: 'accepted'
  });
  console.log('Call acceptance notification sent successfully');
} catch (error) {
  console.error('Error notifying call acceptance:', error);
  // Don't block the call if the API fails
}
```

## Testing

To test the implementation:

1. **Accept a call**: When a user accepts an incoming call, check the console logs for the acceptance callback
2. **Decline a call**: When a user declines an incoming call, check the console logs for the decline callback
3. **Timeout**: Let a call invitation timeout and check the console logs for the timeout callback
4. **Server logs**: Verify that the server receives the appropriate notifications

## Configuration Requirements

Ensure your ZEGOCLOUD configuration includes:

1. **Resource ID**: Create a resource ID named `zego_call` in your ZEGOCLOUD console
2. **Push Notifications**: Configure push notifications for offline call invitations
3. **Permissions**: Ensure all required permissions are granted for call functionality

## Troubleshooting

### Common Issues

1. **Callbacks not triggering**: Ensure ZEGOCLOUD is properly initialized
2. **API calls failing**: Check network connectivity and API endpoint configuration
3. **Missing notifications**: Verify server endpoint is accessible and responding

### Debug Logs

The implementation includes comprehensive logging:

```javascript
console.log('[ZegoService] Call accepted by recipient:', { callID, caller, type });
console.log('[ZegoService] Call acceptance notification sent successfully');
console.error('[ZegoService] Error notifying call acceptance:', error);
```

## Conclusion

This implementation ensures that your server is notified whenever calls are accepted, declined, or timed out, providing complete visibility into call status and enabling proper call tracking and analytics. 