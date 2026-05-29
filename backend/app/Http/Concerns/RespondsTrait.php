<?php

namespace App\Http\Concerns;

use Illuminate\Http\JsonResponse;

/**
 * RespondsTrait — Standardized API response helpers for all controllers.
 *
 * Every response follows a consistent JSON structure:
 *   Success: { data: {...}, message: "..." }
 *   Error:   { message: "...", errors: {...} }
 *   List:    { data: [...], meta: { current_page, total, ... } }
 */
trait RespondsTrait
{
    /**
     * Success response with data.
     */
    protected function respondWithData(mixed $data, string $message = '', int $status = 200): JsonResponse
    {
        $response = ['data' => $data];
        if ($message) {
            $response['message'] = $message;
        }
        return response()->json($response, $status);
    }

    /**
     * Success response with message only.
     */
    protected function respondWithMessage(string $message, int $status = 200): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }

    /**
     * Created response (201).
     */
    protected function respondCreated(mixed $data, string $message = 'Created successfully'): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'message' => $message,
        ], 201);
    }

    /**
     * No content response (204).
     */
    protected function respondNoContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Error response.
     */
    protected function respondError(string $message, int $status = 400, ?array $errors = null): JsonResponse
    {
        $response = ['message' => $message];
        if ($errors) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $status);
    }

    /**
     * Not found response.
     */
    protected function respondNotFound(string $message = 'Resource not found'): JsonResponse
    {
        return response()->json(['message' => $message], 404);
    }

    /**
     * Forbidden response.
     */
    protected function respondForbidden(string $message = 'Access denied'): JsonResponse
    {
        return response()->json(['message' => $message], 403);
    }

    /**
     * Unauthorized response.
     */
    protected function respondUnauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return response()->json(['message' => $message], 401);
    }

    /**
     * Stats response — flat key-value object.
     * Frontend expects: { total_products: 40, total_value: "1250.000", ... }
     */
    protected function respondWithStats(array $stats): JsonResponse
    {
        return response()->json(['data' => $stats]);
    }
}
