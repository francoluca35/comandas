import { useEffect, useState } from "react";

export default function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProductos(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { productos, loading };
}
