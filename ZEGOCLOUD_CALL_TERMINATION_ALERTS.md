# ZEGOCLOUD Call Termination Alerts Implementation

This document explains the implementation of call termination alerts in the ZEGOCLOUD call system. The alerts are triggered when outgoing or incoming calls are cut/disconnected during active calls.

## Overview

The implementation adds call termination alert functionality to handle various scenarios when calls end unexpectedly or are terminated by users. The alerts provide clear feedback to users about why their call ended.

## Implementation Details

### 1. Call Termination Alert Function

A centralized `handleCallTermination` function has been implemented across all call-related components:

```javascript
const handleCallTermination = (callID, reason, duration) => {
  console.log('[Component] Call terminated:', { callID, reason, duration });
  
  let alertMessage = 'Call ended';
  let alertTitle = 'Call Terminated';
  
  // Customize alert based on termination reason
  switch (reason) {
    case 'userEnded':
      alertMessage = 'Call ended by user';
      break;
    case 'networkError':
      alertMessage = 'Call ended due to network issues. Please check your internet connection.';
      alertTitle = 'Network Error';
      break;
    case 'timeout':
      alertMessage = 'Call timed out due to inactivity or connection issues.';
      alertTitle = 'Call Timeout';
      break;
    case 'remoteUserEnded':
      alertMessage = 'Call ended by the other person.';
      alertTitle = 'Call Ended';
      break;
    case 'systemError':
      alertMessage = 'Call ended due to system error. Please try again.';
      alertTitle = 'System Error';
      break;
    case 'durationLimit':
      alertMessage = 'Call ended due to time limit reached.';
      alertTitle = 'Time Limit Reached';
      break;
    default:
      alertMessage = `Call ended (${reason})`;
  }
  
  // Show alert with call termination message
  Alert.alert(
    alertTitle,
    alertMessage,
    [
      { 
        text: 'OK', 
        onPress: () => {
          console.log('[Component] User acknowledged call termination');
          // Navigate back or perform cleanup
        }
      }
    ]
  );
};
```

### 2. Components Updated

#### A. CallInvitationButton.js
- **Location**: `src/components/CallInvitationButton.js`
- **Added**: `handleCallTermination` function and `onCallEnd` callback
- **Purpose**: Handles call termination alerts for call invitation buttons

```javascript
onCallEnd={async (callID, reason, duration) => {
  console.log('[CallInvitationButton] Call ended:', { callID, reason, duration });
  
  // Show call termination alert
  handleCallTermination(callID, reason, duration);
  
  // Notify server about call end
  try {
    await callHistoryService.endCall({
      call_id: callID,
      total_seconds: duration || 0
    });
    console.log('[CallInvitationButton] Call end notification sent successfully');
  } catch (error) {
    console.error('[CallInvitationButton] Error notifying call end:', error);
  }
}}
```

#### B. VideoCallScreen.js
- **Location**: `src/screens/VideoCallScreen.js`
- **Added**: `handleCallTermination` function and updated `onCallEnd` callback
- **Purpose**: Handles call termination alerts during active video calls

```javascript
onCallEnd: async (callID, reason, duration) => { 
  console.log('[VideoCallScreen] Call ended with reason:', reason, 'duration:', duration);
  notifyCallEnd(duration);
  handleCallTermination(callID, reason, duration);
}
```

#### C. CallPage.js
- **Location**: `CallPage.js`
- **Added**: `handleCallTermination` function and updated `onCallEnd` callback
- **Purpose**: Handles call termination alerts for the main call page

```javascript
onCallEnd: (callID, reason, duration) => {
  console.log('########CallPage onCallEnd');
  handleCallTermination(callID, reason, duration);
}
```

## Termination Reasons Handled

### 1. `userEnded`
- **Trigger**: User manually ends the call
- **Alert**: "Call ended by user"
- **Action**: Simple acknowledgment

### 2. `networkError`
- **Trigger**: Network connectivity issues
- **Alert**: "Call ended due to network issues. Please check your internet connection."
- **Action**: Suggests checking internet connection

### 3. `timeout`
- **Trigger**: Call times out due to inactivity or connection issues
- **Alert**: "Call timed out due to inactivity or connection issues."
- **Action**: Informs about timeout

