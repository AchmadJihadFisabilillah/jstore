"use client";

import { useMemo, useState } from "react";
import { Role, OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  packages: AdminPackage[];
};

type AdminPackage = {
  id: string;
  productId: string;
  name: string;
  duration: number;
  price: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
};

export type AdminOrder = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  user: { id: string; name: string; email: string };
  package: { id: string; name: string; price: number; product: { name: string } };
};

export function AdminOpsPanel({
  initialProducts,
  initialUsers,
  initialOrders,
}: {
  initialProducts: AdminProduct[];
  initialUsers: AdminUser[];
  initialOrders: AdminOrder[];
}) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const [productForm, setProductForm] = useState({ name: "", description: "", category: "" });
  const [packageForm, setPackageForm] = useState({ productId: "", name: "", duration: 30, price: 10000 });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [pRes, uRes, oRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/users"),
        fetch("/api/admin/orders"),
      ]);
      if (!pRes.ok || !uRes.ok || !oRes.ok) throw new Error("Gagal memuat data admin.");
      const [pData, uData, oData] = await Promise.all([pRes.json(), uRes.json(), oRes.json()]);
      setProducts(pData as AdminProduct[]);
      setUsers(uData as AdminUser[]);
      setOrders(oData as AdminOrder[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!keyword) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword.toLowerCase()) ||
        user.email.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [users, keyword]);

  const filteredOrders = useMemo(() => {
    if (!keyword) return orders;
    return orders.filter(
      (order) =>
        order.user.name.toLowerCase().includes(keyword.toLowerCase()) ||
        order.user.email.toLowerCase().includes(keyword.toLowerCase()) ||
        order.package.product.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [orders, keyword]);

  const createProduct = async () => {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });
    if (!response.ok) return alert("Gagal menambahkan produk.");
    setProductForm({ name: "", description: "", category: "" });
    await loadData();
  };

  const updateProduct = async (product: AdminProduct) => {
    const name = prompt("Nama produk", product.name);
    if (!name) return;
    const description = prompt("Deskripsi", product.description);
    if (!description) return;
    const category = prompt("Kategori", product.category);
    if (!category) return;
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, category }),
    });
    if (!response.ok) return alert("Gagal update produk.");
    await loadData();
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Hapus produk ini beserta semua paket?")) return;
    const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    if (!response.ok) return alert("Gagal hapus produk.");
    await loadData();
  };

  const createPackage = async () => {
    const response = await fetch("/api/admin/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageForm),
    });
    if (!response.ok) return alert("Gagal menambahkan paket.");
    setPackageForm({ productId: "", name: "", duration: 30, price: 10000 });
    await loadData();
  };

  const updatePackage = async (pkg: AdminPackage) => {
    const name = prompt("Nama paket", pkg.name);
    if (!name) return;
    const duration = Number(prompt("Durasi (hari)", String(pkg.duration)));
    const price = Number(prompt("Harga", String(pkg.price)));
    if (!duration || !price) return;
    const response = await fetch(`/api/admin/packages/${pkg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, duration, price }),
    });
    if (!response.ok) return alert("Gagal update paket.");
    await loadData();
  };

  const deletePackage = async (packageId: string) => {
    if (!confirm("Hapus paket ini?")) return;
    const response = await fetch(`/api/admin/packages/${packageId}`, { method: "DELETE" });
    if (!response.ok) return alert("Gagal hapus paket.");
    await loadData();
  };

  const updateUserRole = async (userId: string, role: string) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) return alert("Gagal update role user.");
    await loadData();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return alert("Gagal update status order.");
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="card-jstore p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">Operasional harian</p>
          <Button onClick={() => void loadData()} isLoading={loading}>
            Refresh Data
          </Button>
        </div>
        <Input
          placeholder="Cari user, email, atau produk order..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <section className="card-jstore p-5">
        <h2 className="text-lg font-bold">CRUD Produk</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Nama produk"
            value={productForm.name}
            onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            placeholder="Kategori"
            value={productForm.category}
            onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <Input
            placeholder="Deskripsi"
            value={productForm.description}
            onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Button onClick={() => void createProduct()}>Tambah Produk</Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100/70 dark:bg-muted">
              <tr>
                <th className="p-2 text-left">Produk</th>
                <th className="p-2 text-left">Kategori</th>
                <th className="p-2 text-left">Paket</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[var(--line)]">
                  <td className="p-2">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-[var(--muted)]">{product.description}</p>
                  </td>
                  <td className="p-2">{product.category}</td>
                  <td className="p-2">{product.packages.length}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button className="bg-zinc-700 hover:bg-zinc-600" onClick={() => void updateProduct(product)}>
                        Edit
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-500" onClick={() => void deleteProduct(product.id)}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-jstore p-5">
        <h2 className="text-lg font-bold">CRUD Paket</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <select
            className="rounded-[12px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
            value={packageForm.productId}
            onChange={(event) => setPackageForm((prev) => ({ ...prev, productId: event.target.value }))}
          >
            <option value="">Pilih produk</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Nama paket"
            value={packageForm.name}
            onChange={(event) => setPackageForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            type="number"
            placeholder="Durasi"
            value={packageForm.duration}
            onChange={(event) =>
              setPackageForm((prev) => ({ ...prev, duration: Number(event.target.value || 0) }))
            }
          />
          <Input
            type="number"
            placeholder="Harga"
            value={packageForm.price}
            onChange={(event) => setPackageForm((prev) => ({ ...prev, price: Number(event.target.value || 0) }))}
          />
          <Button onClick={() => void createPackage()}>Tambah Paket</Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100/70 dark:bg-muted">
              <tr>
                <th className="p-2 text-left">Produk</th>
                <th className="p-2 text-left">Nama Paket</th>
                <th className="p-2 text-left">Durasi</th>
                <th className="p-2 text-left">Harga</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.flatMap((product) =>
                product.packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-[var(--line)]">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{pkg.name}</td>
                    <td className="p-2">{pkg.duration} hari</td>
                    <td className="p-2">{formatRupiah(pkg.price)}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button className="bg-zinc-700 hover:bg-zinc-600" onClick={() => void updatePackage(pkg)}>
                          Edit
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-500" onClick={() => void deletePackage(pkg.id)}>
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-jstore p-5">
        <h2 className="text-lg font-bold">Tabel Users Interaktif</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100/70 dark:bg-muted">
              <tr>
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Order</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[var(--line)]">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user._count.orders}</td>
                  <td className="p-2">
                    <select
                      className="rounded-[10px] border border-[var(--line)] bg-[var(--card)] px-2 py-1"
                      value={user.role}
                      onChange={(event) => void updateUserRole(user.id, event.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-jstore p-5">
        <h2 className="text-lg font-bold">Tabel Orders Interaktif</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100/70 dark:bg-muted">
              <tr>
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Produk</th>
                <th className="p-2 text-left">Paket</th>
                <th className="p-2 text-left">Harga</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-100">
                  <td className="p-2">{new Date(order.createdAt).toLocaleString("id-ID")}</td>
                  <td className="p-2">
                    <p>{order.user.name}</p>
                    <p className="text-muted-foreground">{order.user.email}</p>
                  </td>
                  <td className="p-2">{order.package.product.name}</td>
                  <td className="p-2">{order.package.name}</td>
                  <td className="p-2">{formatRupiah(order.package.price)}</td>
                  <td className="p-2">
                    <select
                      className="rounded-lg border border-zinc-200 px-2 py-1"
                      value={order.status}
                      onChange={(event) =>
                        void updateOrderStatus(order.id, event.target.value as OrderStatus)
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
