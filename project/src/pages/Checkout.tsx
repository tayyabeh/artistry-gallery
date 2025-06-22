import React from 'react';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const Checkout: React.FC = () => {
    const { items, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handlePurchase = () => {
    // Trigger downloads for each item
    items.forEach((item) => {
      const link = document.createElement('a');
      link.href = item.artwork.image;
      link.download = `${item.artwork.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    clearCart();
    alert('Thank you for your purchase! Your downloads should start automatically.');
    navigate('/marketplace');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <button onClick={() => navigate('/marketplace')} className="btn-primary">Back to Marketplace</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((item) => (
              <div key={item.artwork.id} className="py-4 flex items-center">
                <img src={item.artwork.image} alt={item.artwork.title} className="w-24 h-24 object-cover rounded-lg" />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{item.artwork.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">by {item.artwork.creator.username}</p>

                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold">{formatPrice((item.artwork.price || 0) * item.quantity)}</span>
                  <button className="text-red-500 mt-2" onClick={() => removeFromCart(item.artwork.id)}><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 flex justify-between items-center">
            <span className="text-xl font-semibold">Total: {formatPrice(cartTotal)}</span>
            <button onClick={handlePurchase} className="btn-primary px-6 py-3">Complete Purchase</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
