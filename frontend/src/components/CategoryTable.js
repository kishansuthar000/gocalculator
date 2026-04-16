import "../styles/CategoryTable.css";

function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <>
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
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="category-name">
                  <strong>{category.name}</strong>
                </td>
                <td className="price-cell">{category.bob}</td>
                <td className="price-cell">{category.excise}</td>
                <td className="price-cell">{category.basic}</td>
                <td className="price-cell">{category.pmt}</td>
                <td className="description-cell">
                  {category.description || "-"}
                </td>
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
          <p className="no-categories">
            No categories found. Create one to get started!
          </p>
        )}
      </div>
      <div
        className="card-container"
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((category) => (
          <div
            key={category._id}
            className="category-card"
            style={{
              border: "1px solid black",
              borderRadius: "8px",
              padding: "15px",
              width: "100%",
              maxWidth: "400px",
              cursor: "pointer",
            }}
          >
            <h4>{category.name}</h4>
            <p>
              <strong>BOB:</strong> {category.bob}
            </p>
            <p>
              <strong>EXCISE:</strong> {category.excise}
            </p>
            <p>
              <strong>BASIC:</strong> {category.basic}
            </p>
            <p>
              <strong>PMT:</strong> {category.pmt}
            </p>
            <p>
              <strong>Description:</strong> {category.description || "-"}
            </p>
            <div className="card-actions">
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
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="no-categories">
            No categories found. Create one to get started!
          </p>
        )}
      </div>
    </>
  );
}

export default CategoryTable;
