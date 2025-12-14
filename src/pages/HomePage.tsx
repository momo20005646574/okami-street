import { useStore } from '@/context/StoreContext';
import Shop from './Shop';
import DropPage from './DropPage';

const HomePage = () => {
  const { activeDrop, completeDrop } = useStore();

  // Check if there's an active drop with a future release date
  if (activeDrop && activeDrop.isActive) {
    const now = new Date();
    const releaseDate = new Date(activeDrop.releaseDate);

    // If countdown hasn't ended yet, show drop page
    if (now < releaseDate) {
      return <DropPage drop={activeDrop} onDropComplete={completeDrop} />;
    }
  }

  // Otherwise show normal shop
  return <Shop />;
};

export default HomePage;
