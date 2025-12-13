import { useState } from "react";
import ProfileModal from "../components/ProfileModal.jsx";

function ProfilePage() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({
    name: "Hari Haran",
    email: "hari@example.com",
    status: "Available",
  });

  return (
    <div className="main-content d-flex flex-column align-items-center justify-content-center">
      <div
        className="card shadow-sm text-center"
        style={{ maxWidth: "360px", width: "100%" }}
      >
        <div className="card-body">
          <div
            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: "60px", height: "60px", fontSize: "24px" }}
          >
            {user.name.charAt(0)}
          </div>

          <h5>{user.name}</h5>
          <p className="text-muted mb-1">{user.email}</p>
          <p>
            <strong>Status:</strong> {user.status}
          </p>

          <button
            className="btn btn-success"
            onClick={() => setShowModal(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {showModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowModal(false)}
          onSave={setUser}
        />
      )}
    </div>
  );
}

export default ProfilePage;
