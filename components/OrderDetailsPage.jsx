import React from 'react';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

export default function OrderDetailsPage({ order, onBack }) {
  if (!order) return null;

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const total = itemsSubtotal + order.shippingFee + order.tax;

  return (
    <div className="h-screen flex flex-col">
      <header className="fixed top-0 inset-x-0 z-10 bg-white shadow flex items-center justify-between p-4">
        <button
          aria-label="Back to Orders"
          onClick={onBack}
          className="text-blue-600 hover:underline"
        >
          Back to Orders
        </button>
        <h1 className="text-lg font-bold">Order Details</h1>
        <div className="w-24" />
      </header>

      <main className="flex-1 overflow-y-auto pt-16 p-4">
        <section className="mb-6">
          <h2 className="text-base font-semibold mb-3">Order Information</h2>
          <dl>
            <div className="flex flex-wrap mb-2">
              <dt className="w-40 font-medium">Order Number:</dt>
              <dd className="flex-1">{order.orderNumber}</dd>
            </div>
            <div className="flex flex-wrap mb-2">
              <dt className="w-40 font-medium">Order Date:</dt>
              <dd className="flex-1">{formatDate(order.orderDate)}</dd>
            </div>
            <div className="flex flex-wrap mb-2">
              <dt className="w-40 font-medium">Customer Name:</dt>
              <dd className="flex-1">{order.customerName}</dd>
            </div>
            <div className="flex flex-wrap mb-2">
              <dt className="w-40 font-medium">Shipping Address:</dt>
              <dd className="flex-1">{order.shippingAddress}</dd>
            </div>
          </dl>
        </section>

        <section className="mb-6">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Product</th>
                <th className="border px-3 py-2 text-right">Quantity</th>
                <th className="border px-3 py-2 text-right">Price</th>
                <th className="border px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const sub = item.quantity * item.price;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{item.name}</td>
                    <td className="border px-3 py-2 text-right">{item.quantity}</td>
                    <td className="border px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="border px-3 py-2 text-right">{formatCurrency(sub)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="border px-3 py-2 text-right font-medium">
                  Subtotal
                </td>
                <td className="border px-3 py-2 text-right">
                  {formatCurrency(itemsSubtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="border px-3 py-2 text-right font-medium">
                  Shipping Fee
                </td>
                <td className="border px-3 py-2 text-right">
                  {formatCurrency(order.shippingFee)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="border px-3 py-2 text-right font-medium">
                  Tax
                </td>
                <td className="border px-3 py-2 text-right">
                  {formatCurrency(order.tax)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan="3"
                  className="border px-3 py-2 text-right font-bold bg-gray-50"
                >
                  Total
                </td>
                <td className="border px-3 py-2 text-right font-bold bg-gray-50">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </main>
    </div>
  );
}
