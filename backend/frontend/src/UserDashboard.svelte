<script>
  let amount = 5000;
  let statusMessage = "";
  
  let transactionId = null;
  let isPendingOTP = false;
  let otpCode = "";
  let mockOTP = ""; 

  // Hardcoded mock IDs for hackathon speed
  const senderId = "60d5ecb74d6bb830b8e71113"; 
  const receiverId = "60d5ecb74d6bb830b8e72222"; 
  const API_URL = "http://localhost:5000/api";

  async function handleTransfer() {
    statusMessage = "Processing transaction...";
    const res = await fetch(`${API_URL}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId, receiverId, amount })
    });
    
    const data = await res.json();
    
    if (res.status === 200 && data.transactionId) {
      isPendingOTP = true;
      transactionId = data.transactionId;
      mockOTP = data.mockOTP;
      statusMessage = data.message;
    } else {
      // This handles the high-value flag and the velocity block
      statusMessage = data.message || data.error;
      amount = 0; // Instantly resets the input field
    }
  }

  async function handleOTP() {
    const res = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, otpCode })
    });
    
    const data = await res.json();
    statusMessage = data.message || data.error;
    
    if (res.status === 200) {
      isPendingOTP = false;
      amount = 0;
      otpCode = "";
    }
  }
</script>

<div>
  <h2>Secure User Portal</h2>
  <h4 style="color: #d9534f;">{statusMessage}</h4>

  {#if !isPendingOTP}
    <div style="margin-top: 1rem;">
      <label>Transfer Amount (₹): <input type="number" bind:value={amount} /></label>
      <button on:click={handleTransfer} style="margin-left: 10px;">Send Funds</button>
      <p><small><em>Try sending over ₹50,000 to trigger the manual review rule, or send 3 quick transactions to trigger the velocity block.</em></small></p>
    </div>
  {:else}
    <div style="background: rgba(15, 25, 30, 0.85); backdrop-filter: blur(6px); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(230, 171, 129, 0.4); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); margin-top: 1rem; color: #ffffff;">
      <p><strong>Security Verification Required</strong></p>
      <p>Check your device for the OTP. <em>(Hackathon Mock: {mockOTP})</em></p>
      <label>Enter 4-Digit Code: <input type="text" bind:value={otpCode} maxlength="4" /></label>
      <button on:click={handleOTP}>Verify & Complete</button>
    </div>
  {/if}
</div>