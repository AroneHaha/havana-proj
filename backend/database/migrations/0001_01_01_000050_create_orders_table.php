<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->string('status')->default('pending'); // pending, confirmed, preparing, out_for_delivery, delivered, cancelled
            $table->decimal('subtotal', 10, 3);
            $table->decimal('shipping_cost', 10, 3)->default(0);
            $table->decimal('discount', 10, 3)->default(0);
            $table->decimal('total', 10, 3);
            $table->string('payment_method')->default('cash_on_delivery'); // cash_on_delivery is the only method
            $table->string('payment_status')->default('pending'); // pending, paid, failed, refunded
            $table->text('shipping_address');
            $table->string('shipping_phone');
            $table->text('notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
