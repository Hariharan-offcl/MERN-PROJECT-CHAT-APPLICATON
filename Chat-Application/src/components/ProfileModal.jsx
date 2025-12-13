import { useState } from "react";

function ProfileModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    status: user.status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050 }}
    >
      <div
        className="bg-white rounded-3 shadow p-4"
        style={{ width: "90%", maxWidth: "400px" }}
      >
        <h5 className="mb-3 text-center text-success">Edit Profile</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-muted">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted">Status</label>
            <input
              type="text"
              className="form-control"
              name="status"
              value={formData.status}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success btn-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
