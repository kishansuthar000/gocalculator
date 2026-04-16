import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../api/apiClient';
import '../styles/CategoryForm.css';

const CategoryForm = ({ category, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    bob: 0,
    excise: 0,
    basic: 0,
    pmt: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        bob: category.bob,
        excise: category.excise,
        basic: category.basic,
        pmt: category.pmt,
        description: category.description || '',
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'description' ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (category) {
        await categoryAPI.updateCategory(category._id, formData);
      } else {
        if (!formData.name) {
          setError('Category name is required');
          setLoading(false);
          return;
        }
        await categoryAPI.createCategory(formData);
      }
      onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h2>{category ? 'Edit Category' : 'Create New Category'}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., RML QTR"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bob">BOB *</label>
              <input
                id="bob"
                type="number"
                name="bob"
                value={formData.bob}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="excise">EXCISE *</label>
              <input
                id="excise"
                type="number"
                name="excise"
                value={formData.excise}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="basic">BASIC *</label>
              <input
                id="basic"
                type="number"
                name="basic"
                value={formData.basic}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pmt">PMT *</label>
              <input
                id="pmt"
                type="number"
                name="pmt"
                value={formData.pmt}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
