import apiClient from './api/client';

class CallHistoryService {
  /**
   * Notify server about call initiation
   * @param {Object} callData - Call data object
   * @param {string} callData.call_id - Unique call identifier
   * @param {string} callData.call_type - Type of call (video/audio)
   * @param {string} callData.recipient_id - ID of the recipient
   * @param {string} callData.status - Call status (initiated)
   * @returns {Promise} API response
   */
  async initiateCall(callData) {
    try {
      console.log('[CallHistoryService] Initiating call with data:', callData);
      
      const response = await apiClient.post('/api/v1/user/calls/call/', {
        call_id: callData.call_id,
        call_type: callData.call_type,
        recipient_id: callData.recipient_id,
        status: callData.status
      });

      console.log('[CallHistoryService] Call initiation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CallHistoryService] Error initiating call:', error);
      throw error;
    }
  }

  /**
   * Notify server about call end
   * @param {Object} callData - Call data object
   * @param {string} callData.call_id - Unique call identifier
   * @param {string} callData.call_type - Type of call (video/audio)
   * @param {string} callData.recipient_id - ID of the recipient
   * @param {string} callData.status - Call status (ended)
   * @param {number} callData.duration - Call duration in seconds (optional)
   * @returns {Promise} API response
   */
  async endCall(callData) {
    try {
        const data={
            call_id:callData.call_id,
            total_seconds:callData.total_seconds
        }
      console.log('[CallHistoryService] Ending call with data:', callData);
      
      const response = await apiClient.post(`/api/v1/user/calls/${call_id}/end/`,{total_seconds});

      console.log('[CallHistoryService] Call end notification successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CallHistoryService] Error ending call:', error);
      throw error;
    }
  }
}

export default new CallHistoryService(); 