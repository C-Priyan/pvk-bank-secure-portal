<script>
  import { onMount } from 'svelte';

  let flaggedTxs = [];
  let statusMessage = "";
  const API_URL = "http://localhost:5000/api";

  async function fetchFlagged() {
    const res = await fetch(`${API_URL}/admin/flagged`);
    flaggedTxs = await res.json();
  }

  onMount(fetchFlagged);

  async function resolveTx(transactionId, action) {
    const res = await fetch(`${API_URL}/admin/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        adminId: "60d5ecb74d6bb830b8e79999", 
        action,
        justification: `Manually ${action.toLowerCase()} by Admin Team`
      })
    });
    
    const data = await res.json();
    statusMessage = data.message || data.error;
    
    if (res.status === 200) {
      fetchFlagged(); 
    }
  }
</script>

<div>
  <h2>Fraud Compliance Dashboard</h2>
  <h4 style="color: #5cb85c;">{statusMessage}</h4>

  {#if flaggedTxs.length === 0}
    <p>Queue is empty. No flagged transactions pending review.</p>
  {:else}
    <table border="1" cellpadding="12" style="border-collapse: collapse; width: 100%; text-align: left; border-color: rgba(230, 171, 129, 0.4);">
        <thead style="background: rgba(15, 25, 30, 0.85); backdrop-filter: blur(6px); color: #ffffff;">
        <tr>
          <th>ID</th>
          <th>Amount</th>
          <th>Flag Reason</th>
          <th>Decision</th>
        </tr>
      </thead>
      <tbody>
        {#each flaggedTxs as tx}
          <tr>
            <td><small>{tx._id}</small></td>
            <td><strong>₹{tx.amount}</strong></td>
            <td style="color: #d9534f;">{tx.fraudReason}</td>
            <td>
              <button style="background: #5cb85c; color: white;" on:click={() => resolveTx(tx._id, 'Approved')}>Approve</button>
              <button style="background: #d9534f; color: white; margin-left: 5px;" on:click={() => resolveTx(tx._id, 'Rejected')}>Reject</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>