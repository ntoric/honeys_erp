import { db, generateId } from './db';

export async function initPOSData() {
  // 1. Initialize Settings
  const settings = [
    { id: generateId(), key: 'printerSize', value: '3inch', storeId: 'store-default' },
    { id: generateId(), key: 'weighingPrefix', value: '21', storeId: 'store-default' },
    { id: generateId(), key: 'weighingItemCodeCount', value: 5, storeId: 'store-default' },
    { id: generateId(), key: 'weighingWeightCount', value: 5, storeId: 'store-default' },
  ];

  for (const setting of settings) {
    const existing = await db.settings.where('key').equals(setting.key).first();
    if (!existing) {
      await db.settings.add(setting);
    }
  }

  // 2. Add Sample Products if none exist
  const count = await db.products.count();
  if (count === 0) {
    const sampleProducts = [
      {
        id: generateId(),
        sku: 'ELEC-001',
        name: 'Wireless Mouse',
        description: 'Premium wireless mouse',
        productType: 'Simple',
        categoryId: 'cat1',
        storeId: 'store-default',
        section: 'retail' as const,
        itemCode: '00001',
        barcode: '2100001',
        stockQuantity: 50,
        lowStockWarning: true,
        lowStockQuantity: 10,
        salePrice: 1200,
        purchasePrice: 800,
        isActive: true,
        isDraft: false,
      },
      {
        id: generateId(),
        sku: 'GROC-002',
        name: 'Basmati Rice',
        description: 'Premium Basmati Rice',
        productType: 'Simple',
        categoryId: 'cat2',
        storeId: 'store-default',
        section: 'retail' as const,
        itemCode: '00002',
        barcode: '2100002',
        stockQuantity: 100,
        lowStockWarning: true,
        lowStockQuantity: 20,
        salePrice: 150,
        purchasePrice: 100,
        isActive: true,
        isDraft: false,
      },
      {
        id: generateId(),
        sku: 'FRUT-003',
        name: 'Fresh Apples',
        description: 'Fresh red apples',
        productType: 'Simple',
        categoryId: 'cat3',
        storeId: 'store-default',
        section: 'retail' as const,
        itemCode: '00003',
        barcode: '2100003',
        stockQuantity: 200,
        lowStockWarning: true,
        lowStockQuantity: 50,
        salePrice: 220,
        purchasePrice: 160,
        isActive: true,
        isDraft: false,
      }
    ];

    for (const p of sampleProducts) {
      await db.products.add(p);
    }
  }
}
