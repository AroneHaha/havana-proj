<?php

namespace App\Http\Controllers\Customer;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Customer ReviewController — Customer review management.
 *
 * Customers can submit reviews, view their own reviews, and delete them.
 * New reviews default to 'visible' visibility (can be changed by admin moderation).
 */
class ReviewController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * POST /api/reviews
     * Submit a review for a product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Check if user already reviewed this product
        $existingReview = $request->user()
            ->reviews()
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existingReview) {
            return $this->respondError('You have already reviewed this product', 422);
        }

        $review = $request->user()->reviews()->create([
            'product_id' => $validated['product_id'],
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? null,
            'visibility' => 'visible',
        ]);

        $review->load(['product', 'user']);

        // Update product average rating
        $this->updateProductRating($product);

        return $this->respondCreated(new ReviewResource($review), 'Review submitted successfully');
    }

    /**
     * GET /api/reviews
     * List the authenticated user's own reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) ($request->query('per_page', 15));
        $reviews = $request->user()
            ->reviews()
            ->with('product')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => ReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'from' => $reviews->firstItem(),
                'to' => $reviews->lastItem(),
            ],
        ]);
    }

    /**
     * DELETE /api/reviews/{review}
     * Delete the authenticated user's own review.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->user_id !== $request->user()->id) {
            return $this->respondForbidden('This review does not belong to you');
        }

        $product = $review->product;
        $review->delete();

        // Recalculate product average rating
        $this->updateProductRating($product);

        return $this->respondWithMessage('Review deleted successfully');
    }

    /**
     * Recalculate and update the product's average rating.
     */
    private function updateProductRating(Product $product): void
    {
        $avgRating = $product->reviews()
            ->where('visibility', 'visible')
            ->avg('rating') ?? 0;

        $product->update(['rating' => round($avgRating, 1)]);
    }
}