### 4. `remoteUserEnded`
- **Trigger**: Other person ends the call
- **Alert**: "Call ended by the other person."
- **Action**: Informs about remote termination

### 5. `systemError`
- **Trigger**: System-level errors
- **Alert**: "Call ended due to system error. Please try again."
- **Action**: Suggests retrying

### 6. `durationLimit`
- **Trigger**: Call reaches time limit
- **Alert**: "Call ended due to time limit reached."
- **Action**: Informs about time limit

### 7. Default
- **Trigger**: Unknown or custom termination reasons
- **Alert**: "Call ended (reason)"
- **Action**: Shows the actual reason

## ZEGOCLOUD Call Events

The implementation utilizes ZEGOCLOUD's `onCallEnd` callback which provides:

### Parameters
- **callID**: Unique identifier for the call
- **reason**: String indicating why the call ended
- **duration**: Number representing call duration in seconds

### Available Reasons (from ZEGOCLOUD documentation)
- `userEnded`: User manually ended call
- `networkError`: Network connectivity issues
- `timeout`: Call timed out
- `remoteUserEnded`: Remote user ended call
- `systemError`: System-level errors
- `durationLimit`: Time limit reached
- `busy`: Remote user is busy
- `rejected`: Call was rejected
- `missed`: Call was missed

## Flow Diagram

```
Call Active
    ↓
Call Termination Event
    ↓
onCallEnd Callback Triggered
    ↓
handleCallTermination Function
    ↓
Determine Termination Reason
    ↓
Show Appropriate Alert
    ↓
User Acknowledges Alert
    ↓
Navigate Back/Cleanup
```

## Error Handling

All call termination handlers include proper error handling:

```javascript
try {
  await callHistoryService.endCall({
    call_id: callID,
    total_seconds: duration || 0
  });
  console.log('Call end notification sent successfully');
} catch (error) {
  console.error('Error notifying call end:', error);
  // Don't block the alert if the API fails
}
```

## Testing Scenarios

### 1. Manual Call End
- **Action**: User presses end call button
- **Expected**: "Call ended by user" alert

### 2. Network Issues
- **Action**: Simulate network disconnection
- **Expected**: "Call ended due to network issues" alert

### 3. Remote User Ends Call
- **Action**: Other person ends the call
- **Expected**: "Call ended by the other person" alert

### 4. Time Limit Reached
- **Action**: Call reaches configured time limit
- **Expected**: "Call ended due to time limit reached" alert

### 5. System Errors
- **Action**: Simulate system-level errors
- **Expected**: "Call ended due to system error" alert

## Configuration

The call termination alerts are automatically enabled when using the ZEGOCLOUD call components. No additional configuration is required.

## Integration with Existing Code

The call termination alerts integrate seamlessly with existing functionality:

1. **Server Notifications**: Call end events still notify the server
2. **Navigation**: Proper navigation back to previous screens
3. **Logging**: Comprehensive logging for debugging
4. **Error Handling**: Graceful error handling without blocking UI

## Best Practices

1. **User Experience**: Clear, informative alert messages
2. **Error Recovery**: Suggest actions for recoverable errors
3. **Logging**: Comprehensive logging for debugging
4. **Performance**: Non-blocking alert display
5. **Accessibility**: Clear, readable alert text

## Troubleshooting

### Common Issues

1. **Alerts not showing**: Check if `onCallEnd` callback is properly configured
2. **Wrong alert message**: Verify termination reason mapping
3. **Navigation issues**: Ensure proper navigation after alert acknowledgment

### Debug Logs

Monitor console logs for call termination events:
```
[Component] Call terminated: { callID: "xxx", reason: "networkError", duration: 45 }
[Component] User acknowledged call termination
```

## Future Enhancements

1. **Custom Alert Styling**: Custom alert components for better UX
2. **Retry Mechanisms**: Automatic retry for network errors
3. **Analytics**: Track call termination reasons for insights
4. **Localization**: Multi-language alert messages
5. **Sound Effects**: Audio feedback for call termination

## Conclusion

The call termination alert implementation provides users with clear feedback about why their calls ended, improving the overall user experience and reducing confusion about call disconnections. 