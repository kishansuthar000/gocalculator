import React from 'react';
import '../styles/CategoryTable.css';

const CategoryTable = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="table-container">
      <table className="category-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>BOB</th>
            <th>EXCISE</th>
            <th>BASIC</th>
            <th>PMT</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category._id}>
              <td className="category-name">
                <strong>{category.name}</strong>
              </td>
              <td className="price-cell">{category.bob}</td>
              <td className="price-cell">{category.excise}</td>
              <td className="price-cell">{category.basic}</td>
              <td className="price-cell">{category.pmt}</td>
              <td className="description-cell">{category.description || '-'}</td>
              <td>
                <button
                  onClick={() => onEdit(category)}
                  className="action-btn edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(category._id)}
                  className="action-btn delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && (
        <p className="no-categories">No categories found. Create one to get started!</p>
      )}
    </div>
  );
};

export default CategoryTable;
