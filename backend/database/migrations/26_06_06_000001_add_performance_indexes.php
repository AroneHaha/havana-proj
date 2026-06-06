<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance indexes migration.
 *
 * Adds all missing indexes that were causing sequential scans on Supabase/Postgres.
 * Foreign keys in Postgres are NOT automatically indexed (unlike MySQL) — every FK
 * that appears in a WHERE clause, JOIN, or ORDER BY needs an explicit index.
 *
 * Run: php artisan migrate
 * Rollback: php artisan migrate:rollback
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── products ──────────────────────────────────────────────────────────
        // category_id: FK used in every category filter, never indexed
        // is_active:   filtered on every public product query
        // created_at:  default ORDER BY on all paginated lists
        // stock:       used in low-stock dashboard queries and stock filters
        // Composite indexes cover the most frequent combined filter patterns
        Schema::table('products', function (Blueprint $table) {
            $table->index('category_id',   'idx_products_category_id');
            $table->index('created_at',    'idx_products_created_at');
            $table->index('stock',         'idx_products_stock');

            // Public storefront: active products filtered/sorted
            $table->index(['is_active', 'created_at'],     'idx_products_active_created');
            $table->index(['is_active', 'category_id'],    'idx_products_active_category');
            $table->index(['is_active', 'is_featured'],    'idx_products_active_featured');
            $table->index(['is_active', 'is_best_seller'], 'idx_products_active_bestseller');
            $table->index(['is_active', 'is_new'],         'idx_products_active_new');

            // Admin stock alert queries
            $table->index(['stock', 'is_active'], 'idx_products_stock_active');
        });

        // ── orders ────────────────────────────────────────────────────────────
        // user_id:    customer order list scopes every query to a user
        // status:     admin filters by status constantly
        // created_at: default sort on all paginated order lists
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id',    'idx_orders_user_id');
            $table->index('status',     'idx_orders_status');
            $table->index('created_at', 'idx_orders_created_at');

            // Customer order list: WHERE user_id = ? ORDER BY created_at DESC
            $table->index(['user_id',  'created_at'], 'idx_orders_user_created');
            // Admin filter: WHERE status = ? ORDER BY created_at DESC
            $table->index(['status', 'created_at'],   'idx_orders_status_created');
            // Sales page excludes cancelled+pending: WHERE status NOT IN (...)
            $table->index(['status', 'user_id'],      'idx_orders_status_user');
        });

        // ── order_items ───────────────────────────────────────────────────────
        // order_id:   loaded with every Order via hasMany — no index = full scan
        // product_id: used in sales filter (whereHas items where product_id = ?)
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id',   'idx_order_items_order_id');
            $table->index('product_id', 'idx_order_items_product_id');
        });

        // ── reviews ───────────────────────────────────────────────────────────
        // product_id + visibility: the reviews_count accessor filters by both
        // user_id: used in review ownership checks
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('product_id',              'idx_reviews_product_id');
            $table->index('user_id',                 'idx_reviews_user_id');
            $table->index('visibility',              'idx_reviews_visibility');
            $table->index(['product_id', 'visibility'], 'idx_reviews_product_visibility');
            $table->index(['user_id',    'product_id'], 'idx_reviews_user_product');
            $table->index('created_at',              'idx_reviews_created_at');
        });

        // ── order_status_history ──────────────────────────────────────────────
        // order_id: loaded via hasMany on every order show/update — no index = scan
        Schema::table('order_status_history', function (Blueprint $table) {
            $table->index('order_id',   'idx_order_status_history_order_id');
            $table->index('changed_by', 'idx_order_status_history_changed_by');
        });

        // ── delivery_addresses ────────────────────────────────────────────────
        // user_id: every address lookup is scoped to a user
        Schema::table('delivery_addresses', function (Blueprint $table) {
            $table->index('user_id',              'idx_delivery_addresses_user_id');
            $table->index(['user_id', 'is_default'], 'idx_delivery_addresses_user_default');
        });

        // ── cart_items ────────────────────────────────────────────────────────
        // user_id: cart is always loaded per-user (the unique constraint doesn't
        //   help ORDER BY / range queries; a plain index does)
        // Note: (user_id, product_id) unique constraint already creates an index
        //   in Postgres, so we only need the standalone user_id index for queries
        //   that don't include product_id in the WHERE clause.
        Schema::table('cart_items', function (Blueprint $table) {
            $table->index('user_id',    'idx_cart_items_user_id');
            $table->index('product_id', 'idx_cart_items_product_id');
        });

        // ── users ─────────────────────────────────────────────────────────────
        // role: observers call User::where('role','admin') on every order + stock
        //   change — without an index this scans the whole users table each time.
        // email is already unique (implicitly indexed).
        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'idx_users_role');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_category_id');
            $table->dropIndex('idx_products_created_at');
            $table->dropIndex('idx_products_stock');
            $table->dropIndex('idx_products_active_created');
            $table->dropIndex('idx_products_active_category');
            $table->dropIndex('idx_products_active_featured');
            $table->dropIndex('idx_products_active_bestseller');
            $table->dropIndex('idx_products_active_new');
            $table->dropIndex('idx_products_stock_active');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user_id');
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_user_created');
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_status_user');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_product_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_product_id');
            $table->dropIndex('idx_reviews_user_id');
            $table->dropIndex('idx_reviews_visibility');
            $table->dropIndex('idx_reviews_product_visibility');
            $table->dropIndex('idx_reviews_user_product');
            $table->dropIndex('idx_reviews_created_at');
        });

        Schema::table('order_status_history', function (Blueprint $table) {
            $table->dropIndex('idx_order_status_history_order_id');
            $table->dropIndex('idx_order_status_history_changed_by');
        });

        Schema::table('delivery_addresses', function (Blueprint $table) {
            $table->dropIndex('idx_delivery_addresses_user_id');
            $table->dropIndex('idx_delivery_addresses_user_default');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex('idx_cart_items_user_id');
            $table->dropIndex('idx_cart_items_product_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
        });
    }
};
