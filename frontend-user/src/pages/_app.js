// src/pages/_app.js
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; 
import { NotificationProvider } from "@/contexts/NotificationContext";
import { UIProvider } from "@/contexts/UIContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";
import { WishlistProvider } from "@/contexts/WishlistContext";
import ChatWidget from "@/components/chat/ChatWidget";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UIProvider>
          <CartProvider>
            <Toaster position="top-right" reverseOrder={false} /> 
              <WishlistProvider>
                <Component {...pageProps} />
                <ChatWidget />
              </WishlistProvider>
          </CartProvider>
        </UIProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}