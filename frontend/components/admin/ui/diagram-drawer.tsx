"use client";

import { useEffect, useRef } from "react";
import { X, Database, Key, Link2, ArrowRight, Table2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";

interface Column {
  name: string;
  type: string;
  pk?: boolean;
  fk?: { table: string };
  nullable?: boolean;
  default?: string;
}

interface TableData {
  name: string;
  columns: Column[];
  color: string;
}

const tables: TableData[] = [
  {
    name: "USERS",
    color: "from-blue-500 to-blue-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "first_name", type: "STRING" },
      { name: "last_name", type: "STRING" },
      { name: "email", type: "STRING" },
      { name: "password", type: "STRING" },
      { name: "phone", type: "STRING", nullable: true },
      { name: "role", type: "STRING" },
      { name: "avatar", type: "STRING", nullable: true },
      { name: "email_verified_at", type: "TIMESTAMP", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
      { name: "deleted_at", type: "TIMESTAMP", nullable: true },
    ],
  },
  {
    name: "CATEGORIES",
    color: "from-emerald-500 to-emerald-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "name_en", type: "STRING" },
      { name: "name_ar", type: "STRING" },
      { name: "slug", type: "STRING" },
      { name: "image", type: "STRING", nullable: true },
      { name: "is_active", type: "BOOLEAN", default: "true" },
      { name: "sort_order", type: "INTEGER", default: "0" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
      { name: "deleted_at", type: "TIMESTAMP", nullable: true },
    ],
  },
  {
    name: "PRODUCTS",
    color: "from-purple-500 to-purple-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "category_id", type: "UUID", fk: { table: "CATEGORIES" } },
      { name: "name_en", type: "STRING" },
      { name: "name_ar", type: "STRING" },
      { name: "description_en", type: "TEXT" },
      { name: "description_ar", type: "TEXT" },
      { name: "slug", type: "STRING" },
      { name: "price", type: "DECIMAL(10,3)" },
      { name: "sale_price", type: "DECIMAL(10,3)", nullable: true },
      { name: "image", type: "STRING" },
      { name: "images", type: "JSON", nullable: true },
      { name: "sku", type: "STRING", nullable: true },
      { name: "stock", type: "INTEGER", default: "0" },
      { name: "rating", type: "DECIMAL(2,1)", default: "0.0" },
      { name: "is_featured", type: "BOOLEAN", default: "false" },
      { name: "is_best_seller", type: "BOOLEAN", default: "false" },
      { name: "is_new", type: "BOOLEAN", default: "false" },
      { name: "is_active", type: "BOOLEAN", default: "true" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
      { name: "deleted_at", type: "TIMESTAMP", nullable: true },
    ],
  },
  {
    name: "CART_ITEMS",
    color: "from-amber-500 to-amber-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: { table: "USERS" } },
      { name: "product_id", type: "UUID", fk: { table: "PRODUCTS" } },
      { name: "quantity", type: "INTEGER", default: "1" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "REVIEWS",
    color: "from-rose-500 to-rose-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "product_id", type: "UUID", fk: { table: "PRODUCTS" } },
      { name: "user_id", type: "UUID", fk: { table: "USERS" } },
      { name: "rating", type: "INTEGER" },
      { name: "title", type: "STRING", nullable: true },
      { name: "comment", type: "TEXT" },
      { name: "visibility", type: "STRING", default: "pending" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "ORDERS",
    color: "from-maroon to-maroon-light",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: { table: "USERS" } },
      { name: "order_number", type: "STRING" },
      { name: "status", type: "STRING", default: "pending" },
      { name: "subtotal", type: "DECIMAL(10,3)" },
      { name: "shipping_cost", type: "DECIMAL(10,3)", default: "0" },
      { name: "discount", type: "DECIMAL(10,3)", default: "0" },
      { name: "total", type: "DECIMAL(10,3)" },
      { name: "payment_method", type: "STRING" },
      { name: "payment_status", type: "STRING", default: "pending" },
      { name: "shipping_address", type: "TEXT" },
      { name: "shipping_phone", type: "STRING" },
      { name: "notes", type: "TEXT", nullable: true },
      { name: "confirmed_at", type: "TIMESTAMP", nullable: true },
      { name: "delivered_at", type: "TIMESTAMP", nullable: true },
      { name: "cancelled_at", type: "TIMESTAMP", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
      { name: "deleted_at", type: "TIMESTAMP", nullable: true },
    ],
  },
  {
    name: "ORDER_ITEMS",
    color: "from-orange-500 to-orange-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "order_id", type: "UUID", fk: { table: "ORDERS" } },
      { name: "product_id", type: "UUID", fk: { table: "PRODUCTS" } },
      { name: "product_name", type: "STRING" },
      { name: "product_image", type: "STRING" },
      { name: "price", type: "DECIMAL(10,3)" },
      { name: "quantity", type: "INTEGER" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "ORDER_STATUS_HISTORY",
    color: "from-teal-500 to-teal-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "order_id", type: "UUID", fk: { table: "ORDERS" } },
      { name: "status", type: "STRING" },
      { name: "changed_by", type: "UUID", fk: { table: "USERS" }, nullable: true },
      { name: "note", type: "TEXT", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "DELIVERY_ADDRESSES",
    color: "from-cyan-500 to-cyan-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: { table: "USERS" } },
      { name: "full_address", type: "STRING" },
      { name: "area", type: "STRING" },
      { name: "block", type: "STRING" },
      { name: "street", type: "STRING" },
      { name: "building", type: "STRING" },
      { name: "floor", type: "STRING", nullable: true },
      { name: "apartment", type: "STRING", nullable: true },
      { name: "latitude", type: "DECIMAL(10,3)", nullable: true },
      { name: "longitude", type: "DECIMAL(10,3)", nullable: true },
      { name: "is_default", type: "BOOLEAN", default: "false" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "NOTIFICATIONS",
    color: "from-indigo-500 to-indigo-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: { table: "USERS" }, nullable: true },
      { name: "type", type: "STRING" },
      { name: "title_en", type: "STRING" },
      { name: "title_ar", type: "STRING" },
      { name: "body_en", type: "TEXT" },
      { name: "body_ar", type: "TEXT" },
      { name: "data", type: "JSON", nullable: true },
      { name: "is_read", type: "BOOLEAN", default: "false" },
      { name: "read_at", type: "TIMESTAMP", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "PASSWORD_RESETS",
    color: "from-slate-500 to-slate-600",
    columns: [
      { name: "email", type: "STRING", pk: true },
      { name: "token", type: "STRING" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "WISHLIST",
    color: "from-pink-500 to-pink-600",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: { table: "USERS" } },
      { name: "product_id", type: "UUID", fk: { table: "PRODUCTS" } },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
];

// Relationship lines (FK → PK connections)
const relationships: { from: string; to: string; label: string }[] = [
  { from: "PRODUCTS", to: "CATEGORIES", label: "category_id" },
  { from: "CART_ITEMS", to: "USERS", label: "user_id" },
  { from: "CART_ITEMS", to: "PRODUCTS", label: "product_id" },
  { from: "REVIEWS", to: "PRODUCTS", label: "product_id" },
  { from: "REVIEWS", to: "USERS", label: "user_id" },
  { from: "ORDERS", to: "USERS", label: "user_id" },
  { from: "ORDER_ITEMS", to: "ORDERS", label: "order_id" },
  { from: "ORDER_ITEMS", to: "PRODUCTS", label: "product_id" },
  { from: "ORDER_STATUS_HISTORY", to: "ORDERS", label: "order_id" },
  { from: "ORDER_STATUS_HISTORY", to: "USERS", label: "changed_by" },
  { from: "DELIVERY_ADDRESSES", to: "USERS", label: "user_id" },
  { from: "NOTIFICATIONS", to: "USERS", label: "user_id" },
  { from: "WISHLIST", to: "USERS", label: "user_id" },
  { from: "WISHLIST", to: "PRODUCTS", label: "product_id" },
];

function TableCard({ table }: { table: TableData }) {
  const pkCols = table.columns.filter((c) => c.pk);
  const fkCols = table.columns.filter((c) => c.fk);
  const otherCols = table.columns.filter((c) => !c.pk && !c.fk);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card-hover hover:shadow-elevated-hover transition-all duration-300">
      {/* Header */}
      <div className={`bg-gradient-to-r ${table.color} px-4 py-2.5 flex items-center gap-2`}>
        <Table2 className="h-4 w-4 text-white/90" />
        <span className="text-sm font-bold text-white tracking-wide">{table.name}</span>
        <span className="ml-auto text-[10px] font-medium text-white/70 bg-white/15 rounded-full px-2 py-0.5">
          {table.columns.length} cols
        </span>
      </div>

      {/* Columns */}
      <div className="divide-y divide-border/50">
        {pkCols.map((col) => (
          <div key={col.name} className="flex items-center gap-2 px-4 py-1.5 bg-maroon/[0.03] dark:bg-gold/[0.04]">
            <Key className="h-3 w-3 text-maroon dark:text-gold flex-shrink-0" />
            <span className="text-xs font-semibold text-foreground">{col.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground font-mono">{col.type}</span>
            <span className="text-[9px] font-bold text-maroon dark:text-gold bg-maroon/10 dark:bg-gold/10 rounded px-1.5 py-0.5 uppercase tracking-wider">PK</span>
          </div>
        ))}
        {fkCols.map((col) => (
          <div key={col.name} className="flex items-center gap-2 px-4 py-1.5">
            <Link2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-medium text-foreground">{col.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground font-mono">{col.type}</span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded px-1.5 py-0.5">
              → {col.fk!.table}
            </span>
            {col.nullable && <span className="text-[9px] text-muted-foreground">NULL</span>}
          </div>
        ))}
        {otherCols.map((col) => (
          <div key={col.name} className="flex items-center gap-2 px-4 py-1.5">
            <span className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs text-foreground">{col.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground font-mono">{col.type}</span>
            {col.nullable && <span className="text-[9px] text-muted-foreground">NULL</span>}
            {col.default && (
              <span className="text-[9px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono">
                {col.default}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RelationshipList() {
  // Group relationships by source table
  const grouped: Record<string, typeof relationships> = {};
  for (const rel of relationships) {
    if (!grouped[rel.from]) grouped[rel.from] = [];
    grouped[rel.from].push(rel);
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([fromTable, rels]) => {
        const table = tables.find((t) => t.name === fromTable);
        return (
          <div key={fromTable} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${table?.color || "from-gray-400 to-gray-500"}`} />
              <span className="text-xs font-bold text-foreground">{fromTable}</span>
              <span className="text-[10px] text-muted-foreground">references</span>
            </div>
            <div className="space-y-1.5 pl-4.5">
              {rels.map((rel) => {
                const targetTable = tables.find((t) => t.name === rel.to);
                return (
                  <div key={`${rel.from}-${rel.to}-${rel.label}`} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-mono">{rel.label}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${targetTable?.color || "from-gray-400 to-gray-500"}`} />
                    <span className="font-medium text-foreground">{rel.to}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DiagramDrawer() {
  const isOpen = useUIStore((s) => s.isDiagramDrawerOpen);
  const close = useUIStore((s) => s.closeDiagramDrawer);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-3xl z-50 bg-background border-l border-border shadow-drawer overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-maroon to-maroon-light dark:from-gold dark:to-gold-light">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-foreground">ER / AR Diagrams</h2>
                    <p className="text-xs text-muted-foreground">
                      Entity-Relationship &amp; Application Architecture
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Table2 className="h-3.5 w-3.5" />
                  <span><span className="font-semibold text-foreground">{tables.length}</span> Tables</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" />
                  <span><span className="font-semibold text-foreground">{relationships.length}</span> Relations</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Key className="h-3.5 w-3.5" />
                  <span><span className="font-semibold text-foreground">{tables.reduce((acc, t) => acc + t.columns.filter((c) => c.pk).length, 0)}</span> Primary Keys</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Entity-Relationship Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 rounded-full bg-maroon dark:bg-gold" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Entity Tables</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tables.map((table) => (
                    <TableCard key={table.name} table={table} />
                  ))}
                </div>
              </section>

              {/* Relationships Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Relationships (FK → PK)</h3>
                </div>
                <RelationshipList />
              </section>

              {/* Architecture Overview */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Application Architecture</h3>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  {/* Frontend Layer */}
                  <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Frontend — Next.js + React</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {["Pages Router", "Tailwind CSS 4", "shadcn/ui", "Zustand", "Framer Motion", "i18n (EN/AR)", "next-themes"].map((tech) => (
                        <span key={tech} className="text-[10px] font-medium text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full px-2.5 py-1">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                      <div className="h-4 w-px bg-border" />
                      <ArrowRight className="h-4 w-4 rotate-90" />
                      <div className="h-4 w-px bg-border" />
                    </div>
                  </div>

                  {/* API Layer */}
                  <div className="rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">API — Laravel 12</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {["REST API", "Sanctum Auth", "Resource Collections", "Form Requests", "Policy Authorization", "Broadcasting"].map((tech) => (
                        <span key={tech} className="text-[10px] font-medium text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full px-2.5 py-1">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                      <div className="h-4 w-px bg-border" />
                      <ArrowRight className="h-4 w-4 rotate-90" />
                      <div className="h-4 w-px bg-border" />
                    </div>
                  </div>

                  {/* Database Layer */}
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Database — Supabase (PostgreSQL)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {["PostgreSQL 16", "Row Level Security", "S3 Storage", "Realtime Subscriptions", "UUID Primary Keys", "Soft Deletes"].map((tech) => (
                        <span key={tech} className="text-[10px] font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-2.5 py-1">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
