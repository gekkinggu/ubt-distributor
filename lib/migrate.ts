import { productsDb } from '@/lib/db';

export async function migrateProductConditions() {
  try {
    const products = productsDb.getAll();
    
    let updatedCount = 0;
    for (const product of products) {
      // @ts-ignore - Add condition if it doesn't exist
      if (!product.condition) {
        productsDb.update(product._id, { condition: 'terkirim' });
        updatedCount++;
      }
    }
    
    console.log(`Migration complete: ${updatedCount} products updated with condition field`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
}
