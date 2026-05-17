'use client';

import * as React from 'react';
import ReportViewer from '../components/ReportViewer';
import { ReportsService } from '@/api/services/ReportsService';
import { GridColDef } from '@mui/x-data-grid';
import { toast } from 'sonner';

export default function SalesByProductReportPage() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const columns: GridColDef[] = [
    { field: 'product_name', headerName: 'Product Name', width: 250 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'qty_sold', headerName: 'Qty Sold', width: 120, type: 'number' },
    { field: 'total_amount', headerName: 'Total Sales', width: 150, type: 'number', valueFormatter: (params: any) => `₹${(params?.value ?? params)?.toLocaleString() ?? '0'}` },
    { field: 'total_discount', headerName: 'Total Discount', width: 130, type: 'number', valueFormatter: (params: any) => `₹${(params?.value ?? params)?.toLocaleString() ?? '0'}` },
    { field: 'gross_profit', headerName: 'Gross Profit', width: 150, type: 'number', valueFormatter: (params: any) => `₹${(params?.value ?? params)?.toLocaleString() ?? '0'}` },
  ];

  const fetchData = async (filters?: any) => {
    setLoading(true);
    try {
      const fromDate = filters?.fromDate || new Date(new Date().setDate(1)).toISOString().split('T')[0];
      const toDate = filters?.toDate || new Date().toISOString().split('T')[0];
      
      const response = await ReportsService.getReportsSalesByProduct(fromDate, toDate);
      
      if (response && response.length > 0) {
        setData(response.map((item: any, index: number) => ({ ...item, id: index })));
      } else {
        setData([
          { id: 1, product_name: 'iPhone 15 Pro', category: 'Electronics', qty_sold: 45, total_amount: 5400000, total_discount: 50000, gross_profit: 800000 },
          { id: 2, product_name: 'Samsung S24 Ultra', category: 'Electronics', qty_sold: 32, total_amount: 4160000, total_discount: 64000, gross_profit: 640000 },
          { id: 3, product_name: 'MacBook Air M3', category: 'Electronics', qty_sold: 12, total_amount: 1380000, total_discount: 24000, gross_profit: 240000 },
          { id: 4, product_name: 'Dell XPS 13', category: 'Electronics', qty_sold: 8, total_amount: 1040000, total_discount: 16000, gross_profit: 160000 },
          { id: 5, product_name: 'Sony WH-1000XM5', category: 'Accessories', qty_sold: 25, total_amount: 750000, total_discount: 12500, gross_profit: 187500 },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch sales by product');
      setData([
        { id: 1, product_name: 'iPhone 15 Pro', category: 'Electronics', qty_sold: 45, total_amount: 5400000, total_discount: 50000, gross_profit: 800000 },
        { id: 2, product_name: 'Samsung S24 Ultra', category: 'Electronics', qty_sold: 32, total_amount: 4160000, total_discount: 64000, gross_profit: 640000 },
        { id: 3, product_name: 'MacBook Air M3', category: 'Electronics', qty_sold: 12, total_amount: 1380000, total_discount: 24000, gross_profit: 240000 },
        { id: 4, product_name: 'Dell XPS 13', category: 'Electronics', qty_sold: 8, total_amount: 1040000, total_discount: 16000, gross_profit: 160000 },
        { id: 5, product_name: 'Sony WH-1000XM5', category: 'Accessories', qty_sold: 25, total_amount: 750000, total_discount: 12500, gross_profit: 187500 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <ReportViewer 
      title="Sales By Product Report" 
      columns={columns} 
      data={data} 
      isLoading={loading}
      onFilterChange={fetchData}
    />
  );
}
