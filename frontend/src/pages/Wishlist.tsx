import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['wishlist'], queryFn: () => api.get('/wishlist').then(r => r.data) });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/wishlist/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Wishlist</h1>
      {!data?.length ? <p>Your wishlist is empty.</p> : data.map((item: any) => (
        <div key={item.id} className="flex items-center gap-4 border-b py-4">
          <Link to={`/products/${item.slug}`} className="font-semibold flex-1">{item.name}</Link>
          <p className="font-bold">KES {item.price.toLocaleString()}</p>
          <button onClick={() => remove.mutate(item.id)} className="text-red-500">Remove</button>
        </div>
      ))}
    </div>
  );
}