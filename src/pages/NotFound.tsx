import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
          page not found
        </p>
        <Link to="/" className="brutalist-btn inline-block">
          go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
