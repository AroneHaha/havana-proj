<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\Admin\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin ReviewController — Review moderation + stats for admin dashboard.
 *
 * Note: Review model does NOT use SoftDeletes, so destroy uses force delete.
 */
class ReviewController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * GET /api/admin/reviews/stats
     * Review statistics for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $averageRating = Review::avg('rating') ?? 0;
        $totalReviews = Review::count();

        $ratingDistribution = Review::select('rating', DB::raw('COUNT(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Ensure all ratings 1-5 are present
        $ratingDistribution = array_merge(
            [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
            $ratingDistribution
        );

        // Sort by key
        ksort($ratingDistribution);

        return $this->respondWithStats([
            'average_rating' => round((float) $averageRating, 1),
            'total_reviews' => $totalReviews,
            'rating_distribution' => $ratingDistribution,
        ]);
    }

    /**
     * GET /api/admin/reviews
     * Paginated review list with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['product', 'user']);

        // Search by title, comment, or product name
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('comment', 'ilike', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name_en', 'ilike', "%{$search}%")
                            ->orWhere('name_ar', 'ilike', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('first_name', 'ilike', "%{$search}%")
                            ->orWhere('last_name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        // Filter by product
        if ($productId = $request->query('product_id')) {
            $query->where('product_id', $productId);
        }

        // Filter by rating
        if ($rating = $request->query('rating')) {
            $query->where('rating', (int) $rating);
        }

        // Filter by visibility
        if ($visibility = $request->query('visibility')) {
            $query->where('visibility', $visibility);
        }

        // Filter by date range (from)
        if ($dateFrom = $request->query('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }

        // Filter by date range (to)
        if ($dateTo = $request->query('date_to')) {
            $query->where('created_at', '<=', $dateTo);
        }

        $perPage = (int) ($request->query('per_page', 15));
        $reviews = $query->orderByDesc('created_at')->paginate($perPage);

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
     * GET /api/admin/reviews/{review}
     * Single review detail with product and user.
     */
    public function show(Review $review): JsonResponse
    {
        $review->load(['product', 'user']);

        return $this->respondWithData(new ReviewResource($review));
    }

    /**
     * PATCH /api/admin/reviews/{review}/status
     * Update review visibility (visible, hidden, pending).
     */
    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'visibility' => ['required', 'string', 'in:visible,hidden,pending'],
        ]);

        $review->update(['visibility' => $validated['visibility']]);

        $review->load(['product', 'user']);

        return $this->respondWithData(new ReviewResource($review), 'Review status updated successfully');
    }

    /**
     * DELETE /api/admin/reviews/{review}
     * Delete a review (Review model does NOT use SoftDeletes).
     */
    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return $this->respondWithMessage('Review deleted successfully');
    }
}
