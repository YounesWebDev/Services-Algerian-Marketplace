<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth','verified','role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (){
        Route::get('/dashboard' , [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class)->except(['show']);
    });