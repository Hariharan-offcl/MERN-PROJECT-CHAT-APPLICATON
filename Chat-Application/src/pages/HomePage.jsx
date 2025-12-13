import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="main-content d-flex flex-column align-items-center justify-content-center">
      <h1 className="mb-2 text-center"> Chat Application</h1>
      <p className="text-muted mb-4 text-center">
        Connect with friends and family in real-time using our chat application.
      </p>
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        <Link to="/chat" className="btn btn-success">
          Go to Chats
        </Link>
        <Link to="/profile" className="btn btn-outline-success">
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
