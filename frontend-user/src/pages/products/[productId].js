// src/pages/products/[productId].js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import apiService from '@/services/apiService';

import ProductImageGallery from '@/components/product-detail/ProductImageGallery';
import ProductInfo from '@/components/product-detail/ProductInfo';
import ProductActions from '@/components/product-detail/ProductActions';

export default function ProductDetailPage() {
  const router = useRouter();
  const { productId } = router.query; 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    if (!productId) {
      setLoading(false);
      return;
    }

    const isObjectId = /^[a-f\d]{24}$/i.test(productId);
    if (!isObjectId) {
      const destination = productId === "sale"
        ? "/products?sortBy=topDiscounts"
        : "/products?sortBy=newest";
      router.replace(destination);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiService.get(`/products/${productId}`);
        const payload = response.data?.data;
        const fetchedProduct = payload?.data ?? payload;

        if (!fetchedProduct?._id) {
          setProduct(null);
          setError("Product not found or an error occurred.");
          return;
        }

        setProduct(fetchedProduct);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router.isReady]);

  if (loading) {
    return <Layout><p className="text-center py-20">Loading product details...</p></Layout>;
  }

  if (error) {
    return <Layout><p className="text-center py-20 text-red-500">{error}</p></Layout>;
  }

  if (!product) {
    return <Layout><p className="text-center py-20">Sorry, we couldn&apos;t find that product.</p></Layout>;
  }

  return (
    <Layout fullWidth={true}>
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* Column 1: Image Gallery */}
          <div>
            <ProductImageGallery 
              images={product.images}
              productId={product._id} 
            />
          </div>
          
          {/* Column 2: Info and Actions */}
          <div className="flex flex-col">
            <ProductInfo product={product} />
            <ProductActions product={product} />
          </div>

        </div>
        
        {/* We can add a "Related Products" section here later */}
      </div>
    </Layout>
  );
}