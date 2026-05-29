<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

abstract class Controller
{
    /**
     * Get the case-insensitive LIKE operator for the current database driver.
     * PostgreSQL uses 'ilike', SQLite/MySQL use 'like' (MySQL is case-insensitive by default).
     */
    protected function ilike(): string
    {
        return DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
    }
}
