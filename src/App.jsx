import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AppRoutes } from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      <StoreProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  );
};

export default App;