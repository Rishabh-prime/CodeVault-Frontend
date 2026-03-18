import { useSelector } from "react-redux";
import Hero from "../Components/HomePage/Hero";       // adjust path if needed
import FetchFolder from "../Components/HomePage/FetchFolder";  // adjust path if needed

function HomePage() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {isAuthenticated ? <FetchFolder /> : <Hero />}
    </>
  );
}

export default HomePage;