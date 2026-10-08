import React, { useEffect, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { api } from '../services/api';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
export default function OrderManager() {
  const [orders, setOrders] = useState([]); const [message, setMessage] = useState('');
  const load = () => api.get('/admin/orders').then(r => setOrders(r.data.data || [])).catch(e => setMessage(e.response?.data?.message || 'Could not load orders.'));
  useEffect(load, []);
  async function setStatus(order, status) { try { await api.patch(`/admin/orders/${order.id}/status`, { status }); setMessage(`Order ${order.order_number} updated to ${status}.`); load(); } catch (e) { setMessage(e.response?.data?.message || 'Could not update order.'); } }
  return <div className="admin-content"><div className="admin-heading"><div><p className="eyebrow">FULFILMENT</p><h1>Orders</h1></div></div>{message && <div className="admin-note">{message}</div>}<div className="admin-table"><div className="order-row table-head"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span>Update</span></div>{orders.map(order => <div className="order-row" key={order.id}><span><b>{order.order_number}</b><small>{new Date(order.created_at).toLocaleDateString()}</small></span><span>{order.customer?.full_name}<small>{order.customer?.phone}</small></span><span>Rs. {Number(order.total).toLocaleString()}</span><span><i className={`status ${order.status}`}>{order.status}</i></span><select value={order.status} onChange={e => setStatus(order, e.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></div>)}{!orders.length && <div className="empty"><PackageCheck/><p>No customer orders yet.</p></div>}</div></div>;
}
