import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      <section>
        <h1>Pantry to Plate</h1>
        <p>Turn what's already in your pantry into delicious meals. Discover recipes based on ingredients you have on hand.</p>
        <Link to="/app">Get Started</Link>
      </section>
    </div>
  );
}
