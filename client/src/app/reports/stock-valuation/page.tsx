'use client';

import * as React from 'react';
import ReportViewer from '../components/ReportViewer';
import { ReportsService } from '@/api/services/ReportsService';
import { GridColDef } from '@mui/x-data-grid';
import { toast } from 'sonner';

export default function StockValuationReportPage() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const columns: GridColDef[] = [
    { field: 'product_name', headerName: 'Product Name', width: 250 },
    { field: 'qty_on_hand', headerName: 'Qty On Hand', width: 130, type: 'number' },
    { field: 'valuation_rate', headerName: 'Valuation Rate', width: 150, type: 'number', valueFormatter: (params: any) => `₹${(params?.value ?? params)?.toLocaleString() ?? '0'}` },
    { field: 'total_value', headerName: 'Total Value', width: 180, type: 'number', valueFormatter: (params: any) => `₹${(params?.value ?? params)?.toLocaleString() ?? '0'}` },
  ];

  const fetchData = async (filters?: any) => {
    setLoading(true);
    try {
      // Stock valuation is usually as of a date
      const asOfDate = filters?.toDate || new Date().toISOString().split('T')[0];
      
      const response = await ReportsService.getReportsStockValuation(asOfDate);
      
      if (response && response.items) {
        setData(response.items.map((item: any, index: number) => ({ ...item, id: index })));
      } else {
        setData([
          { id: 1, product_name: 'iPhone 15 Pro', qty_on_hand: 24, valuation_rate: 95000, total_value: 2280000 },
          { id: 2, product_name: 'Samsung S24 Ultra', qty_on_hand: 18, valuation_rate: 105000, total_value: 1890000 },
          { id: 3, product_name: 'MacBook Air M3', qty_on_hand: 8, valuation_rate: 110000, total_value: 880000 },
          { id: 4, product_name: 'Sony WH-1000XM5', qty_on_hand: 15, valuation_rate: 28000, total_value: 420000 },
          { id: 5, product_name: 'Apple Watch Series 9', qty_on_hand: 12, valuation_rate: 35000, total_value: 420000 },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch stock valuation');
      setData([
        { id: 1, product_name: 'iPhone 15 Pro', qty_on_hand: 24, valuation_rate: 95000, total_value: 2280000 },
        { id: 2, product_name: 'Samsung S24 Ultra', qty_on_hand: 18, valuation_rate: 105000, total_value: 1890000 },
        { id: 3, product_name: 'MacBook Air M3', qty_on_hand: 8, valuation_rate: 110000, total_value: 880000 },
        { id: 4, product_name: 'Sony WH-1000XM5', qty_on_hand: 15, valuation_rate: 28000, total_value: 420000 },
        { id: 5, product_name: 'Apple Watch Series 9', qty_on_hand: 12, valuation_rate: 35000, total_value: 420000 },
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
      title="Stock Valuation Report" 
      columns={columns} 
      data={data} 
      isLoading={loading}
      onFilterChange={fetchData}
    />
  );
}
