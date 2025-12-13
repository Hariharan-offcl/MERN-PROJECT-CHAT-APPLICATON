import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 56px)" }}>
      <h1 className="display-4 mb-2">404</h1>
      <p className="text-muted mb-3">Page not found</p>
      <Link to="/" className="btn btn-success">Back to Home</Link>
    </div>
  );
}

export default NotFound;
