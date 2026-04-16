import React, { useEffect, useState } from 'react';
import { categoryAPI } from '../api/apiClient';
import CategoryForm from '../components/CategoryForm';
import CategoryTable from '../components/CategoryTable';
import '../styles/CategoryManagement.css';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async () => {
    await fetchCategories();
    handleFormClose();
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.deleteCategory(categoryId);
        setCategories(categories.filter((c) => c._id !== categoryId));
        setError('');
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      }
    }
  };

  return (
    <div className="category-management">
      <div className="management-header">
        <h3>Category Management</h3>
        <button onClick={handleAddCategory} className="add-btn">+ Add New Category</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default CategoryManagement;
