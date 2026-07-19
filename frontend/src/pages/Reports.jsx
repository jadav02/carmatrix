// ==========================================
// Financial Reports Dashboard Page (Administrator Only)
// ==========================================
import React, { useState, useEffect } from 'react';
import { getReports } from '../api/sales';
import { formatINR } from '../utils/formatters';
import { 
  BarChart3, 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp, 
  Boxes, 
  AlertTriangle, 
  RefreshCw,
  Clock
} from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch financial reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Dealership Financial Reports</h1>
          <p className="page-subtitle">Executive summary of total sales, purchase costs, revenue, profit, and stock alerts</p>
        </div>
        <button className="btn btn-secondary icon-only-btn" onClick={fetchReports} title="Refresh Reports">
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="table-loading" style={{ padding: '3rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
          <p>Calculating financial metrics...</p>
        </div>
      ) : reports && (
        <>
          {/* Executive Metrics Grid */}
          <div className="reports-grid">
            <div className="summary-card glass-panel">
              <div className="summary-info">
                <span className="summary-label">Total Sales Transactions</span>
                <span className="summary-num">{reports.total_sales}</span>
              </div>
              <div className="summary-icon indigo">
                <ShoppingCart size={24} />
              </div>
            </div>

            <div className="summary-card glass-panel">
              <div className="summary-info">
                <span className="summary-label">Total Revenue</span>
                <span className="summary-num">{formatINR(reports.total_revenue)}</span>
              </div>
              <div className="summary-icon cyan">
                <IndianRupee size={24} />
              </div>
            </div>

            <div className="summary-card glass-panel">
              <div className="summary-info">
                <span className="summary-label">Total Purchase Cost</span>
                <span className="summary-num">{formatINR(reports.total_purchase_cost)}</span>
              </div>
              <div className="summary-icon violet">
                <IndianRupee size={24} />
              </div>
            </div>

            <div className="summary-card glass-panel">
              <div className="summary-info">
                <span className="summary-label">Total Net Profit</span>
                <span className="summary-num" style={{ color: 'var(--accent-emerald)' }}>
                  {formatINR(reports.total_profit)}
                </span>
              </div>
              <div className="summary-icon emerald">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="summary-card glass-panel">
              <div className="summary-info">
                <span className="summary-label">Available Stock</span>
                <span className="summary-num">{reports.available_stock} Units</span>
              </div>
              <div className="summary-icon indigo">
                <Boxes size={24} />
              </div>
            </div>

            <div className="summary-card glass-panel">
              <div className="summary-info">
                <span className="summary-label">Low Stock Warnings</span>
                <span className="summary-num" style={{ color: reports.low_stock_vehicles > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {reports.low_stock_vehicles}
                </span>
              </div>
              <div className="summary-icon violet">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className="table-card glass-panel">
            <div className="table-card-header">
              <Clock size={20} className="text-indigo-400" />
              <h2>Recent Customer Sales Activity</h2>
            </div>

            {reports.recent_sales.length === 0 ? (
              <div className="table-empty">
                <BarChart3 size={48} className="empty-icon" />
                <h3>No Recent Sales</h3>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Vehicle</th>
                      <th>Customer Name</th>
                      <th>Units Sold</th>
                      <th>Revenue (₹)</th>
                      <th>Cost (₹)</th>
                      <th>Profit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.recent_sales.map(s => (
                      <tr key={s.id}>
                        <td className="col-id">#{s.id}</td>
                        <td style={{ fontWeight: 600 }}>{s.vehicle_make} {s.vehicle_model}</td>
                        <td>{s.customer_name}</td>
                        <td>{s.quantity} Units</td>
                        <td className="col-price">{formatINR(s.total_price)}</td>
                        <td>{formatINR(s.total_cost)}</td>
                        <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          {formatINR(s.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
