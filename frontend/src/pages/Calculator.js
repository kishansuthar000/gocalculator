import React, { useEffect, useState } from 'react';
import { categoryAPI } from '../api/apiClient';
import '../styles/Calculator.css';

function Calculator() {
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data);

      // Initialize quantities
      const initialQuantities = {};
      response.data.forEach((cat) => {
        initialQuantities[cat._id] = 1;
      });
      setQuantities(initialQuantities);
      setError('');
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (categoryId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [categoryId]: parseInt(value) || 0,
    }));
  };

  const calculateRowTotals = (category) => {
    const qty = quantities[category._id] || 0;
    return {
      bob: category.bob * qty,
      excise: category.excise * qty,
      basic: category.basic * qty,
      pmt: category.pmt * qty,
      rowTotal: (category.bob + category.excise + category.basic + category.pmt) * qty,
    };
  };

  const calculateSummary = () => {
    let totalBob = 0;
    let totalExcise = 0;
    let totalBasic = 0;
    let totalPmt = 0;

    categories.forEach((cat) => {
      const qty = quantities[cat._id] || 0;
      totalBob += cat.bob * qty;
      totalExcise += cat.excise * qty;
      totalBasic += cat.basic * qty;
      totalPmt += cat.pmt * qty;
    });

    const basicPlusPermitPlusExcise = totalBasic + totalPmt + totalExcise;
    const grandTotal = totalBob + totalExcise + totalBasic + totalPmt;

    return {
      basicAmount: totalBasic,
      basicPlusPermitPlusExcise,
      permitFees: totalPmt,
      gsmAmount: totalBob,
      exciseDuty: totalExcise,
      total: grandTotal,
      totalBob,
      totalExcise,
      totalBasic,
      totalPmt,
    };
  };

  const summary = calculateSummary();
  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  if (loading) {
    return <div className="calculator-loading">Loading calculator...</div>;
  }

  return (
    <div className="calculator-container">
      {error && <div className="calculator-error">{error}</div>}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <label>Basic</label>
          <div className="card-value">{summary.basicAmount.toLocaleString()}</div>
        </div>

        <div className="card">
          <label>Basic + Permit + Excise</label>
          <div className="card-value">{summary.basicPlusPermitPlusExcise.toLocaleString()}</div>
        </div>

        <div className="card">
          <label>Permit Fees</label>
          <div className="card-value">{summary.permitFees.toLocaleString()}</div>
        </div>

        <div className="card card-orange">
          <label>GSM Amount</label>
          <div className="card-value">{summary.gsmAmount.toLocaleString()}</div>
        </div>

        <div className="card">
          <label>Excise Duty</label>
          <div className="card-value">{summary.exciseDuty.toLocaleString()}</div>
        </div>

        <div className="card card-pink">
          <label>Total</label>
          <div className="card-value">{summary.total.toLocaleString()}</div>
        </div>
      </div>

      {/* Calculator Table */}
      <div className="calculator-table-wrapper">
        <table className="calculator-table">
          <thead>
            <tr>
              <th>BRAND</th>
              <th>QTY</th>
              <th>BOB</th>
              <th>EXCISE</th>
              <th>BASIC</th>
              <th>PMT</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const totals = calculateRowTotals(category);
              return (
                <tr key={category._id}>
                  <td className="brand-cell">{category.name}</td>
                  <td className="qty-cell">
                    <input
                      type="number"
                      min="0"
                      value={quantities[category._id] || 0}
                      onChange={(e) => handleQuantityChange(category._id, e.target.value)}
                      className="qty-input"
                    />
                  </td>
                  <td className="amount-cell">{totals.bob.toLocaleString()}</td>
                  <td className="amount-cell">{totals.excise.toLocaleString()}</td>
                  <td className="amount-cell">{totals.basic.toLocaleString()}</td>
                  <td className="amount-cell">{totals.pmt.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="total-label">Total</td>
              <td className="total-value">{totalQuantity}</td>
              <td className="total-value">{summary.totalBob.toLocaleString()}</td>
              <td className="total-value">{summary.totalExcise.toLocaleString()}</td>
              <td className="total-value">{summary.totalBasic.toLocaleString()}</td>
              <td className="total-value">{summary.totalPmt.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Reset Button */}
      <div className="calculator-actions">
        <button
          onClick={() => {
            const initialQuantities = {};
            categories.forEach((cat) => {
              initialQuantities[cat._id] = 1;
            });
            setQuantities(initialQuantities);
          }}
          className="reset-btn"
        >
          Reset Calculator
        </button>
      </div>
    </div>
  );
}

export default Calculator;
