import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Order } from '../types';
import Layout from '../components/layout/Layout';
import { Download } from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getUserOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDownload = async (orderId: string, title: string) => {
    try {
      const response = await orderAPI.downloadArtwork(orderId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.jpg`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download artwork');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        
        {orders.length === 0 ? (
          <p>You haven't made any purchases yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-medium">{order.artworkId}</h2>
                    <p className="text-sm text-gray-600">
                      Purchased on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2">${order.price.toFixed(2)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(order.id, order.artworkId)}
                    className="p-2 text-primary-600 hover:text-primary-800"
                    title="Download artwork"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
