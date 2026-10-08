import React, { useEffect, useState } from 'react';
import { Boxes, Save } from 'lucide-react';
import { api } from '../services/api';

export default function InventoryManager() {
  const [variants, setVariants] = useState([]); const [drafts, setDrafts] = useState({}); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.get('/admin/inventory').then(r => { const items=r.data.data||[]; setVariants(items); setDrafts(Object.fromEntries(items.map(item=>[item.id,item.stock_quantity]))); }).catch(e=>setMessage(e.response?.data?.message||'Could not load inventory.')).finally(()=>setLoading(false)); };
  useEffect(load, []);
  async function save(item) { try { await api.patch(`/admin/inventory/${item.id}`,{stock_quantity:Number(drafts[item.id])}); setMessage(`${item.product?.name||item.name} inventory updated.`); load(); } catch(e) { setMessage(e.response?.data?.message||'Could not update stock.'); } }
  return <div className="admin-content"><div className="admin-heading"><div><p className="eyebrow">STOCK CONTROL</p><h1>Inventory</h1></div></div>{message&&<div className="admin-note">{message}</div>}{loading?<p>Loading live inventory…</p>:<div className="admin-table"><div className="inventory-row table-head"><span>Product / variant</span><span>SKU</span><span>Stock</span><span>Action</span></div>{variants.map(item=><div className="inventory-row" key={item.id}><span><b>{item.product?.name||'Product'}</b><small>{item.name}{item.weight?` · ${item.weight}`:''}</small></span><span>{item.sku||'—'}</span><input aria-label={`Stock for ${item.name}`} type="number" min="0" value={drafts[item.id]??0} onChange={e=>setDrafts({...drafts,[item.id]:e.target.value})}/><button className="edit" onClick={()=>save(item)}><Save size={16}/> Save</button></div>)}{!variants.length&&<div className="empty"><Boxes/><p>No product variants yet. Add variants to products to manage stock.</p></div>}</div>}</div>;
}
