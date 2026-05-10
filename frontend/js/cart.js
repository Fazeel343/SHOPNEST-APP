async function loadCart() {
  if (!getToken()) return location.href = '/login.html';
  try {
    const items = await api.get('/cart');
    return items;
  } catch(e) {
    console.error(e);
    return [];
  }
}

function renderCartItem(i) {
  return `
    <div class="card" style="display:flex;align-items:center;
         gap:16px;padding:16px;margin-bottom:12px">
      <div style="flex:1">
        <div style="font-weight:700">${i.NAME}</div>
        <div style="color:#64748b;font-size:13px">
          Qty: ${i.QUANTITY} × Rs. ${Number(i.PRICE).toLocaleString()}
        </div>
      </div>
      <div style="font-weight:800;color:#f97316">
        Rs. ${Number(i.SUBTOTAL).toLocaleString()}
      </div>
      <button class="btn btn-danger" style="padding:6px 12px"
              onclick="removeFromCart(${i.CART_ITEM_ID})">✕</button>
    </div>`;
}

async function removeFromCart(id) {
  try {
    await api.delete('/cart/' + id);
    location.reload();
  } catch(e) {
    alert(e.message);
  }
}

function calcTotal(items) {
  return items.reduce((sum, i) => sum + Number(i.SUBTOTAL), 0);
}