// ✅ Use shared Firebase instance — no duplicate initializeApp
import { rtdb as db } from "./firebase.js";
import { ref, get }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const user = JSON.parse(localStorage.getItem("user"));
if(!user){ window.location.href = "index.html"; }

const container = document.getElementById("orders-container");

/* ── STATUS CONFIG ── */
const STATUS_CONFIG = {
  pending:   { label:"Order Placed",  color:"#ff9800", bg:"#fff3e0", icon:"🕐" },
  packed:    { label:"Packed",        color:"#2a7de1", bg:"#e3f0ff", icon:"📦" },
  shipped:   { label:"Shipped",       color:"#7b1fa2", bg:"#f3e5f5", icon:"🚚" },
  delivered: { label:"Delivered",     color:"#16a34a", bg:"#e8f5e9", icon:"✅" },
  paid:      { label:"Paid",          color:"#16a34a", bg:"#e8f5e9", icon:"💳" },
  cancelled: { label:"Cancelled",     color:"#dc2626", bg:"#fef2f2", icon:"❌" },
};

function statusBadge(status){
  const s = STATUS_CONFIG[status] || { label: status, color:"#888", bg:"#f5f5f5", icon:"📋" };
  return `<span class="order-status-badge" style="color:${s.color};background:${s.bg};">${s.icon} ${s.label}</span>`;
}

function paymentIcon(method){
  const map = { cod:"💵 Cash on Delivery", upi:"📱 UPI", card:"💳 Card", netbanking:"🏦 Net Banking", razorpay:"💳 Online Payment" };
  return map[method] || method || "—";
}

async function loadOrders(){
  container.innerHTML = `<div class="orders-loading"><div class="orders-spinner"></div><p>Loading your orders...</p></div>`;

  const snapshot = await get(ref(db, "orders"));

  if(!snapshot.exists()){
    showEmpty();
    return;
  }

  const data = snapshot.val();

  // Filter orders for this user
  const myOrders = Object.entries(data)
    .filter(([id, order]) => order.phone === user.phone || order.phone === "0"+user.phone || "0"+order.phone === user.phone)
    .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt)); // newest first

  if(myOrders.length === 0){
    showEmpty();
    return;
  }

  container.innerHTML = "";

  myOrders.forEach(([id, order]) => {
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN",{
      day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"
    }) : "—";

    const itemsHTML = (order.items || []).map(item => `
      <div class="oi-row">
        <div class="oi-img-wrap">
          ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<div class="oi-img-placeholder">📦</div>`}
        </div>
        <div class="oi-info">
          <p class="oi-name">${item.name || "Product"}</p>
          <p class="oi-qty">Qty: ${item.qty || 1}</p>
        </div>
        <div class="oi-price">₹${(item.price||0) * (item.qty||1)}</div>
      </div>
    `).join("");

    const addr = order.address || {};
    const addrText = [addr.line1, addr.line2, addr.line3, addr.city, addr.pincode]
      .filter(Boolean).join(", ");

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card-header">
        <div class="order-meta">
          <span class="order-id">#${id.slice(-8).toUpperCase()}</span>
          <span class="order-date">${date}</span>
        </div>
        ${statusBadge(order.status)}
      </div>

      <div class="order-card-body">
        <div class="order-items-list">
          ${itemsHTML}
        </div>

        <div class="order-summary-col">
          <div class="order-summary-block">
            <h4>Delivery Address</h4>
            <p>${order.name || ""}</p>
            <p>${addrText || "—"}</p>
            <p>📞 ${order.phone || "—"}</p>
          </div>
          <div class="order-summary-block">
            <h4>Payment</h4>
            <p>${paymentIcon(order.payment)}</p>
            ${order.paymentId ? `<p class="txn-id">Txn: ${order.paymentId}</p>` : ""}
          </div>
          <div class="order-total-row">
            <span>Order Total</span>
            <span class="order-total-amount">₹${order.total || 0}</span>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function showEmpty(){
  container.innerHTML = `
    <div class="orders-empty">
      <div class="orders-empty-icon">🛍️</div>
      <h3>No orders yet</h3>
      <p>When you place an order it will appear here</p>
      <a href="products.html" class="orders-shop-btn">Shop Now</a>
    </div>
  `;
}

loadOrders();
