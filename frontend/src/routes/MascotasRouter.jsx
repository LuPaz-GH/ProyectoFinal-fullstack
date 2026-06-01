import { Routes, Route } from 'react-router-dom';
import MascotasPage from '../pages/MascotasPage';

const MascotasRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MascotasPage />} />
    </Routes>
  );
};

export default MascotasRouter;